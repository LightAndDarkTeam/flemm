import {Request, Response} from 'express'
const axios = require('axios');
import http from 'http'
const httpAgent = new http.Agent({ keepAlive: true });

import { Metadata } from "../entity/Metadata"


import {myDataSource}  from "../config/ormconfig"

export const getMetadatas = async (req: Request, res: Response) => {
  const metadatas = await myDataSource
    .getRepository(Metadata)
    .createQueryBuilder('m')
    .getMany()
    
  res.json({metadatas})
}

export const updateMetadatas = async (req: Request, res: Response) => {
  let postData = {
    "filter": { 
      "element": [], 
      "rarity": [], 
      "rank": [1, 5], 
      "grade": [], 
      "advancement": [], 
      "set": ["ARKHANTE", "MANTRIS"], 
      "tokenType": ["CARD"],
      "animationLevel": [1] }, 
      "pagination": { "take": 100000, "skip": 0 }
  }
  
    
  axios.post('http://localhost:5500/api/metadataaas', {...postData}, {headers: {
    'Content-Type': 'application/json'
  }})
    .then(async function (response) {
      let metadatas = response.data

      if (metadatas.length > 0) {
        for (const meta of metadatas) {

          if (meta?.id) {
            let existantMeta = await myDataSource
            .getRepository(Metadata)
            .createQueryBuilder('m')
            .where('m.idFromLFD = :id', {id: meta.id})
            .getOne()

            if (existantMeta) {
              await Metadata.update(existantMeta.id, {
                lastMinActivePrice: meta.lastMinActivePrice,
                lastRecentlySoldPrice: meta.lastRecentlySoldPrice,
              })
            }

            else {

              let metadata: Metadata = new Metadata()
    
              metadata.idFromLFD = await meta?.id,
              metadata.collectionId = await meta?.collectionId,
              metadata.ian = await meta?.ian,
              metadata.name = await meta.name,
              metadata.foil = await meta.foil,
              metadata.animationLevel = await meta.animationLevel,
              metadata.power = await meta.power,
              metadata.rarity = await meta.rarity,
              metadata.rank = await meta.rank,
              metadata.potential = await meta.potential,
              metadata.grade = await meta.grade,
              metadata.advancement = await meta.advancement,
              metadata.set = await meta.set,
              metadata.season = await meta.season,
              metadata.faction = await meta.faction,
              metadata.element = await meta.element,
              metadata.trait = await meta.trait,
              metadata.cardType = await meta.cardType,
              metadata.tokenType = await meta.tokenType
              metadata.imagePath = await meta?.imagePath
              metadata.lastRecentlySoldPrice = await meta?.lastRecentlySoldPrice
              metadata.lastMinActivePrice = await meta?.lastMinActivePrice
    
              const response = await Metadata.save(metadata)
            }            
          }
        }
      }
    }).catch(function (error) {console.log(error)})

    res.json({message: 'ok'})
}