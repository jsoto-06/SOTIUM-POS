import React, { useState, useRef } from 'react';
import { usePOS } from '../context/POSContext';
import { Reservation, ReservationStatus, WaitingListItem } from '../types/reservation';
import { ReservationHeader, CalendarViewType } from './reservations/ReservationHeader';
import { ReservationCalendarView } from './reservations/ReservationCalendarView';
import { WaitingListPanel } from './reservations/WaitingListPanel';
import { ReservationAIAnalyticsPanel } from './reservations/ReservationAIAnalyticsPanel';
import { ReservationModal } from './reservations/ReservationModal';
import { NotificationModal } from './reservations/NotificationModal';
import { exportReservationsCSV } from '../services/reservationService';

export const ReservationsModule: React.FC = () => {
  const {
    reservations,
    salons,
    waitingList,
    addReservation,
    addQuickReservation,
    updateReservation,
    updateReservationStatus,
    checkInReservation,
    markNoShowReservation,
    addWaitingListItem,
    seatWaitingListItem,
    removeFromWaitingList,
    importReservationsFromCSV,
  } = usePOS();

  const [currentView, setCurrentView] = useState<CalendarViewType>('agenda');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');

  // Modal states
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isQuickMode, setIsQuickMode] = useState<boolean>(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // Notification Modal
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);
  const [notificationTargetRes, setNotificationTargetRes] = useState<Reservation | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter reservations
  const filteredReservations = reservations.filter((res) => {
    // Filter by date if in daily or timeline view
    if ((currentView === 'daily' || currentView === 'timeline') && res.date !== selectedDate) {
      return false;
    }

    if (statusFilter !== 'ALL' && res.status !== statusFilter) {
      return false;
    }

    if (channelFilter !== 'ALL' && res.channel !== channelFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = res.customerName.toLowerCase().includes(q);
      const matchPhone = res.phone.includes(q);
      const matchCode = res.code?.toLowerCase().includes(q) || res.id.includes(q);
      const matchNotes = res.notes?.toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchCode && !matchNotes) return false;
    }

    return true;
  });

  const totalPaxCount = filteredReservations.reduce((sum, r) => sum + r.pax, 0);

  const handleOpenNewReservation = () => {
    setSelectedReservation(null);
    setIsQuickMode(false);
    setShowModal(true);
  };

  const handleOpenQuickReservation = () => {
    setSelectedReservation(null);
    setIsQuickMode(true);
    setShowModal(true);
  };

  const handleSelectReservation = (res: Reservation) => {
    setSelectedReservation(res);
    setIsQuickMode(false);
    setShowModal(true);
  };

  const handleSaveModal = async (resData: any) => {
    if (resData.id) {
      updateReservation(resData.id, resData);
    } else {
      await addReservation(resData);
    }
    setShowModal(false);
  };

  const handleCheckIn = (resId: string) => {
    checkInReservation(resId);
  };

  const handleNoShow = (resId: string) => {
    markNoShowReservation(resId);
  };

  const handleSendNotification = (res: Reservation) => {
    setNotificationTargetRes(res);
    setShowNotificationModal(true);
  };

  const handleExportCSV = () => {
    const csvContent = exportReservationsCSV(reservations);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Reservas_SotiumPOS_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        importReservationsFromCSV(text);
        alert('Reservas importadas con éxito desde CSV.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-84px)] bg-slate-950 text-white overflow-hidden p-4 space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
      />

      {/* Header */}
      <ReservationHeader
        currentView={currentView}
        onViewChange={setCurrentView}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        channelFilter={channelFilter}
        onChannelFilterChange={setChannelFilter}
        onOpenNewReservation={handleOpenNewReservation}
        onOpenQuickReservation={handleOpenQuickReservation}
        onExportCSV={handleExportCSV}
        onImportCSVClick={() => fileInputRef.current?.click()}
        totalReservationsCount={filteredReservations.length}
        totalPaxCount={totalPaxCount}
        waitingListCount={waitingList.length}
      />

      {/* Main View Area */}
      {currentView === 'waiting' ? (
        <WaitingListPanel
          waitingList={waitingList}
          salons={salons}
          onAddWaitingItem={addWaitingListItem}
          onSeatItem={seatWaitingListItem}
          onRemoveItem={removeFromWaitingList}
          onSendNotification={(item) =>
            handleSendNotification({
              id: item.id,
              customerName: item.customerName,
              phone: item.phone,
              pax: item.pax,
              date: selectedDate,
              time: 'En espera',
              status: 'PENDIENTE',
            } as Reservation)
          }
        />
      ) : currentView === 'ai_analytics' ? (
        <ReservationAIAnalyticsPanel reservations={reservations} salons={salons} />
      ) : (
        <ReservationCalendarView
          view={currentView}
          selectedDate={selectedDate}
          reservations={filteredReservations}
          salons={salons}
          onSelectReservation={handleSelectReservation}
          onCheckIn={handleCheckIn}
          onNoShow={handleNoShow}
          onSendNotification={handleSendNotification}
          onUpdateStatus={updateReservationStatus}
        />
      )}

      {/* Reservation Create / Edit Modal */}
      {showModal && (
        <ReservationModal
          reservationToEdit={selectedReservation}
          salons={salons}
          existingReservations={reservations}
          isQuickMode={isQuickMode}
          onClose={() => setShowModal(false)}
          onSave={handleSaveModal}
        />
      )}

      {/* Omnichannel Notification Modal */}
      {showNotificationModal && notificationTargetRes && (
        <NotificationModal
          reservation={notificationTargetRes}
          onClose={() => {
            setShowNotificationModal(false);
            setNotificationTargetRes(null);
          }}
        />
      )}
    </div>
  );
};
