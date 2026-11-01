import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { CreateAppointmentInput, AppointmentStatus } from '../types/appointment';

interface AppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateAppointmentInput) => Promise<boolean>;
  isSubmitting: boolean;
  serverErrors?: string[];
}

export const AppointmentModal: React.FC<AppointmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  serverErrors = []
}) => {
  const [customerName, setCustomerName] = useState('');
  const [service, setService] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [status, setStatus] = useState<AppointmentStatus>('Pending');
  const [notes, setNotes] = useState('');

  // Field validation error states
  const [errors, setErrors] = useState<{
    customerName?: string;
    service?: string;
    dateTime?: string;
  }>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { customerName?: string; service?: string; dateTime?: string } = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    } else if (customerName.trim().length < 2) {
      newErrors.customerName = 'Customer name must be at least 2 characters long';
    }

    if (!service.trim()) {
      newErrors.service = 'Service is required';
    } else if (service.trim().length < 2) {
      newErrors.service = 'Service must be at least 2 characters long';
    }

    if (!dateTime) {
      newErrors.dateTime = 'Date and time are required';
    } else {
      const parsed = new Date(dateTime);
      if (isNaN(parsed.getTime())) {
        newErrors.dateTime = 'Please enter a valid date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    const success = await onSubmit({
      customerName: customerName.trim(),
      service: service.trim(),
      dateTime: new Date(dateTime).toISOString(),
      status,
      notes: notes.trim()
    });

    if (success) {
      // Reset form
      setCustomerName('');
      setService('');
      setDateTime('');
      setStatus('Pending');
      setNotes('');
      setErrors({});
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <header className="modal-header">
          <h2 id="modal-title" className="modal-title">Add New Appointment</h2>
          <button
            type="button"
            className="modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Server Error Banner if any */}
            {serverErrors.length > 0 && (
              <div className="form-banner-error" role="alert">
                <strong>Please correct the following:</strong>
                <ul>
                  {serverErrors.map((err, index) => (
                    <li key={index}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Customer Name */}
            <div className="form-group">
              <label htmlFor="customerName" className="form-label">
                Customer Name <span className="required">*</span>
              </label>
              <input
                id="customerName"
                type="text"
                className={`form-input ${errors.customerName ? 'has-error' : ''}`}
                placeholder="e.g. Alex Morgan"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (errors.customerName) {
                    setErrors((prev) => ({ ...prev, customerName: undefined }));
                  }
                }}
                disabled={isSubmitting}
                autoFocus
              />
              {errors.customerName && (
                <span className="form-error">
                  <AlertCircle size={14} />
                  {errors.customerName}
                </span>
              )}
            </div>

            {/* Service */}
            <div className="form-group">
              <label htmlFor="service" className="form-label">
                Service <span className="required">*</span>
              </label>
              <input
                id="service"
                type="text"
                className={`form-input ${errors.service ? 'has-error' : ''}`}
                placeholder="e.g. Consultation, Follow-up, Review"
                value={service}
                onChange={(e) => {
                  setService(e.target.value);
                  if (errors.service) {
                    setErrors((prev) => ({ ...prev, service: undefined }));
                  }
                }}
                disabled={isSubmitting}
              />
              {errors.service && (
                <span className="form-error">
                  <AlertCircle size={14} />
                  {errors.service}
                </span>
              )}
            </div>

            {/* Date & Time */}
            <div className="form-group">
              <label htmlFor="dateTime" className="form-label">
                Date & Time <span className="required">*</span>
              </label>
              <input
                id="dateTime"
                type="datetime-local"
                className={`form-input ${errors.dateTime ? 'has-error' : ''}`}
                value={dateTime}
                onChange={(e) => {
                  setDateTime(e.target.value);
                  if (errors.dateTime) {
                    setErrors((prev) => ({ ...prev, dateTime: undefined }));
                  }
                }}
                disabled={isSubmitting}
              />
              {errors.dateTime && (
                <span className="form-error">
                  <AlertCircle size={14} />
                  {errors.dateTime}
                </span>
              )}
            </div>

            {/* Status */}
            <div className="form-group">
              <label htmlFor="status" className="form-label">
                Initial Status <span className="required">*</span>
              </label>
              <select
                id="status"
                className="form-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as AppointmentStatus)}
                disabled={isSubmitting}
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div className="form-group">
              <label htmlFor="notes" className="form-label">
                Additional Notes (Optional)
              </label>
              <textarea
                id="notes"
                className="form-textarea"
                rows={3}
                placeholder="Add any relevant instructions, meeting links, or prep notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <footer className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              id="btn-submit-appointment"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Appointment'}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
};
