import React, { useState } from 'react';
import { createBooking } from '../services/bookingService';
import { type BookingCreate } from '../types/booking';
import { Modal } from './Modal';
import { FormField } from './FormField';
import { Alert } from './Alert';
import '../styles/BookingModal.css';

interface BookingModalProps {
  isOpen: boolean;
  roomId: number;
  roomName?: string;
  startTime: string; // ISO 8601 format
  endTime: string;   // ISO 8601 format
  onClose: () => void;
  onSuccess?: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  roomId,
  roomName,
  startTime,
  endTime,
  onClose,
  onSuccess,
}) => {
  const [userName, setUserName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Format time for display
  const formatTime = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Validate user name
  const validateUserName = (name: string): string | null => {
    if (!name.trim()) {
      return "Name is required"
    }
    if (name.length > 50) {
      return "Name must be 50 characters or less"
    }
    // Alphanumeric + @._-+
    const validPattern = /^[a-zA-Z0-9@._\-+]+$/;
    if (!validPattern.test(name)) {
      return "Name can only contain letters, numbers, and @._-+"
    }
    return null
  }

  const handleSubmit = async () => {
    const validationError = validateUserName(userName);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const bookingData: BookingCreate = {
        room_id: roomId,
        start_time: startTime,
        end_time: endTime,
        user_name: userName.trim(),
      }

      await createBooking(bookingData);

      setSuccess(true);
      setUserName("");

      // Close modal after 1.5 seconds to show success message
      setTimeout(() => {
        onSuccess?.();
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create booking";
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleClose = () => {
    if (!loading) {
      setUserName("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      title="Complete Your Booking"
      onClose={handleClose}
      className="booking-modal"
    >
      <div className="booking-modal__content">
        {success ? (
          <div className="booking-modal__success">
            <div className="booking-modal__success-icon">✓</div>
            <h3 className="booking-modal__success-title">Booking Confirmed!</h3>
            <p className="booking-modal__success-message">
              Your booking has been created successfully.
            </p>
          </div>
        ) : (
          <>
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
              />
            )}

            {/* Booking Summary */}
            <div className="booking-modal__summary">
              <div className="summary-item">
                <span className="summary-item__label">Room:</span>
                <span className="summary-item__value">
                  {roomName || `Room ${roomId}`}
                </span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Check-in:</span>
                <span className="summary-item__value">{formatTime(startTime)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-item__label">Check-out:</span>
                <span className="summary-item__value">{formatTime(endTime)}</span>
              </div>
            </div>

            {/* User Name Input */}
            <FormField
              label="Your Name"
              type="text"
              value={userName}
              onChange={setUserName}
              placeholder="e.g., John Doe"
              required
            />

            {/* Submit Button */}
            <div className="booking-modal__actions">
              <button
                className="booking-modal__submit"
                onClick={handleSubmit}
                disabled={loading || !userName.trim()}
              >
                {loading ? "Creating Booking..." : "Confirm Booking"}
              </button>
            </div>

            {/* Helper Text */}
            <p className="booking-modal__helper">
              By confirming, you agree to the booking terms.
            </p>
          </>
        )}
      </div>
    </Modal>
  )
}