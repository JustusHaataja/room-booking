import React, { useState, useEffect } from 'react';
import { type Room } from '../types/room';
import { type BookingResponse } from '../types/booking';
import { getRoomBookings } from '../services/roomService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import '../styles/AvailabilityPage.css';

interface AvailabilityPageProps {
  roomId: number;
  room?: Room;
  onClose?: () => void;
  onBookingSuccess?: (bookingData: {
    roomId: number;
    startTime: string;
    endTime: string;
  }) => void;
}

interface TimeSlot {
  time: string; // HH:MM format
  hour: number;
  minute: number;
  isBooked: boolean;
  booking?: BookingResponse;
}

export const AvailabilityPage: React.FC<AvailabilityPageProps> = ({
  roomId,
  room,
  onClose,
  onBookingSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch bookings for the selected date
  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRoomBookings(roomId);  // false
        setBookings(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch bookings';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [roomId, selectedDate]);

  // Generate 15-minute time slots for the day
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const selectedDateTime = new Date(`${selectedDate}T00:00:00`);

    for (let hour = 8; hour < 20; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const slotDateTime = new Date(selectedDateTime);
        slotDateTime.setHours(hour, minute, 0, 0);

        // Check if this slot is booked
        const booking = bookings.find((b) => {
          const bookingStart = new Date(b.start_time);
          const bookingEnd = new Date(b.end_time);
          return slotDateTime >= bookingStart && slotDateTime < bookingEnd;
        });

        slots.push({
          time,
          hour,
          minute,
          isBooked: !!booking,
          booking,
        });
      }
    }

    return slots
  }

  const timeSlots = generateTimeSlots();

  const handleSlotClick = (time: string) => {
    if (selectedSlots.includes(time)) {
      setSelectedSlots(selectedSlots.filter((t) => t !== time));
    } else if (selectedSlots.length < 2) {
      setSelectedSlots([...selectedSlots, time].sort());
    }
  }

  const isSlotSelected = (time: string) => selectedSlots.includes(time);

  // Check if a slot is within the selected range
  const isInSelectedRange = (time: string): boolean => {
    if (selectedSlots.length < 2) return false;
    
    const [start, end] = selectedSlots;
    const slotTime = time.split(':').map(Number);
    const startTime = start.split(':').map(Number);
    const endTime = end.split(':').map(Number);
    
    const slotMinutes = slotTime[0] * 60 + slotTime[1];
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];
    
    return slotMinutes >= startMinutes && slotMinutes < endMinutes;
  };

  const handleContinueToBooking = async () => {
    if (selectedSlots.length !== 2) return;

    try {
      setIsSubmitting(true);
      
      // Get user's timezone offset and format as ISO 8601 with offset
      const now = new Date();
      const offset = -now.getTimezoneOffset();
      const sign = offset >= 0 ? '+' : '-';
      const absOffset = Math.abs(offset);
      const hours = String(Math.floor(absOffset / 60)).padStart(2, '0');
      const minutes = String(absOffset % 60).padStart(2, '0');
      const tzOffset = `${sign}${hours}:${minutes}`;
      
      // Build ISO 8601 datetime with timezone offset (not UTC)
      const startTime = `${selectedDate}T${selectedSlots[0]}:00${tzOffset}`;
      const endTime = `${selectedDate}T${selectedSlots[1]}:00${tzOffset}`;

      const bookingData = {
        roomId,
        startTime,
        endTime,    
      }

      onBookingSuccess?.(bookingData);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create booking";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return <Loader fullScreen message="Loading availability..." />
  }

  return (
    <div className="availability-page">
      <div className="container">
        <div className="availability-page__header">
          <div>
            <h1 className="availability-page__title">
              {room?.name || `Room ${roomId}`} - Availability
            </h1>
            {room?.description && (
              <p className="availability-page__description">
                {room.description}
              </p>
            )}
          </div>
          {onClose && (
            <Button variant="secondary" onClick={onClose}>
              Back
            </Button>
          )}
        </div>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {/* Date Selector */}
        <Card elevated className="availability-page__date-selector">
          <label htmlFor="date-input" className="availability-page__date-label">
            Select Date:
          </label>
          <input
            id="date-input"
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              setSelectedSlots([]);
            }}
            className="availability-page__date-input"
            min={new Date().toISOString().split("T")[0]}
          />
        </Card>

        {/* Time Slots Grid */}
        <Card elevated>
          <div className="availability-page__legend">
            <div className="legend-item">
              <div className="legend-item__color legend-item__color--available"></div>
              <span>Available</span>
            </div>
            <div className="legend-item">
              <div className="legend-item__color legend-item__color--booked"></div>
              <span>Booked</span>
            </div>
            <div className="legend-item">
              <div className="legend-item__color legend-item__color--selected"></div>
              <span>Selected</span>
            </div>
          </div>

          <div className="time-slots-grid">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                className={`time-slot ${
                  slot.isBooked
                    ? "time-slot--booked"
                    : "time-slot--available"
                } ${isSlotSelected(slot.time) ? "time-slot--selected" : ""} ${
                  isInSelectedRange(slot.time) ? "time-slot--in-range" : ""
                }`}
                onClick={() => !slot.isBooked && handleSlotClick(slot.time)}
                disabled={slot.isBooked}
                title={
                  slot.isBooked && slot.booking
                    ? `Booked by ${slot.booking.user_name}`
                    : ""
                }
              >
                {slot.time}
              </button>
            ))}
          </div>

          {selectedSlots.length === 2 && (
            <div className="availability-page__selection-summary">
              <p>
                Selected: <strong>{selectedSlots[0]}</strong> to{" "}
                <strong>{selectedSlots[1]}</strong>
              </p>
              <Button
                variant="primary"
                onClick={handleContinueToBooking}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating Booking..." : "Continue to Booking"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}