import React from 'react';
import { Search, X } from 'lucide-react';
import { StatusFilter, Appointment } from '../types/appointment';

interface FilterBarProps {
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  appointments: Appointment[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  searchQuery,
  onSearchChange,
  appointments
}) => {
  const getCount = (status: StatusFilter) => {
    if (status === 'All') return appointments.length;
    return appointments.filter((a) => a.status === status).length;
  };

  const statuses: StatusFilter[] = ['All', 'Pending', 'Confirmed', 'Cancelled'];

  return (
    <div className="control-bar">
      <div className="search-box">
        <Search size={18} className="search-icon" />
        <input
          type="text"
          id="search-customer-input"
          className="search-input"
          placeholder="Search by customer name..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          aria-label="Search appointments by customer name"
        />
        {searchQuery && (
          <button
            type="button"
            className="search-clear"
            onClick={() => onSearchChange('')}
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="filter-tabs" role="tablist" aria-label="Appointment status filter">
        {statuses.map((status) => {
          const isActive = statusFilter === status;
          return (
            <button
              key={status}
              type="button"
              role="tab"
              id={`tab-filter-${status.toLowerCase()}`}
              aria-selected={isActive}
              className={`filter-tab ${isActive ? 'active' : ''}`}
              onClick={() => onStatusChange(status)}
            >
              <span>{status}</span>
              <span className="tab-badge">{getCount(status)}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
