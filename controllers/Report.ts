import {Request, Response} from 'express'
const axios = require('axios');
const excelJS = require("exceljs");

import { Metadata } from "../entity/Metadata"
import { Report } from "../entity/Report"

import {myDataSource}  from "../config/ormconfig"
import { comboAssociativeArray, rarityCardsPowerUpNeeded } from '../utils';

export const getReport = async (req: Request, res: Response) => {
  const reports = await myDataSource
    .getRepository(Report)
    .createQueryBuilder('r')
    .innerJoinAndSelect('r.metadata', 'm')
    .select(['m.id AS id', 'm.ian AS ian', 'm.name AS name',  'm.foil AS foil', 'm.power as power', 'm.rarity as rarity', 'm.rank as rank', 'm.grade as grade', 'm.trait as trait', 'm.lastMinActivePrice as floorPrice', 'r.alternativePrice as alternativePrice', 'r.standardPrice as standardPrice', 'r.alternativePriceDiff as alternativePriceDiff'])
    .orderBy('r.alternativePriceDiff', 'DESC')
    .getRawMany()

    // console.log(reports, 'reports')

    const workbook = new excelJS.Workbook();  // Create a new workbook  
    const worksheet = workbook.addWorksheet("Reports prices"); // New Worksheet  
    const path = "./files";  // Path to download excel  
    const date = new Date()
    const formatedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`

    console.log(date, 'date')
    
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 }, 
      { header: "IAN", key: "ian", width: 15 }, 
      { header: "Name", key: "name", width: 20 },
      { header: "Foil", key: "foil", width: 10 },
      { header: "Power", key: "power", width: 10 },
      { header: "Rarity", key: "rarity", width: 10 },
      { header: "Rank", key: "rank", width: 10 },
      { header: "Grade", key: "grade", width: 10 },
      { header: "Trait", key: "trait", width: 10 },
      { header: "Floor Price", key: "floorPrice", width: 20, style: { numFmt: '# ##0', bold: true } },
      { header: "Alternative's Prices", key: "alternativePrice", width: 20, style: { numFmt: '# ##0', bold: true } },
      { header: "Standard's Prices", key: "standardPrice", width: 20, style: { numFmt: '# ##0', bold: true } },
      { header: "Alternative's Prices Diff", key: "alternativePriceDiff", width: 25, style: { numFmt: '# ##0.00', bold: true } },
  ]

  reports.forEach((report) => {  
    worksheet.addRow(report)
    // Add data in worksheet 
  });
  
  // Making first line in excel bold  
  worksheet.getRow(1).eachCell(
    (cell) => {  
      cell.font = { bold: true };
    })

  try {  
    const data = await workbook.xlsx.writeFile(`${path}/report_${formatedDate}.xlsx`)
    .then(() => {     
      res.send({       
        status: "success",       
        message: "file successfully downloaded",
        path: `${path}/report_${formatedDate}.xlsx`,      
      })
    })
  } 
  catch (err) {    
    res.send({    
      status: "error",    
      message: "Something went wrong",  
    })
  }
  
}

export const makeReport = async (req: Request, res: Response) => {
    
  const metadatas = await myDataSource
    .getRepository(Metadata)
    .createQueryBuilder('m')
    .where('m.advancement = "ALTERNATIVE"')
    .andWhere('m.lastMinActivePrice is not NULL')
    .andWhere('m.rarity not in (:...rarity)', {rarity: ['EXCLUSIVE']})
    .andWhere('m.name != "Hannibal & Honora"')
    .andWhere('m.name != "Hannibal + Honora"')
    // .andWhere('m.id = :id', {id: 2187})
    // .limit(1)
    .getMany()

    
    for (const meta of metadatas) {
      
      let alternativePrice = 0
      let standardPrice = 0
      let alts = []
      let stands = []

      if (meta?.id) {

        let existantReport = await myDataSource
        .getRepository(Report)
        .createQueryBuilder('report')
        .where('report.name = :name', {name: meta.name})
        .andWhere('report.foil = :foil', {foil: meta.foil})
        .getOne()

        if (!existantReport) {

          let standardMeta = await myDataSource
          .getRepository(Metadata)
          .createQueryBuilder('m')
          .where('m.name = :name', {name: meta.name})
          .andWhere('m.foil = :foil', {foil: meta.foil})
          .andWhere('m.rarity = :rarity', {rarity: meta.rarity})
          .andWhere('m.advancement = "STANDARD"')
          .andWhere('m.rank = 1')
          .andWhere('m.lastMinActivePrice is not NULL')
          .getOne()
  
          standardPrice = standardMeta?.lastMinActivePrice


          let alternativeMetas = await myDataSource
          .getRepository(Metadata)
          .createQueryBuilder('m')
          .where('m.name = :name', {name: meta.name})
          .andWhere('m.foil = :foil', {foil: meta.foil})
          .andWhere('m.rarity = :rarity', {rarity: meta.rarity})
          .andWhere('m.advancement = "ALTERNATIVE"')
          .andWhere('m.lastMinActivePrice is not NULL')
          .getMany()


          let altCPrice = alternativeMetas.find((alt) => alt.grade === 'C')?.lastMinActivePrice
          let altBPrice = alternativeMetas.find((alt) => alt.grade === 'B')?.lastMinActivePrice
          let altAPrice = alternativeMetas.find((alt) => alt.grade === 'A')?.lastMinActivePrice
          let altSPrice = alternativeMetas.find((alt) => alt.grade === 'S')?.lastMinActivePrice





          let report: Report = new Report()
          report.name = meta.name
          report.foil = meta.foil
          report.standardPrice = standardPrice
          report.standardXMultiplierPrice = standardPrice * rarityCardsPowerUpNeeded[meta.rarity]
          report.altCPrice = altCPrice
          report.altBPrice = altBPrice
          report.altAPrice = altAPrice
          report.altSPrice = altSPrice
          report.altCProfit = altCPrice ? altCPrice - standardPrice : null
          report.altBProfit = altBPrice ? altBPrice - standardPrice : null
          report.altAProfit = altAPrice ? altAPrice - standardPrice : null
          report.altSProfit = altSPrice ? altSPrice - standardPrice : null
          
          if (report.altCProfit && report.altBProfit && report.altAProfit && report.altSProfit) {
            report.averageProfit = (report.altCProfit + report.altBProfit + report.altAProfit + report.altSProfit) / 4
            report.totalProfit = report.averageProfit - report.standardXMultiplierPrice
          }          
         
          await Report.save(report)
        }
      }
        
    }

  res.json({metadatas, 'length': metadatas.length})
}