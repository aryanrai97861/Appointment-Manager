import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Appointment, { AppointmentStatus } from '../models/Appointment';
import { startingAppointments } from '../data/seedData';

const VALID_STATUSES: AppointmentStatus[] = ['Pending', 'Confirmed', 'Cancelled'];

// @desc    Get all appointments (with optional status filter and customer-name search)
// @route   GET /api/appointments
export const getAppointments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, search, sortBy = 'dateTime', sortOrder = 'asc' } = req.query;

    const filter: Record<string, any> = {};

    // Filter by status if provided and not 'All'
    if (status && status !== 'All') {
      if (VALID_STATUSES.includes(status as AppointmentStatus)) {
        filter.status = status;
      } else {
        res.status(400).json({
          success: false,
          error: `Invalid status filter '${status}'. Allowed values: All, ${VALID_STATUSES.join(', ')}`
        });
        return;
      }
    }

    // Search by customer name (case-insensitive substring match)
    if (search && typeof search === 'string' && search.trim() !== '') {
      const sanitized = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.customerName = { $regex: sanitized, $options: 'i' };
    }

    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const sortField = typeof sortBy === 'string' ? sortBy : 'dateTime';

    const appointments = await Appointment.find(filter).sort({ [sortField]: sortDirection });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointments',
      message: error.message
    });
  }
};

// @desc    Get single appointment by ID
// @route   GET /api/appointments/:id
export const getAppointmentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
      return;
    }

    const appointment = await Appointment.findById(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: `Appointment with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve appointment',
      message: error.message
    });
  }
};

// @desc    Create a new appointment
// @route   POST /api/appointments
export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { customerName, service, dateTime, status = 'Pending', notes = '' } = req.body;

    const validationErrors: string[] = [];

    // Customer Name validation
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length === 0) {
      validationErrors.push('Customer name is required');
    } else if (customerName.trim().length < 2) {
      validationErrors.push('Customer name must be at least 2 characters long');
    }

    // Service validation
    if (!service || typeof service !== 'string' || service.trim().length === 0) {
      validationErrors.push('Service is required');
    } else if (service.trim().length < 2) {
      validationErrors.push('Service must be at least 2 characters long');
    }

    // Date/Time validation
    if (!dateTime) {
      validationErrors.push('Date and time are required');
    } else {
      const parsedDate = new Date(dateTime);
      if (isNaN(parsedDate.getTime())) {
        validationErrors.push('Invalid date/time format. Please provide a valid timestamp');
      }
    }

    // Status validation
    if (status && !VALID_STATUSES.includes(status as AppointmentStatus)) {
      validationErrors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }

    if (validationErrors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: validationErrors
      });
      return;
    }

    const appointment = await Appointment.create({
      customerName: customerName.trim(),
      service: service.trim(),
      dateTime: new Date(dateTime),
      status: status || 'Pending',
      notes: typeof notes === 'string' ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: appointment
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors: messages
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create appointment',
      message: error.message
    });
  }
};

// @desc    Update appointment status
// @route   PATCH /api/appointments/:id/status
export const updateAppointmentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
      return;
    }

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status is required'
      });
      return;
    }

    if (!VALID_STATUSES.includes(status as AppointmentStatus)) {
      res.status(400).json({
        success: false,
        error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
      });
      return;
    }

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: `Appointment with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to update appointment status',
      message: error.message
    });
  }
};

// @desc    Update full appointment details
// @route   PUT /api/appointments/:id
export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { customerName, service, dateTime, status, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
      return;
    }

    const updateData: Record<string, any> = {};
    if (customerName !== undefined) updateData.customerName = customerName.trim();
    if (service !== undefined) updateData.service = service.trim();
    if (dateTime !== undefined) {
      const parsed = new Date(dateTime);
      if (isNaN(parsed.getTime())) {
        res.status(400).json({ success: false, error: 'Invalid date/time format' });
        return;
      }
      updateData.dateTime = parsed;
    }
    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status as AppointmentStatus)) {
        res.status(400).json({
          success: false,
          error: `Invalid status '${status}'. Must be one of: ${VALID_STATUSES.join(', ')}`
        });
        return;
      }
      updateData.status = status;
    }
    if (notes !== undefined) updateData.notes = notes.trim();

    const appointment = await Appointment.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: `Appointment with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointment
    });
  } catch (error: any) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      res.status(400).json({ success: false, error: 'Validation failed', errors: messages });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update appointment',
      message: error.message
    });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
export const deleteAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: 'Invalid appointment ID format'
      });
      return;
    }

    const appointment = await Appointment.findByIdAndDelete(id);

    if (!appointment) {
      res.status(404).json({
        success: false,
        error: `Appointment with ID ${id} not found`
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Appointment deleted successfully',
      data: { id }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete appointment',
      message: error.message
    });
  }
};

// @desc    Reset appointments to initial seed data
// @route   POST /api/appointments/reset
export const resetAppointments = async (_req: Request, res: Response): Promise<void> => {
  try {
    await Appointment.deleteMany({});
    const seeded = await Appointment.insertMany(startingAppointments);

    res.status(200).json({
      success: true,
      message: 'Reset database to initial seed data successfully',
      count: seeded.length,
      data: seeded
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Failed to reset appointments',
      message: error.message
    });
  }
};
