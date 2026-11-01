import { Router } from 'express';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointmentStatus,
  updateAppointment,
  deleteAppointment,
  resetAppointments
} from '../controllers/appointmentController';

const router = Router();

// Collection routes
router.route('/')
  .get(getAppointments)
  .post(createAppointment);

// Reset route for easy assessment testing
router.post('/reset', resetAppointments);

// Single item routes
router.route('/:id')
  .get(getAppointmentById)
  .put(updateAppointment)
  .delete(deleteAppointment);

// Status update specific route
router.patch('/:id/status', updateAppointmentStatus);

export default router;
