import { Router } from 'express'

import {
  // getMetadatas,
  updateMetadatas

} from '../controllers/Metadata'
import {
  makeReport,
  getReport,
} from '../controllers/Report'

const router = Router()

router.get('/', (req, res) => res.status(200).send({
  message: 'Welcome to the API dude!'
}))

// METADATAS PART
// router.get('/metadata', getMetadatas)
router.get('/update-metadata', updateMetadatas)

// REPORT
router.get('/make-report', makeReport)
router.get('/get-report', getReport)


export default router
