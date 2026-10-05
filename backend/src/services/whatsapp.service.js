import axios from 'axios';

// Read config from environment variables
const WAHA_URL = process.env.WAHA_URL || 'http://localhost:3000';
const WAHA_API_KEY = process.env.WAHA_API_KEY || 'gym_2026_secure_key';
const WAHA_SESSION = process.env.WAHA_SESSION || 'gym-main';

/**
 * Sends a WhatsApp message using WAHA HTTP API.
 * 
 * @param {string} phoneNumber - The recipient's phone number without the "+" prefix.
 * @param {string} message - The text message to send.
 * @returns {Promise<Object>} - The response data from WAHA API.
 */
export const sendWhatsAppMessage = async (phoneNumber, message) => {
    try {
        // Automatically append "@c.us" to format the chat ID as required by WAHA
        const chatId = `${phoneNumber}@c.us`;

        // POST request to /api/sendText
        const response = await axios.post(
            `${WAHA_URL}/api/sendText`,
            {
                chatId: chatId,
                text: message,
                session: WAHA_SESSION
            },
            {
                headers: {
                    'X-Api-Key': WAHA_API_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        // Log the actual API error if available, else standard message
        console.error('Error in sendWhatsAppMessage:', error.response?.data || error.message);
        throw error;
    }
};
