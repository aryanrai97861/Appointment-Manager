import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { Appointment, StatusFilter } from '../types/appointment';

interface StatsOverviewProps {
  appointments: Appointment[];
  activeFilter: StatusFilter;
  onSelectFilter: (filter: StatusFilter) => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  appointments,
  activeFilter,
  onSelectFilter
}) => {
  const total = appointments.length;
  const pending = appointments.filter((a) => a.status === 'Pending').length;
  const confirmed = appointments.filter((a) => a.status === 'Confirmed').length;
  const cancelled = appointments.filter((a) => a.status === 'Cancelled').length;

  return (
    <div className="stats-grid">
      <div
        className={`stat-card total ${activeFilter === 'All' ? 'active-border' : ''}`}
        onClick={() => onSelectFilter('All')}
        role="button"
        tabIndex={0}
        title="View all appointments"
      >
        <div className="stat-icon-wrapper total">
          <Calendar size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Total Scheduled</span>
          <span className="stat-value">{total}</span>
        </div>
      </div>

      <div
        className={`stat-card pending ${activeFilter === 'Pending' ? 'active-border' : ''}`}
        onClick={() => onSelectFilter('Pending')}
        role="button"
        tabIndex={0}
        title="View pending appointments"
      >
        <div className="stat-icon-wrapper pending">
          <Clock size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{pending}</span>
        </div>
      </div>

      <div
        className={`stat-card confirmed ${activeFilter === 'Confirmed' ? 'active-border' : ''}`}
        onClick={() => onSelectFilter('Confirmed')}
        role="button"
        tabIndex={0}
        title="View confirmed appointments"
      >
        <div className="stat-icon-wrapper confirmed">
          <CheckCircle2 size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Confirmed</span>
          <span className="stat-value">{confirmed}</span>
        </div>
      </div>

      <div
        className={`stat-card cancelled ${activeFilter === 'Cancelled' ? 'active-border' : ''}`}
        onClick={() => onSelectFilter('Cancelled')}
        role="button"
        tabIndex={0}
        title="View cancelled appointments"
      >
        <div className="stat-icon-wrapper cancelled">
          <XCircle size={24} />
        </div>
        <div className="stat-content">
          <span className="stat-label">Cancelled</span>
          <span className="stat-value">{cancelled}</span>
        </div>
      </div>
    </div>
  );
};
