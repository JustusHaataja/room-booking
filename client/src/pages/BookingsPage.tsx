import React, { useState, useEffect } from 'react';
import { type BookingResponse } from '../types/booking';
import { type Room } from '../types/room';
import { getAllBookings, cancelBooking } from '../services/bookingService';
import { getRooms } from '../services/roomService';
import { formatTime, calculateDuration } from '../utils/timeUtils';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import '../styles/BookingsPage.css';

type FilterType = "all" | "upcoming" | "past";

interface BookingsPageProps {
  onClose?: () => void;
}

export const BookingsPage: React.FC<BookingsPageProps> = ({ onClose }) => {
  const [bookings, setBookings] = useState<BookingResponse[]>([]);
  const [rooms, setRooms] = useState<Map<number, Room>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("upcoming");
  const [cancelingId, setCancelingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch bookings and rooms on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both bookings and rooms in parallel
        const [bookingsData, roomsData] = await Promise.all([
          getAllBookings(false),
          getRooms(),
        ]);

        setBookings(bookingsData);

        // Create a map of rooms by ID for easy lookup
        const roomsMap = new Map(roomsData.map((room) => [room.id, room]));
        setRooms(roomsMap);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch bookings";
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [])

  // Get room name by ID
  const getRoomName = (roomId: number): string => {
    return rooms.get(roomId)?.name || `Room ${roomId}`;
  }

  // Check if booking is in the past
  const isPastBooking = (endTime: string): boolean => {
    return new Date(endTime) < new Date();
  }

  // Filter bookings based on selected filter
  const getFilteredBookings = (): BookingResponse[] => {
    const now = new Date();

    switch (filter) {
      case "upcoming":
        return bookings.filter(
          (booking) => new Date(booking.end_time) >= now
        );
      case "past":
        return bookings.filter(
          (booking) => new Date(booking.end_time) < now
        );
      case "all":
      default:
        return bookings;
    }
  }

  // Handle booking cancellation
  const handleCancel = async (bookingId: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return
    }

    try {
      setCancelingId(bookingId);
      await cancelBooking(bookingId);

      // Remove booking from list
      setBookings(bookings.filter((b) => b.id !== bookingId));
      setSuccessMessage("Booking cancelled successfully");

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to cancel booking";
      setError(errorMessage);
      console.error(err);
    } finally {
      setCancelingId(null);
    }
  }

  if (loading) {
    return <Loader fullScreen message="Loading bookings..." />
  }

  const filteredBookings = getFilteredBookings();

  return (
    <div className="bookings-page">
      <div className="container">
        <div className="bookings-page__header">
          <div>
            <h1 className="bookings-page__title">My Bookings</h1>
            <p className="bookings-page__subtitle">
              Manage your room bookings
            </p>
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

        {successMessage && (
          <Alert
            type="success"
            message={successMessage}
            onClose={() => setSuccessMessage(null)}
          />
        )}

        {/* Filter Tabs */}
        <div className="bookings-page__filters">
          {(["all", "upcoming", "past"] as const).map((filterType) => (
            <button
              key={filterType}
              className={`filter-tab ${
                filter === filterType ? "filter-tab--active" : ""
              }`}
              onClick={() => setFilter(filterType)}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              <span className="filter-tab__count">
                {filterType === "all"
                  ? bookings.length
                  : getFilteredBookings().length}
              </span>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card elevated className="bookings-page__empty">
            <p className="bookings-page__empty-text">
              {filter === "upcoming"
                ? "No upcoming bookings"
                : filter === "past"
                  ? "No past bookings"
                  : "No bookings yet"}
            </p>
          </Card>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map((booking) => {
              const isPast = isPastBooking(booking.end_time);
              const duration = calculateDuration(
                booking.start_time,
                booking.end_time
              )

              return (
                <Card
                  key={booking.id}
                  elevated
                  className={`booking-card ${
                    isPast ? "booking-card--past" : ""
                  }`}
                >
                  <div className="booking-card__header">
                    <div>
                      <h3 className="booking-card__room">
                        {getRoomName(booking.room_id)}
                      </h3>
                      <p className="booking-card__booker">
                        Booked by: <strong>{booking.user_name}</strong>
                      </p>
                    </div>
                    {isPast && (
                      <span className="booking-card__badge">Completed</span>
                    )}
                  </div>

                  <div className="booking-card__details">
                    <div className="detail-item">
                      <span className="detail-item__label">Check-in:</span>
                      <span className="detail-item__value">
                        {formatTime(booking.start_time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-item__label">Check-out:</span>
                      <span className="detail-item__value">
                        {formatTime(booking.end_time)}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-item__label">Duration:</span>
                      <span className="detail-item__value">{duration}</span>
                    </div>
                  </div>

                  <div className="booking-card__actions">
                    {!isPast && (
                      <Button
                        variant="danger"
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancelingId === booking.id}
                      >
                        {cancelingId === booking.id
                          ? "Canceling..."
                          : "Cancel Booking"}
                      </Button>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}