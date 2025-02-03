import React, { useState,  useContext, useEffect  } from "react";
import "../styles/sellerdashboard.css";
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

function EventLister() {
  const [activePanel, setActivePanel] = useState("listEvent");
  const navigate = useNavigate();
  const { dispatch } = useContext(AuthContext);

  const [events, setEvents] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    date: "",
    description:"",
  });

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  const [editeventId, setEditeventId] = useState(null);

  const handlePanelChange = (panel) => setActivePanel(panel);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${BASE_URL}/calendar/events/create/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          name: formData.name,
          location: formData.location,
          date: formData.date,
          description: formData.description
        })
      });
  
      if (!response.ok) {
        throw new Error('Failed to create event');
      }
      else{
        alert("event added successfully");
      }
  
      const newEvent = await response.json();
      setEvents([...events, newEvent]);
      setFormData({
        name: "",
        location: "",
        date: "",
        description: "",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      // Optional: Add error handling UI
    }
  };

  const handleEditButtonClick = (event) => {
          setEditeventId(event.id); // Set the current activity ID to edit
          setFormData({
            name: event.name,
            location: event.location,
            date: event.date,
            description: event.description,
          });
          setActivePanel("listEvent");
        };
      
        const handleEditevent = async (e) => {
          e.preventDefault();
          if (!editeventId) {
            alert("No event selected for editing.");
            return;
          }
        
          try {
            const response = await fetch(`${BASE_URL}/calendar/events/${editeventId}/update/`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
              body: JSON.stringify(formData),
            });
        
            if (!response.ok) {
              throw new Error('Failed to update event');
            }
        
            alert("event updated successfully");
            const updatedevent = await response.json();
            setEvents(
              events.map((event) =>
                event.id === editeventId ? updatedevent : event
              )
            );
        
            // Clear form and reset state
            setFormData({
              name: "",
              location: "",
              date: "",
              description: "",
            });
            setEditeventId(null);
          } catch (error) {
            console.error('Error updating event', error);
          }
        };
      
        const handleDeleteEvent = async (id) => {
          try {
            const response = await fetch(`${BASE_URL}/calendar/events/${id}/delete/`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
              },
            });
      
            if (!response.ok) {
              throw new Error('Failed to delete event');
            }
      
            alert("event deleted successfully");
            setEvents(events.filter((event) => event.id !== id));
          } catch (error) {
            console.error('Error deleting event', error);
          }
        };

  useEffect(() => {
    const fetchUserEvents = async () => {
      try {
        const response = await fetch(`${BASE_URL}/calendar/events/user/`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch events');
        }

        const userEvents = await response.json();
        setEvents(userEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchUserEvents();
  }, []);

  const renderPanel = () => {
    switch (activePanel) {
      case "listEvent":
        return (
          <div>
            <h2>List Event</h2>
            <form onSubmit={editeventId ? handleEditevent : handleAddEvent}>
              <div className="form-group">
                <label>Event Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter event name"
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
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  placeholder="Enter date"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                />{" "}
              </div>
              <button type="submit" className="addy">Add Event</button>
            </form>
          </div>
        );
      case "listedEvents":
        return (
          <div>
            <h2>Listed Events</h2>
            {events.length > 0 ? (
              <table>
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Location</th>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event, index) => (
                    <tr key={index}>
                      <td>{event.name}</td>
                      <td>{event.location}</td>
                      <td>{event.date}</td>
                      <td>{event.description}</td>
                      <td>
                      <button
                          className="edit-btn"
                          onClick={() => {
                            handleEditButtonClick(event)
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No events listed yet.</p>
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
            className={activePanel === "listEvent" ? "active" : ""}
            onClick={() => handlePanelChange("listEvent")}
          >
            List Event
          </li>
          <li
            className={activePanel === "listedEvents" ? "active" : ""}
            onClick={() => handlePanelChange("listedEvents")}
          >
            Listed Events
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

export default EventLister;