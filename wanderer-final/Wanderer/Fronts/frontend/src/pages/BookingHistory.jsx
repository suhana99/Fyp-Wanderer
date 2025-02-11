import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/bookinghistory.css';
import { BASE_URL } from '../utils/config';
import CancellationForm from "./CancellationForm";


const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date(); // Get today's date
  const [showCancelForm, setShowCancelForm] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch(`${BASE_URL}/bookings/bookings-history/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }

        const data = await response.json();
        setBookings(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelSuccess = (bookingId) => {
    setBookings((prevBookings) =>
      prevBookings.map((booking) =>
        booking.id === bookingId ? { ...booking, status: "Cancelled" } : booking
      )
    );
    setShowCancelForm(null);
  };

  if (loading) {
    return <p>Loading booking history...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div className="booking-history">
      <h2>Booking History</h2>
      {bookings.length > 0 ? (
        <ul className="booking-list">
          {bookings.map((booking, index) => {
            const completionDate = new Date(booking.completion_date);
            const isCompleted = completionDate < today; // Check if completed

            return (
              <li key={index} className="booking-item">
                <div className="booking-details"  >
                <h3 onClick={() => navigate(`/package/${booking.package.id}`)}style={{ cursor: "pointer", color: "rgb(204,159,34)", textDecoration: "underline" }}>Package: {booking.package.name}</h3>
                  <p><strong>Booking Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                  {(booking.status === "Approved" || booking.status ==="confirmed") && (
                          <p><strong>Completion Date:</strong> {completionDate.toLocaleDateString()}</p>
                  )}
                  <p>Status: {booking.status}</p>

                  {isCompleted && (booking.status === "Approved" || booking.status ==="confirmed") &&(
                    <button className="btn primary__btn" style={{color: "white" }}  onClick={() => navigate('/diary', { state: { bookingId: booking.id } })}>
                      Create Diary
                    </button>
                  )}

                  {(booking.status === "Approved" || booking.status ==="confirmed") && new Date(booking.booking_date) > new Date() && (
                    <>
                      <button style={{ backgroundColor: "rgb(185,0,0)", padding: "5px 15px", color: "white", borderRadius: "50px" }}
                        onClick={() => setShowCancelForm(booking.id)}
                      >
                        Cancel Booking
                      </button>
                      {showCancelForm === booking.id && ( // Ensure only the clicked booking shows the form
                        <CancellationForm
                          bookingId={booking.id}
                          onCancelSuccess={() => handleCancelSuccess(booking.id)}
                        />
                      )}
                    </>
                  )}  
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No bookings found.</p>
      )}
    </div>
  );
};

export default BookingHistory;
