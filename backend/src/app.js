import express from 'express';
import whatsappRoutes from './routes/whatsapp.routes.js';

const app = express();

app.use(express.json());
app.use('/api', whatsappRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});
