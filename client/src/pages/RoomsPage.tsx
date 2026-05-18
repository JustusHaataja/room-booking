import React, { useState, useEffect } from 'react';
import { type Room } from '../types/room';
import { getRooms } from '../services/roomService';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loader } from '../components/Loader';
import { Alert } from '../components/Alert';
import '../styles/RoomsPage.css';

interface RoomsPageProps {
  onSelectRoom?: (roomId: number) => void;
  onBookRoom?: (roomId: number) => void;
}

export const RoomsPage: React.FC<RoomsPageProps> = ({
  onSelectRoom,
  onBookRoom,
}) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms on component mount
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRooms();
        setRooms(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch rooms';
        setError(errorMessage);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, [])

  if (loading) {
    return <Loader fullScreen message="Loading rooms..." />
  }

  return (
    <div className="rooms-page">
      <div className="container">
        <h1 className="rooms-page__title">Available Rooms</h1>

        {error && (
          <Alert
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        )}

        {rooms.length === 0 ? (
          <Card elevated className="rooms-page__empty">
            <p className="rooms-page__empty-text">No rooms available</p>
          </Card>
        ) : (
          <div className="grid grid--3-cols">
            {rooms.map((room) => (
              <Card key={room.id} elevated className="room-card">
                <div className="room-card__header">
                  <h2 className="room-card__name">{room.name}</h2>
                  <span className="room-card__capacity">
                    👥 {room.capacity} people
                  </span>
                </div>

                <p className="room-card__description">{room.description}</p>

                <div className="room-card__info">
                  <div className="room-card__price">
                    <span className="room-card__price-label">Price:</span>
                    <span className="room-card__price-value">
                      €{room.price.toFixed(2)}/h
                    </span>
                  </div>
                </div>

                <div className="room-card__actions">
                  <Button
                    variant="secondary"
                    onClick={() => onSelectRoom?.(room.id)}
                    className="room-card__btn"
                  >
                    View Bookings
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => onBookRoom?.(room.id)}
                    className="room-card__btn"
                  >
                    Book Now
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}