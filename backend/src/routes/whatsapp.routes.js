import express from 'express';
import { testWhatsApp } from '../controllers/whatsapp.controller.js';

const router = express.Router();

// Register the test route for WhatsApp integration
router.get('/test-whatsapp', testWhatsApp);

export default router;
