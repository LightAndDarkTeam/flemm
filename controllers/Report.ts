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
    .where('m.advancement = "COMBO"')
    .andWhere('m.lastMinActivePrice is not NULL')
    .andWhere('m.rarity not in (:...rarity)', {rarity: ['EXCLUSIVE']})
    .andWhere('m.name != "Hannibal & Honora"')
    .andWhere('m.name != "Hannibal + Honora"')
    // .andWhere('m.id = :id', {id: 2187})
    .getMany()

    
    for (const meta of metadatas) {
      let associativeValue: {'alternative': [number], 'standard': [number]} = comboAssociativeArray[meta.ian]
      
      let alternativePrice = 0
      let standardPrice = 0
      let alts = []
      let stands = []

      // console.log(meta.id, 'meta.id')

      if (associativeValue.alternative.length > 0) {

        for (const [index, ian] of associativeValue.alternative.entries()) {
          // Alternative Part
          let alt = await myDataSource
            .getRepository(Metadata)
            .createQueryBuilder('m')
            .where('m.ian = :ian', {ian})
            .andWhere('m.grade = :grade', {grade: meta.grade})
            .andWhere('m.foil = :foil', {foil: meta.foil})
            .andWhere('m.lastMinActivePrice is not NULL')
            .getOne()

            if (alt) {
              alts[index] = alt
            }
        }


        // console.log(alts, 'alts')
        // console.log(alts.length, 'alts.length')
        // console.log(associativeValue.alternative.length, 'associativeValue.alternative.length')
        if (alts.length === associativeValue.alternative.length) {
          alternativePrice = alts.reduce((a, b) => a + b.lastMinActivePrice, 0)
        }

      }

      if (associativeValue.standard.length > 0) {

        for (const [index, ian] of associativeValue.standard.entries()) {
          // Standard Part
          let stand = await myDataSource
            .getRepository(Metadata)
            .createQueryBuilder('m')
            .where('m.ian = :ian', {ian})
            .andWhere('m.foil = :foil', {foil: meta.foil})
            .andWhere('m.lastMinActivePrice is not NULL')
            .andWhere('m.rank = 1')
            .getOne()

          if (stand) {
            stands[index] = stand
          }
        }
        


        if (stands.length === associativeValue.standard.length) {


          standardPrice = stands.reduce((a, b) => {
            
            let multiplier = rarityCardsPowerUpNeeded[b.rarity]
            
            return (a + (b.lastMinActivePrice * multiplier))
            
          }, 0)
        }
      }

      // Alternative Part
      // let alt1 = await myDataSource
      //   .getRepository(Metadata)
      //   .createQueryBuilder('m')
      //   .where('m.ian = :ian', {ian: associativeValue.alternative[0]})
      //   .andWhere('m.grade = :grade', {grade: meta.grade})
      //   .andWhere('m.foil = :foil', {foil: meta.foil})
      //   .getOne()

      // let alt2 = await myDataSource
      //   .getRepository(Metadata)
      //   .createQueryBuilder('m')
      //   .where('m.ian = :ian', {ian: associativeValue.alternative[1]})
      //   .andWhere('m.grade = :grade', {grade: meta.grade})
      //   .andWhere('m.foil = :foil', {foil: meta.foil})
      //   .getOne()

      // if (alt1?.lastMinActivePrice && alt2?.lastMinActivePrice) {
      //   if (alt1?.lastMinActivePrice >= 0 && alt2?.lastMinActivePrice >= 0) {
      //     alternativePrice = alt1.lastMinActivePrice + alt2.lastMinActivePrice
      //   }
      // }
      
      // Standard Part
      // let stand1 = await myDataSource
      //   .getRepository(Metadata)
      //   .createQueryBuilder('m')
      //   .where('m.ian = :ian', {ian: associativeValue.standard[0]})
      //   .andWhere('m.foil = :foil', {foil: meta.foil})
      //   .andWhere('m.rank = 1')
      //   .getOne()

      // let stand2 = await myDataSource
      //   .getRepository(Metadata)
      //   .createQueryBuilder('m')
      //   .where('m.ian = :ian', {ian: associativeValue.standard[1]})
      //   .andWhere('m.foil = :foil', {foil: meta.foil})
      //   .andWhere('m.rank = 1')
      //   .getOne()

      // if (stand1?.lastMinActivePrice && stand2?.lastMinActivePrice ) {
      //   if (stand1?.lastMinActivePrice >= 0 && stand2?.lastMinActivePrice >= 0) {
      //     standardPrice = (stand1.lastMinActivePrice * rarityCardsPowerUpNeeded[meta.rarity]) + (stand2.lastMinActivePrice * rarityCardsPowerUpNeeded[meta.rarity])
      //   }
      // }


      if (meta?.id) {
        let existantReport = await myDataSource
        .getRepository(Report)
        .createQueryBuilder('report')
        .where('report.idFromLFD = :id', {id: meta.id})
        .getOne()

        let alternativePriceDiff = null
        if (meta.lastMinActivePrice > 0 && alternativePrice > 0) {
          alternativePriceDiff = 100 * (Number(meta.lastMinActivePrice) - Number(alternativePrice)) / ((Number(meta.lastMinActivePrice) + Number(alternativePrice)) /2)
        }

        if (existantReport) {

          await Report.update(existantReport.id, {
            standardPrice,
            alternativePrice,
            alternativePriceDiff
          })

        } else {
         
          let report: Report = new Report()
          report.idFromLFD = meta?.id
          report.metadata = meta
          report.standardPrice = standardPrice
          report.alternativePrice = alternativePrice
          report.alternativePriceDiff = alternativePriceDiff
         
          await Report.save(report)

        }
      }
    }

  res.json({metadatas, 'length': metadatas.length})
}