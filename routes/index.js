import express from 'express';
import { getStats, getStatus } from '../controllers/AppController';

const router = express.Router();

router.get('/status', getStatus);
router.get('/stats', getStats);

export default router;
