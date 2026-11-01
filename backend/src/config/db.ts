import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import { startingAppointments } from '../data/seedData';

let isConnected = false;

export const connectDB = async (): Promise<typeof mongoose> => {
  if (isConnected) {
    return mongoose;
  }

  const mongoUri = process.env.MONGO_URI;

  if (process.env.NODE_ENV === 'test') {
    // Tests manage their own MongoMemoryServer lifecycle
    return mongoose;
  }

  try {
    if (!mongoUri) {
      throw new Error('MONGO_URI is not defined in environment variables');
    }

    console.log('[DB] Connecting to MongoDB Atlas...');
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000
    } as mongoose.ConnectOptions);

    isConnected = true;
    console.log(`[DB] MongoDB Atlas Connected: ${conn.connection.host}`);

    // Auto-seed if database is brand new / empty
    const count = await Appointment.countDocuments();
    if (count === 0) {
      console.log('[DB] No appointments found. Seeding initial starting data...');
      await Appointment.insertMany(startingAppointments);
      console.log(`[DB] Successfully seeded ${startingAppointments.length} initial appointments.`);
    }

    return conn;
  } catch (error: any) {
    console.warn(`[DB WARNING] MongoDB Atlas connection failed: ${error.message}`);
    console.log('[DB FALLBACK] Initializing MongoMemoryServer as fallback database...');

    try {
      // @ts-ignore
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const memoryServer = await MongoMemoryServer.create();
      const fallbackUri = memoryServer.getUri();

      const conn = await mongoose.connect(fallbackUri);
      isConnected = true;
      console.log(`[DB FALLBACK] Connected to in-memory MongoDB: ${fallbackUri}`);

      // Seed fallback database
      await Appointment.insertMany(startingAppointments);
      console.log('[DB FALLBACK] Successfully seeded in-memory database with initial appointments.');

      return conn;
    } catch (fallbackError: any) {
      console.error('[DB FATAL] Could not connect to fallback database:', fallbackError.message);
      throw fallbackError;
    }
  }
};

export const disconnectDB = async (): Promise<void> => {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
  }
};
