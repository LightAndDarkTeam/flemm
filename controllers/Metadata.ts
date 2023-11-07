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
      "pagination": { "take": 10000, "skip": 0 }
  }
  
    
  axios.post('http://localhost:5500/api/metadataaas', {...postData}, {headers: {
    'Content-Type': 'application/json'
  }})
    .then(async function (response) {
      let metadatas = response.data.cards

      if (metadatas.length > 0) {
        for (const meta of metadatas) {
          let metadata: Metadata = new Metadata()

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
          metadata.element = await meta.element,
          metadata.cardType = await meta.cardType,
          metadata.tokenType = await meta.tokenType

          const response = await Metadata.save(metadata)
        }
      }
    })
}