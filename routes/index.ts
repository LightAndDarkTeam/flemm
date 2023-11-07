import { Router } from 'express'

import {
  getMetadatas,
  updateMetadatas
} from '../controllers/Metadata'

const router = Router();

router.get('/', (req, res) => res.status(200).send({
  message: 'Welcome to the API dude!'
}));

// METADATAS PART
router.get('/metadata', getMetadatas)
router.get('/update-metadata', updateMetadatas)

export default router
