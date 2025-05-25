import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import translateRoutes from './routes/translateRoutes.js';

dotenv.config();
connectDB();

const app = express();

const corsOptions = {
  origin: [
    process.env.FRONTEND_URL,
    'https://flexi-lang.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
};
app.use(express.json());
app.use(cors(corsOptions));
// app.options('*', cors(corsOptions));

app.use('/api/auth', authRoutes);
app.use('/api/translate', translateRoutes);

app.get("/", (req, res) => {
  res.send("FlexiLang API is running");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})