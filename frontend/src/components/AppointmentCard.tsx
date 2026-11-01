import React from 'react';
import { User, Briefcase, Calendar, Clock, Trash2, FileText } from 'lucide-react';
import { Appointment, AppointmentStatus } from '../types/appointment';

interface AppointmentCardProps {
  appointment: Appointment;
  onStatusChange: (id: string, newStatus: AppointmentStatus) => void;
  onDelete: (id: string) => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  onStatusChange,
  onDelete
}) => {
  const { _id, id, customerName, service, dateTime, status, notes } = appointment;
  const appointmentId = _id || id || '';

  // Format date and time
  const formatDateTime = (dateStr: string): { datePart: string; timePart: string } => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { datePart: dateStr, timePart: '' };

      const datePart = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      const timePart = date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });

      return { datePart, timePart };
    } catch {
      return { datePart: dateStr, timePart: '' };
    }
  };

  const { datePart, timePart } = formatDateTime(dateTime);

  const statusClass = status.toLowerCase();

  return (
    <article
      className={`appointment-card status-${statusClass}`}
      id={`appointment-card-${appointmentId}`}
      aria-label={`Appointment for ${customerName}`}
    >
      <header className="card-header">
        <h3 className="customer-name">
          <User size={18} className="detail-icon" />
          <span>{customerName}</span>
        </h3>
        <span className={`status-badge ${statusClass}`}>
          <span className="status-dot"></span>
          <span>{status}</span>
        </span>
      </header>

      <div className="card-body">
        <div className="detail-row">
          <Briefcase size={16} className="detail-icon" />
          <span className="detail-label">Service:</span>
          <span className="detail-value">{service}</span>
        </div>

        <div className="detail-row">
          <Calendar size={16} className="detail-icon" />
          <span className="detail-label">Date:</span>
          <span className="detail-value">{datePart}</span>
        </div>

        <div className="detail-row">
          <Clock size={16} className="detail-icon" />
          <span className="detail-label">Time:</span>
          <span className="detail-value">{timePart}</span>
        </div>

        {notes && notes.trim() !== '' && (
          <div className="card-notes">
            <FileText size={14} style={{ display: 'inline', marginRight: '6px', verticalAlign: 'text-bottom' }} />
            <span>{notes}</span>
          </div>
        )}
      </div>

      <footer className="card-footer">
        <div className="status-changer">
          <label htmlFor={`status-select-${appointmentId}`} className="sr-only" style={{ display: 'none' }}>
            Change status
          </label>
          <select
            id={`status-select-${appointmentId}`}
            className="status-select"
            value={status}
            onChange={(e) => onStatusChange(appointmentId, e.target.value as AppointmentStatus)}
            title="Change appointment status"
            aria-label={`Change status for ${customerName}`}
          >
            <option value="Pending">Pending</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => onDelete(appointmentId)}
          title="Delete appointment"
          aria-label={`Delete appointment for ${customerName}`}
        >
          <Trash2 size={16} color="#FDA4AF" />
        </button>
      </footer>
    </article>
  );
};
