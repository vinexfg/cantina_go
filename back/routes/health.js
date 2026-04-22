import express from 'express'
import { getHealth, getStatus } from '../controllers/healthController.js'

const router = express.Router()

router.get('/health', getHealth)
router.get('/', getStatus)

export default router
