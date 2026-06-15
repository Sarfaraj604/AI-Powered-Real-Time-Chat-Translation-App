import express from 'express';
import authRoutes from './routes/auth.route.js';
import messageRoutes from './routes/message.route.js';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './lib/db.js';
import cors from 'cors';
import { app, server } from './lib/socket.js'; 
import { allowedOrigins } from './lib/cors.js';


dotenv.config();

const PORT = process.env.PORT || 5000;

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);



server.listen(PORT, () => {
    console.log("Server is running on port", PORT);
    connectDB();
})
