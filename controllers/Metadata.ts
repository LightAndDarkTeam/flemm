import {Request, Response} from 'express'

import { Metadata } from "../entity/Metadata"


import {myDataSource}  from "../config/ormconfig"

export const getMetadatas = async (req: Request, res: Response) => {

  const metadatas = await myDataSource
    .getRepository(Metadata)
    .createQueryBuilder('m')
    .getMany()
    
  res.json({metadatas})
}