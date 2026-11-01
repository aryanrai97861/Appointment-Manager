import request from 'supertest';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables for test execution
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import app from '../src/app';
import Appointment from '../src/models/Appointment';
import { startingAppointments } from '../src/data/seedData';

let mongoServer: any = null;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

  // 1. Fast path: Connect to MongoDB Atlas test database if URI is available (< 2s)
  const baseUri = process.env.TEST_MONGO_URI || process.env.MONGO_URI;
  if (baseUri) {
    try {
      const testUri = baseUri.includes('?')
        ? baseUri.replace(/\/[^/?]+\?/, '/appointment_manager_test?')
        : baseUri.replace(/\/$/, '') + '/appointment_manager_test';

      await mongoose.connect(testUri, { serverSelectionTimeoutMS: 6000 });
      return;
    } catch (err: any) {
      console.warn('[TEST DB] Atlas connection skipped, falling back to MongoMemoryServer:', err.message);
    }
  }

  // 2. Fallback: In-memory MongoDB server with extended timeout for binary download
  const { MongoMemoryServer } = await import('mongodb-memory-server');
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 180000);

afterAll(async () => {
  try {
    await Appointment.deleteMany({});
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  } catch (err: any) {
    console.warn('[TEST CLEANUP WARNING]', err.message);
  }
}, 60000);

beforeEach(async () => {
  await Appointment.deleteMany({});
  await Appointment.insertMany(startingAppointments);
});

