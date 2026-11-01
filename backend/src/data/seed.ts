import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import mongoose from 'mongoose';
import Appointment from '../models/Appointment';
import { startingAppointments } from './seedData';

const runSeed = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI is missing from environment variables');
    }

    console.log('[SEED] Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('[SEED] Connected.');

    console.log('[SEED] Clearing existing appointments...');
    await Appointment.deleteMany({});

    console.log('[SEED] Inserting starting appointments...');
    const inserted = await Appointment.insertMany(startingAppointments);
    console.log(`[SEED] Success! Seeded ${inserted.length} appointments:`);
    inserted.forEach((item, idx) => {
      console.log(`  ${idx + 1}. [${item.status}] ${item.customerName} - ${item.service} (${new Date(item.dateTime).toLocaleString()})`);
    });

    await mongoose.disconnect();
    console.log('[SEED] Disconnected. Exiting.');
    process.exit(0);
  } catch (error) {
    console.error('[SEED ERROR]', error);
    process.exit(1);
  }
};

runSeed();
