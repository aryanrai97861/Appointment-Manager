import React from 'react';
import { Calendar, Plus, RotateCcw } from 'lucide-react';

interface NavbarProps {
  onOpenCreateModal: () => void;
  onResetSeedData: () => void;
  isResetting: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateModal,
  onResetSeedData,
  isResetting
}) => {
  return (
    <header className="navbar">
      <div className="nav-brand">
        <div className="brand-icon">
          <Calendar size={24} />
        </div>
        <div>
          <span className="brand-title">Appointment Manager</span>
          <span className="brand-badge">MERN • TS</span>
        </div>
      </div>

      <div className="nav-actions">
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onResetSeedData}
          disabled={isResetting}
          title="Reset database to the starting 3 appointments"
        >
          <RotateCcw size={15} className={isResetting ? 'animate-spin' : ''} />
          <span>{isResetting ? 'Resetting...' : 'Reset Seed Data'}</span>
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={onOpenCreateModal}
          id="btn-add-appointment"
        >
          <Plus size={18} />
          <span>New Appointment</span>
        </button>
      </div>
    </header>
  );
};
