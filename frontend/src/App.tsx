import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Calendar, Plus, RefreshCw, AlertTriangle } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { AppointmentCard } from './components/AppointmentCard';
import { AppointmentModal } from './components/AppointmentModal';
import { Toast, ToastMessage } from './components/Toast';
import { api, ApiError } from './services/api';
import { Appointment, StatusFilter, AppointmentStatus, CreateAppointmentInput } from './types/appointment';

export const App: React.FC = () => {
  // Store all appointments so metrics, badges, and tab counts remain accurate regardless of active filter
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);
  const [serverErrors, setServerErrors] = useState<string[]>([]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all appointments from API
  const loadAppointments = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await api.getAppointments('All', '');
      setAppointments(data);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      addToast('error', err.message || 'Failed to load appointments from server');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  // Derive displayed appointments based on active status filter and search query
  const displayedAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const matchesStatus =
        statusFilter === 'All' || appointment.status === statusFilter;

      const matchesSearch =
        !searchQuery.trim() ||
        appointment.customerName
          .toLowerCase()
          .includes(searchQuery.trim().toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Handle changing status of an appointment
  const handleStatusChange = async (id: string, newStatus: AppointmentStatus) => {
    try {
      const updated = await api.updateStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? updated : item))
      );
      addToast('success', `Status updated to ${newStatus}`);
    } catch (err: any) {
      console.error('Failed to update status:', err);
      addToast('error', err.message || 'Failed to update status');
    }
  };

  // Handle creating a new appointment
  const handleCreateAppointment = async (data: CreateAppointmentInput): Promise<boolean> => {
    try {
      setIsSubmitting(true);
      setServerErrors([]);
      const created = await api.createAppointment(data);
      setAppointments((prev) => [created, ...prev]);
      setIsModalOpen(false);
      addToast('success', `Appointment for ${created.customerName} created successfully!`);
      // Re-fetch to guarantee sync with server
      loadAppointments();
      return true;
    } catch (err: any) {
      console.error('Failed to create appointment:', err);
      if (err instanceof ApiError && err.errors.length > 0) {
        setServerErrors(err.errors);
      } else {
        setServerErrors([err.message || 'Failed to create appointment']);
      }
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle deleting an appointment
  const handleDeleteAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    try {
      await api.deleteAppointment(id);
      setAppointments((prev) => prev.filter((item) => (item._id || item.id) !== id));
      addToast('info', 'Appointment deleted');
    } catch (err: any) {
      console.error('Failed to delete appointment:', err);
      addToast('error', err.message || 'Failed to delete appointment');
    }
  };

  // Reset database back to the starting 3 appointments
  const handleResetSeedData = async () => {
    try {
      setIsResetting(true);
      const seeded = await api.resetToSeedData();
      setAppointments(seeded);
      setStatusFilter('All');
      setSearchQuery('');
      addToast('success', 'Reset database to starting 3 appointments successfully');
    } catch (err: any) {
      console.error('Failed to reset seed data:', err);
      addToast('error', err.message || 'Failed to reset appointments');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        onOpenCreateModal={() => {
          setServerErrors([]);
          setIsModalOpen(true);
        }}
        onResetSeedData={handleResetSeedData}
        isResetting={isResetting}
      />

      <section className="hero-section">
        <h1 className="hero-title">Appointment Manager</h1>
        <p className="hero-subtitle">
          Effortlessly schedule, filter, search, and track customer consultations, reviews, and follow-ups.
        </p>
      </section>

      {/* Stats Overview Cards */}
      <StatsOverview
        appointments={appointments}
        activeFilter={statusFilter}
        onSelectFilter={(filter) => setStatusFilter(filter)}
      />

      {/* Filter and Search Bar */}
      <FilterBar
        statusFilter={statusFilter}
        onStatusChange={(status) => setStatusFilter(status)}
        searchQuery={searchQuery}
        onSearchChange={(query) => setSearchQuery(query)}
        appointments={appointments}
      />

      {/* Main Content: Appointment List or Empty/Loading State */}
      <main>
        {isLoading && appointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <RefreshCw size={28} className="animate-spin" />
            </div>
            <h3 className="empty-title">Loading appointments...</h3>
            <p className="empty-desc">Fetching latest records from MongoDB Atlas database.</p>
          </div>
        ) : displayedAppointments.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {searchQuery || statusFilter !== 'All' ? <AlertTriangle size={28} /> : <Calendar size={28} />}
            </div>
            <h3 className="empty-title">
              {searchQuery || statusFilter !== 'All' ? 'No matching appointments found' : 'No appointments yet'}
            </h3>
            <p className="empty-desc">
              {searchQuery || statusFilter !== 'All'
                ? `No results match filter "${statusFilter}" and search "${searchQuery}". Try clearing filters.`
                : 'Get started by creating your first scheduled appointment.'}
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              {(searchQuery || statusFilter !== 'All') && (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setStatusFilter('All');
                    setSearchQuery('');
                  }}
                >
                  Clear All Filters
                </button>
              )}
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsModalOpen(true)}
              >
                <Plus size={16} />
                <span>Add Appointment</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="appointments-grid" id="appointments-grid">
            {displayedAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment._id || appointment.id}
                appointment={appointment}
                onStatusChange={handleStatusChange}
                onDelete={handleDeleteAppointment}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Appointment Modal */}
      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateAppointment}
        isSubmitting={isSubmitting}
        serverErrors={serverErrors}
      />

      {/* Toast Notification Container */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
};

export default App;
