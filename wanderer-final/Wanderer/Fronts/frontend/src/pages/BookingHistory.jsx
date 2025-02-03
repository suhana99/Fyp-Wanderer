import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import '../styles/bookinghistory.css';
import { BASE_URL } from '../utils/config';

const BookingHistory = ({ userId }) => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const today = new Date(); // Get today's date
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
                <div className="booking-details">
                  <h3>Package: {booking.package.name}</h3>
                  <p><strong>Booking Date:</strong> {new Date(booking.booking_date).toLocaleDateString()}</p>
                  <p><strong>Completion Date:</strong> {completionDate.toLocaleDateString()}</p>

                  {isCompleted && (
                    <button className="btn primary__btn"  onClick={() => navigate('/diary', { state: { bookingId: booking.id } })}>
                      Create Diary
                    </button>
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
