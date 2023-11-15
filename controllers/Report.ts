import {Request, Response} from 'express'
const axios = require('axios');
const excelJS = require("exceljs");

import { Metadata } from "../entity/Metadata"
import { Report } from "../entity/Report"

import {myDataSource}  from "../config/ormconfig"
import { comboAssociativeArray, rarityCardsPowerUpNeeded, triselsCost } from '../utils';

export const getReport = async (req: Request, res: Response) => {
  const reports = await myDataSource
    .getRepository(Report)
    .createQueryBuilder('r')
    .select(['r.id AS id', 'r.name AS name',  'r.foil AS foil', 'r.rarity as rarity', 'r.trait as trait', 'r.standardPrice as standardPrice','r.standardXMultiplierPrice as standardXMultiplierPrice', 'r.altCPrice as altCPrice', 'r.altBPrice as altBPrice', 'r.altAPrice as altAPrice', 'r.altSPrice as altSPrice', 'r.altCProfit as altCProfit', 'r.altBProfit as altBProfit', 'r.altAProfit as altAProfit', 'r.altSProfit as altSProfit', 'r.averageProfit as averageProfit', 'r.averageProfitPerTrisel as averageProfitPerTrisel',])
    .orderBy('r.id', 'ASC')
    .getRawMany()

    // console.log(reports, 'reports')

    const workbook = new excelJS.Workbook();  // Create a new workbook  
    const worksheet = workbook.addWorksheet("Reports prices"); // New Worksheet  
    const path = "./files";  // Path to download excel  
    const date = new Date()
    const formatedDate = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`
    
    // Column for data in excel. key must match data key
    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Name", key: "name", width: 20 },
      { header: "Foil", key: "foil", width: 10 },
      { header: "Standard price", key: "standardPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Standard x Multiplier", key: "standardXMultiplierPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. C Price", key: "altCPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. C Profit", key: "altCProfit", width: 25, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. B Price", key: "altBPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. B Profit", key: "altBProfit", width: 25, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. A Price", key: "altAPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. A Profit", key: "altAProfit", width: 25, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. S Price", key: "altSPrice", width: 20, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Alt. S Profit", key: "altSProfit", width: 25, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Average Profit", key: "averageProfit", width: 25, style: { numFmt: '# ##0.00', bold: true } },
      { header: "Average Profit / Trisel", key: "averageProfitPerTrisel", width: 25, style: { numFmt: '# ##0.00000', bold: true } },
      { header: "Rarity", key: "rarity", width: 10 },
      { header: "Trait", key: "trait", width: 10 },
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
    .andWhere('m.rarity not in (:...rarity)', {rarity: ['EXCLUSIVE', 'UNIQUE']})
    .andWhere('m.name != "Hannibal & Honora"')
    .andWhere('m.name != "Hannibal + Honora"')
    // .andWhere('m.id = :id', {id: 92})
    .orderBy('m.ian', 'ASC')
    // .limit(1)
    .getMany()

    
    for (const meta of metadatas) {
      
      let alternativePrice = 0
      let standardPrice = 0
      let alts = []
      let stands = []

      if (meta?.id) {

        // Already exist in db ?
        let existantReport = await myDataSource
        .getRepository(Report)
        .createQueryBuilder('report')
        .where('report.name = :name', {name: meta.name})
        .andWhere('report.foil = :foil', {foil: meta.foil})
        .getOne()


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
        let standardXMultiplierPrice = standardPrice * rarityCardsPowerUpNeeded[meta.rarity]
        let altCProfit = altCPrice ? altCPrice - standardXMultiplierPrice : null
        let altBProfit = altBPrice ? altBPrice - standardXMultiplierPrice : null
        let altAProfit = altAPrice ? altAPrice - standardXMultiplierPrice : null
        let altSProfit = altSPrice ? altSPrice - standardXMultiplierPrice : null

        let averageProfit = ((altCProfit * 60) + (altBProfit * 27.5) + (altAProfit * 10.5) + (altSProfit * 2)) / 100
        let averageProfitPerTrisel = averageProfit / triselsCost[meta.rarity]
        

        if (!existantReport) {
          let report: Report = new Report()
          report.name = meta.name
          report.foil = meta.foil
          report.rarity = meta.rarity
          report.trait = meta.trait
          report.standardPrice = standardPrice
          report.standardXMultiplierPrice = standardXMultiplierPrice
          report.altCPrice = altCPrice
          report.altBPrice = altBPrice
          report.altAPrice = altAPrice
          report.altSPrice = altSPrice
          report.altCProfit = altCProfit
          report.altBProfit = altBProfit
          report.altAProfit = altAProfit
          report.altSProfit = altSProfit
          
          if (altCProfit && altBProfit && altAProfit && altSProfit) {
            report.averageProfit = ((altCProfit * 60) + (altBProfit * 27.5) + (altAProfit * 10.5) + (altSProfit * 2)) / 100
            report.averageProfitPerTrisel = averageProfitPerTrisel
          }  
         
          await Report.save(report)
        } else {
          await Report.update(existantReport.id, {
            standardPrice: standardPrice,
            standardXMultiplierPrice: standardXMultiplierPrice,
            altCPrice: altCPrice,
            altBPrice: altBPrice,
            altAPrice: altAPrice,
            altSPrice: altSPrice,
            altCProfit: altCProfit,
            altBProfit: altBProfit,
            altAProfit: altAProfit,
            altSProfit: altSProfit,
            averageProfit: ((altCProfit * 60) + (altBProfit * 27.5) + (altAProfit * 10.5) + (altSProfit * 2)) / 100,
            averageProfitPerTrisel: averageProfit / triselsCost[meta.rarity]
          })
        }
      }
        
    }

  res.json({metadatas, 'length': metadatas.length})
}