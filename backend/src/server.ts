import dotenv from 'dotenv';
import path from 'path';

// Load environment variables before importing other modules
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from './app';
import { connectDB, disconnectDB } from './config/db';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`===============================================`);
      console.log(`🚀 Appointment Manager Backend Server Running`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌍 Mode: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`📅 API Endpoint: http://localhost:${PORT}/api/appointments`);
      console.log(`===============================================`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n[SHUTDOWN] Received ${signal}. Closing HTTP server and DB connection...`);
      server.close(async () => {
        await disconnectDB();
        console.log('[SHUTDOWN] Cleanup finished. Exiting.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('[FATAL] Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
