import mongoose, { Document, Schema } from 'mongoose';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Cancelled';

export interface IAppointment extends Document {
  customerName: string;
  service: string;
  dateTime: Date;
  status: AppointmentStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      minlength: [2, 'Customer name must be at least 2 characters long'],
      maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    service: {
      type: String,
      required: [true, 'Service is required'],
      trim: true,
      minlength: [2, 'Service name must be at least 2 characters long'],
      maxlength: [100, 'Service name cannot exceed 100 characters']
    },
    dateTime: {
      type: Date,
      required: [true, 'Appointment date and time are required']
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Confirmed', 'Cancelled'],
        message: 'Status must be either Pending, Confirmed, or Cancelled'
      },
      default: 'Pending',
      required: [true, 'Status is required']
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: ''
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_, ret) => {
        ret.id = ret._id;
        return ret;
      }
    }
  }
);

// Indexes for fast searching and filtering
appointmentSchema.index({ customerName: 'text' });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ dateTime: 1 });

const Appointment = mongoose.model<IAppointment>('Appointment', appointmentSchema);

export default Appointment;
