import React, { useState,  useContext,useEffect } from "react";
import "../styles/sellerdashboard.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

function ActivitySeller() {
  const [activePanel, setActivePanel] = useState("listactivity");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [activities, setActivities] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    price: "",
    availability: false,
  });

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);  // For loading state
  const [error, setError] = useState(null); // For handling errors

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const [editactivityId, setEditactivityId] = useState(null);

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

  const handleAddactivity = async (e) => {
    e.preventDefault();
        try {
          const response = await fetch(`${BASE_URL}/package/activities/`, {
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
            throw new Error('Failed to create activity');
          }
          else{
            alert("activity added successfully");
          }
      
          const newactivity = await response.json();
          setActivities([...activities, newactivity]);
          setFormData({
            name: "",
            location: "",
            price: "",
            availability: "",
          });
        } catch (error) {
          console.error('Error creating activity:', error);
          // Optional: Add error handling UI
        }
  };

  const handleEditButtonClick = (activity) => {
        setEditactivityId(activity.id); // Set the current activity ID to edit
        setFormData({
          name: activity.name,
          location: activity.location,
          price: activity.price,
          availability: activity.availability,
        });
        setActivePanel("listactivity");
      };
    
      const handleEditactivity = async (e) => {
        e.preventDefault();
        if (!editactivityId) {
          alert("No activity selected for editing.");
          return;
        }
      
        try {
          const response = await fetch(`${BASE_URL}/package/activities/${editactivityId}/`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
            body: JSON.stringify(formData),
          });
      
          if (!response.ok) {
            throw new Error('Failed to update activity');
          }
      
          alert("activity updated successfully");
          const updatedactivity = await response.json();
          setActivities(
            activities.map((activity) =>
              activity.id === editactivityId ? updatedactivity : activity
            )
          );
      
          // Clear form and reset state
          setFormData({
            name: "",
            location: "",
            price: "",
            availability: false,
          });
          setEditactivityId(null);
        } catch (error) {
          console.error('Error updating activity', error);
        }
      };
    
      const handleDeleteactivity = async (id) => {
        try {
          const response = await fetch(`${BASE_URL}/package/activities/${id}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            },
          });
    
          if (!response.ok) {
            throw new Error('Failed to delete activity');
          }
    
          alert("activity deleted successfully");
          setActivities(activities.filter((activity) => activity.id !== id));
        } catch (error) {
          console.error('Error deleting activity', error);
        }
      };

  useEffect(() => {
      const fetchUserActivities = async () => {
        try {
          const response = await fetch(`${BASE_URL}/package/activities/user/`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch activities');
          }
  
          const userActivities = await response.json();
          setActivities(userActivities);
        } catch (error) {
          console.error('Error fetching activities:', error);
        }
      };
  
      fetchUserActivities();
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
      case "listactivity":
        return (
          <div>
            <h2>List activity</h2>
            <form onSubmit={editactivityId ? handleEditactivity : handleAddactivity}>
              <div className="form-group">
                <label>activity Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter activity name"
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
                <label>Price</label>
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
              <button type="submit" className="addy">Add activity</button>
            </form>
          </div>
        );
      case "listedActivities":
        return (
          <div>
            <h2>Listed Activities</h2>
            {activities.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>activity Name</th>
                    <th>Location</th>
                    <th>Price</th>
                    <th>Available</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, index) => (
                    <tr key={index}>
                      <td>{activity.name}</td>
                      <td>{activity.location}</td>
                      <td>${activity.price}</td>
                      <td>{activity.availability ? "Yes" : "No"}</td>
                      <td>
                      <button
                          className="edit-btn"
                          onClick={() => {
                            handleEditButtonClick(activity)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteactivity(activity.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No activities listed yet.</p>
            )}
          </div>
        );
      case "customerBookings":
        return (
          <div>
      <h2>Customer Booked Activities</h2>

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
              <th>Activity names</th>
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
            className={activePanel === "listactivity" ? "active" : ""}
            onClick={() => handlePanelChange("listactivity")}
          >
            List activity
          </li>
          <li
            className={activePanel === "listedActivities" ? "active" : ""}
            onClick={() => handlePanelChange("listedActivities")}
          >
            Listed Activities
          </li>
          <li
            className={activePanel === "customerBookings" ? "active" : ""}
            onClick={() => handlePanelChange("customerBookings")}
          >
            Customer Booked Activities
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

export default ActivitySeller;