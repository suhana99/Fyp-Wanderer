import React, { useState,  useContext,useEffect } from "react";
import "../styles/sellerdashboard.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

function SellerDashboard() {
  const [activePanel, setActivePanel] = useState("listHotel");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    availability: false,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null); // For handling errors

  const [editHotelId, setEditHotelId] = useState(null);

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const handlePanelChange = (panel) => setActivePanel(panel);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

useEffect(() => {
    // Fetch bookings from the backend
    const fetchBookings = async () => {
      try {
        setLoading(true);  // Start loading
        const response = await fetch(`${BASE_URL}/bookings/dashboard/seller/`,{
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch bookings.");
        }
        const data = await response.json();  // Assuming the response is in JSON format
        console.log("datas",data);
        
        setBookings(data);  // Set the fetched data
      } catch (error) {
        setError(error.message);  // Set error message
      } finally {
        setLoading(false);  // Stop loading
      }
    };

    fetchBookings();
  }, []); // Empty array ensures this effect only runs once when the component mounts


  const handleAddHotel = async (e) => {
      e.preventDefault();
          try {
            const response = await fetch(`${BASE_URL}/package/hotels/`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              },
              body: JSON.stringify({
                name: formData.name,
                location: formData.location,
                price: formData.price,
                availability: formData.availability
              })
            });
        
            if (!response.ok) {
              throw new Error('Failed to create hotels');
            }
            else{
              alert("hotel added successfully");
            }
        
            const newHotel = await response.json();
            setHotels([...hotels, newHotel]);
            setFormData({
              name: "",
              location: "",
              price: "",
              availability: false,
            });
          } catch (error) {
            console.error('Error creating hotel', error);
            // Optional: Add error handling UI
          }
    };

    const handleEditButtonClick = (hotel) => {
      setEditHotelId(hotel.id); // Set the current hotel ID to edit
      setFormData({
        name: hotel.name,
        location: hotel.location,
        price: hotel.price,
        availability: hotel.availability,
      });
      setActivePanel("listHotel");
    };
  
    const handleEditHotel = async (e) => {
      e.preventDefault();
      if (!editHotelId) {
        alert("No hotel selected for editing.");
        return;
      }
    
      try {
        const response = await fetch(`${BASE_URL}/package/hotels/${editHotelId}/`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
          body: JSON.stringify(formData),
        });
    
        if (!response.ok) {
          throw new Error('Failed to update hotel');
        }
    
        alert("Hotel updated successfully");
        const updatedHotel = await response.json();
        setHotels(
          hotels.map((hotel) =>
            hotel.id === editHotelId ? updatedHotel : hotel
          )
        );
    
        // Clear form and reset state
        setFormData({
          name: "",
          location: "",
          price: "",
          availability: false,
        });
        setEditHotelId(null);
      } catch (error) {
        console.error('Error updating hotel', error);
      }
    };
  
    const handleDeleteHotel = async (id) => {
      try {
        const response = await fetch(`${BASE_URL}/package/hotels/${id}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to delete hotel');
        }
  
        alert("Hotel deleted successfully");
        setHotels(hotels.filter((hotel) => hotel.id !== id));
      } catch (error) {
        console.error('Error deleting hotel', error);
      }
    };

  useEffect(() => {
        const fetchUserHotels = async () => {
          try {
            const response = await fetch(`${BASE_URL}/package/hotels/user/`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
              }
            });
    
            if (!response.ok) {
              throw new Error('Failed to fetch hotels');
            }
    
            const userHotels = await response.json();
            setHotels(userHotels);
          } catch (error) {
            console.error('Error fetching hotels', error);
          }
        };
    
        fetchUserHotels();
      }, []);

  const handleBookingAction = (id, action) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, status: action } : booking
      )
    );
  };

  const renderPanel = () => {
    switch (activePanel) {
      case "listHotel":
        return (
          <div>
            <h2>List Hotel</h2>
            <form onSubmit={editHotelId ? handleEditHotel : handleAddHotel}>
              <div className="form-group">
                <label>Hotel Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter hotel name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Enter location"
                  required
                />
              </div>
              <div className="form-group">
                <label>Price Per Night</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="Enter price"
                  required
                />
              </div>
              <div className="form-group">
                <label>Available</label>
                <input
                  type="checkbox"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleInputChange}
                />{" "}
              </div>
              <button type="submit" className="addy">
                {editHotelId ? "Update Hotel" : "Add Hotel"}
              </button>
            </form>
          </div>
        );
      case "listedHotel":
        return (
          <div>
            <h2>Listed Hotels</h2>
            {hotels.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Hotel Name</th>
                    <th>Location</th>
                    <th>Price Per Night</th>
                    <th>Available</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {hotels.map((hotel, index) => (
                    <tr key={index}>
                      <td>{hotel.name}</td>
                      <td>{hotel.location}</td>
                      <td>${hotel.price}</td>
                      <td>{hotel.availability ? "Yes" : "No"}</td>
                      <td>
                      <button
                          className="edit-btn"
                          onClick={() => {
                            handleEditButtonClick(hotel)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteHotel(hotel.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No hotels listed yet.</p>
            )}
          </div>
        );
      case "customerBookings":
        return (
          <div>
      <h2>Customer Booked Hotels</h2>

      {loading ? (
        <p>Loading bookings...</p>
      ) : error ? (
        <p>{error}</p>
      ) : bookings.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Phone Number</th>
              <th>Package Name</th>
              <th>Booking Date</th>
              <th>Status</th>
              <th>Hotel names</th>
              {/* <th>Actions</th> */}
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.user_full_name}</td>
                <td>{booking.user_phone_number}</td>
                <td>{booking.package_name}</td>
                <td>{booking.booking_date}</td>
                <td>{booking.status}</td>
                <td>
                  {/* Render hotel or activity names depending on the seller's role */}
                  {booking.hotel_names.length > 0
                    ? booking.hotel_names.join(", ")
                    : booking.activity_names.join(", ")}
                </td>
                {/* <td>
                  {booking.status === "Pending" && (
                    <>
                      <button
                        className="addy addy-accept"
                        onClick={() => handleBookingAction(booking.id, "Accepted")}
                      >
                        Accept
                      </button>
                      <button
                        className="addy addy-reject"
                        onClick={() => handleBookingAction(booking.id, "Rejected")}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {booking.status !== "Pending" && <span>{booking.status}</span>}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No customer bookings yet.</p>
      )}
    </div>
        );
      default:
        return <div>Select a panel from the menu.</div>;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h1>Dashboard</h1>
        <ul className="nav">
          <li
            className={activePanel === "listHotel" ? "active" : ""}
            onClick={() => handlePanelChange("listHotel")}
          >
            List Hotel
          </li>
          <li
            className={activePanel === "listedHotel" ? "active" : ""}
            onClick={() => handlePanelChange("listedHotel")}
          >
            Listed Hotels
          </li>
          <li
            className={activePanel === "customerBookings" ? "active" : ""}
            onClick={() => handlePanelChange("customerBookings")}
          >
            Customer Booked Hotels
          </li>
          <li 
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </li>
        </ul>
      </aside>
      <main className="main-content">{renderPanel()}</main>
    </div>
  );
}

export default SellerDashboard;