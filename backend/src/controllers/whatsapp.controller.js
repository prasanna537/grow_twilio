import { sendWhatsAppMessage } from '../services/whatsapp.service.js';

/**
 * Temporary test controller for WhatsApp integration.
 * Route: GET /api/test-whatsapp
 */
export const testWhatsApp = async (req, res) => {
    try {
        // Sample phone number (user can change this for testing)
        // Ensure it's passed without the "+" prefix
        const samplePhone = '1234567890'; 
        const sampleMessage = 'Hello from Gym Management System! This is a test message.';

        // Call the WhatsApp service. 
        // Controllers should only orchestrate logic and call services, avoiding direct Axios calls.
        await sendWhatsAppMessage(samplePhone, sampleMessage);

        // Return success JSON if message was sent successfully
        return res.status(200).json({
            success: true,
            message: 'WhatsApp sent successfully'
        });
    } catch (error) {
        // Return proper error JSON if failed
        return res.status(500).json({
            success: false,
            message: 'Failed to send WhatsApp message',
            error: error.message || 'Internal Server Error'
        });
    }
};