describe('Appointment Manager API Tests', () => {
  // ---------------------------------------------------------
  // 1. GET /api/appointments
  // ---------------------------------------------------------
  describe('GET /api/appointments', () => {
    it('should retrieve all 3 starting appointments', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(3);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0]).toHaveProperty('customerName');
      expect(res.body.data[0]).toHaveProperty('service');
      expect(res.body.data[0]).toHaveProperty('dateTime');
      expect(res.body.data[0]).toHaveProperty('status');
    });

    it('should filter appointments by status: Pending', async () => {
      const res = await request(app).get('/api/appointments?status=Pending');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].customerName).toBe('Alex Morgan');
      expect(res.body.data[0].status).toBe('Pending');
    });

    it('should filter appointments by status: Confirmed', async () => {
      const res = await request(app).get('/api/appointments?status=Confirmed');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].customerName).toBe('Jamie Lee');
      expect(res.body.data[0].status).toBe('Confirmed');
    });

    it('should filter appointments by status: Cancelled', async () => {
      const res = await request(app).get('/api/appointments?status=Cancelled');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].customerName).toBe('Taylor Smith');
      expect(res.body.data[0].status).toBe('Cancelled');
    });

    it('should return all appointments when status=All', async () => {
      const res = await request(app).get('/api/appointments?status=All');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);
    });

    it('should return 400 when an invalid status filter is passed', async () => {
      const res = await request(app).get('/api/appointments?status=InvalidStatus');
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Invalid status filter');
    });

    it('should search appointments by customer name (case-insensitive)', async () => {
      const res = await request(app).get('/api/appointments?search=alex');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].customerName).toBe('Alex Morgan');
    });

    it('should return empty list when search does not match any customer', async () => {
      const res = await request(app).get('/api/appointments?search=NonExistentPerson');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(0);
      expect(res.body.data).toEqual([]);
    });

    it('should filter by both status and search query simultaneously', async () => {
      const res = await request(app).get('/api/appointments?status=Confirmed&search=Jamie');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].customerName).toBe('Jamie Lee');

      const mismatchRes = await request(app).get('/api/appointments?status=Pending&search=Jamie');
      expect(mismatchRes.status).toBe(200);
      expect(mismatchRes.body.count).toBe(0);
    });
  });

  // ---------------------------------------------------------
  // 2. GET /api/appointments/:id
  // ---------------------------------------------------------
  describe('GET /api/appointments/:id', () => {
    it('should retrieve a single appointment by valid ID', async () => {
      const existing = await Appointment.findOne({ customerName: 'Alex Morgan' });
      const res = await request(app).get(`/api/appointments/${existing!._id}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Alex Morgan');
    });

    it('should return 404 if appointment ID does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/appointments/${nonExistentId}`);
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it('should return 400 for an malformed ID format', async () => {
      const res = await request(app).get('/api/appointments/not-a-valid-id');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid appointment ID format');
    });
  });

  // ---------------------------------------------------------
  // 3. POST /api/appointments (Creation & Validation)
  // ---------------------------------------------------------
  describe('POST /api/appointments', () => {
    it('should successfully create an appointment with valid fields', async () => {
      const newAppointment = {
        customerName: 'Sam Rivera',
        service: 'Strategy Call',
        dateTime: '2026-11-05T09:00:00.000Z',
        status: 'Pending',
        notes: 'Discuss Q4 roadmap'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(newAppointment);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerName).toBe('Sam Rivera');
      expect(res.body.data.service).toBe('Strategy Call');
      expect(res.body.data.status).toBe('Pending');
      expect(res.body.data).toHaveProperty('_id');

      const inDb = await Appointment.findById(res.body.data._id);
      expect(inDb).not.toBeNull();
      expect(inDb?.customerName).toBe('Sam Rivera');
    });

    it('should reject creation when customerName is missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          service: 'Checkup',
          dateTime: '2026-11-05T09:00:00.000Z'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain('Customer name is required');
    });

    it('should reject creation when service is missing', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Jordan Casey',
          dateTime: '2026-11-05T09:00:00.000Z'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toContain('Service is required');
    });

    it('should reject creation when dateTime is missing or invalid', async () => {
      const resMissing = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Jordan Casey',
          service: 'Audit'
        });
      expect(resMissing.status).toBe(400);
      expect(resMissing.body.errors).toContain('Date and time are required');

      const resInvalid = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Jordan Casey',
          service: 'Audit',
          dateTime: 'invalid-date-string'
        });
      expect(resInvalid.status).toBe(400);
      expect(resInvalid.body.errors).toContain('Invalid date/time format. Please provide a valid timestamp');
    });

    it('should reject creation when status is invalid', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          customerName: 'Jordan Casey',
          service: 'Audit',
          dateTime: '2026-11-05T09:00:00.000Z',
          status: 'Done'
        });

      expect(res.status).toBe(400);
      expect(res.body.errors[0]).toContain('Status must be one of: Pending, Confirmed, Cancelled');
    });
  });

  // ---------------------------------------------------------
  // 4. PATCH /api/appointments/:id/status (Status Change)
  // ---------------------------------------------------------
  describe('PATCH /api/appointments/:id/status', () => {
    it('should allow changing an appointment status to Confirmed', async () => {
      const pendingAppt = await Appointment.findOne({ status: 'Pending' });
      expect(pendingAppt).not.toBeNull();

      const res = await request(app)
        .patch(`/api/appointments/${pendingAppt!._id}/status`)
        .send({ status: 'Confirmed' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('Confirmed');

      const updated = await Appointment.findById(pendingAppt!._id);
      expect(updated?.status).toBe('Confirmed');
    });

    it('should allow changing an appointment status to Cancelled', async () => {
      const confirmedAppt = await Appointment.findOne({ status: 'Confirmed' });

      const res = await request(app)
        .patch(`/api/appointments/${confirmedAppt!._id}/status`)
        .send({ status: 'Cancelled' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('Cancelled');
    });

    it('should reject invalid status during update', async () => {
      const appt = await Appointment.findOne();

      const res = await request(app)
        .patch(`/api/appointments/${appt!._id}/status`)
        .send({ status: 'Completed' });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid status');
    });

    it('should return 404 when changing status of non-existent appointment', async () => {
      const randomId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .patch(`/api/appointments/${randomId}/status`)
        .send({ status: 'Confirmed' });

      expect(res.status).toBe(404);
    });
  });

  // ---------------------------------------------------------
  // 5. DELETE /api/appointments/:id
  // ---------------------------------------------------------
  describe('DELETE /api/appointments/:id', () => {
    it('should delete an appointment successfully', async () => {
      const appt = await Appointment.findOne({ customerName: 'Alex Morgan' });
      const res = await request(app).delete(`/api/appointments/${appt!._id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const check = await Appointment.findById(appt!._id);
      expect(check).toBeNull();
    });
  });

  // ---------------------------------------------------------
  // 6. POST /api/appointments/reset
  // ---------------------------------------------------------
  describe('POST /api/appointments/reset', () => {
    it('should restore the original 3 starting appointments', async () => {
      await Appointment.deleteMany({});
      const checkEmpty = await Appointment.countDocuments();
      expect(checkEmpty).toBe(0);

      const res = await request(app).post('/api/appointments/reset');
      expect(res.status).toBe(200);
      expect(res.body.count).toBe(3);

      const checkReset = await Appointment.countDocuments();
      expect(checkReset).toBe(3);
    });
  });
});
