import { Router } from 'express'

import {
  getMetadatas,
} from '../controllers/Metadata'

const router = Router();

router.get('/', (req, res) => res.status(200).send({
  message: 'Welcome to the API dude!',
}));

// METADATAS PART
router.get('/metadata', getMetadatas)

export default router
