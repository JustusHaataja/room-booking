import { useState} from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RoomsPage } from './pages/RoomsPage';
import { AvailabilityPage } from './pages/AvailabilityPage';
import { BookingsPage } from './pages/BookingsPage';
import { BookingModal } from './components/BookingModal';
import './App.css'

function App() {
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    roomId: number;
    roomName?: string;
    startTime: string;
    endTime: string;
  }>({
    isOpen: false,
    roomId: 0,
    startTime: "",
    endTime: "",
  });

  const [currentPage, setCurrentPage] = useState<"rooms" | "availability" | "bookings">("rooms");

  const handleSelectRoom = (roomId: number) => {
    setSelectedRoom(roomId);
    setCurrentPage("availability");
  }

  const handleBookRoom = (roomId: number) => {
    handleSelectRoom(roomId);
  }

  const handleOpenBookingModal = (
    roomId: number,
    roomName: string,
    startTime: string,
    endTime: string
  ) => {
    setBookingModal({
      isOpen: true,
      roomId,
      roomName,
      startTime,
      endTime,
    })
  }

  const handleCloseBookingModal = () => {
    setBookingModal({...bookingModal, isOpen: false })
  }

  const handleBookingSuccess = () => {
    setCurrentPage("bookings");
    setSelectedRoom(null);
  }

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Rooms page */}
          <Route
            path="/"
            element={
              <RoomsPage
                onSelectRoom={handleSelectRoom}
                onBookRoom={handleBookRoom}
              />
            }
          />

          {/* Availability Page */}
          <Route
            path="/room/:roomId"
            element={
              selectedRoom ? (
                <AvailabilityPage 
                  roomId={selectedRoom}
                  onClose={() => {
                    setCurrentPage("rooms")
                    setSelectedRoom(null)
                  }}
                  onBookingSuccess={(bookingData) => {
                    handleOpenBookingModal(
                      bookingData.roomId,
                      undefined,
                      bookingData.startTime,
                      bookingData.endTime
                    )
                  }}
                />
              ) : (
                <div className="container" style={{ padding: "2rem 0"}}>
                  <p>Invalid room selected. Please go back to rooms.</p>
                </div>
              )
            }
          />

          {/* Bookings Page */}
          <Route
            path="/bookings"
            element={
              <BookingsPage 
                onClose={() => {
                  // setCurrentPage("rooms")
                }}
              />
            }
          />

          {/* 404 Fallback */}
          <Route 
            path="*"
            element={
              <div className="container" style={{ padding: "2rem 0"}}>
                <h1>404 - Page Not Found</h1>
                <p>The page you're looking for doesn't exist.</p>
              </div>
            }
          />
        </Routes>
      </Layout>

      {/* Booking Modal */}
      <BookingModal 
        isOpen={bookingModal.isOpen}
        roomId={bookingModal.roomId}
        roomName={bookingModal.roomName}
        startTime={bookingModal.startTime}
        endTime={bookingModal.endTime}
        onClose={handleCloseBookingModal}
        onSuccess={handleBookingSuccess}
      />
    </BrowserRouter>
  )
}

export default App