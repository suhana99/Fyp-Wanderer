import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/calendar.css';

// Event data fetched from the backend
const Calendar = () => {
  const [events, setEvents] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(0);
  const [selectedLocation, setSelectedLocation] = useState(''); // State for filtering by location
  const [locations, setLocations] = useState([]); // State to store unique locations

  const months = Array.from({ length: 12 }, (_, index) => new Date(2025, index, 1).toLocaleString('default', { month: 'long' }));

  useEffect(() => {
    // Fetch events from the backend API
    axios.get('http://127.0.0.1:8000/calendar/events/')
      .then(response => {
        const fetchedEvents = response.data;

        // Organize events by date
        const eventMap = {};
        fetchedEvents.forEach(event => {
          const eventDate = event.date;
          if (!eventMap[eventDate]) {
            eventMap[eventDate] = [];
          }
          eventMap[eventDate].push(event);
        });

        setEvents(eventMap);

        // Extract unique locations for the filter
        const uniqueLocations = [...new Set(fetchedEvents.map(event => event.location))];
        setLocations(uniqueLocations);
      })
      .catch(error => {
        console.error('Error fetching events:', error);
      });
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const handleNextMonth = () => {
    setCurrentMonthIndex((prevIndex) => (prevIndex + 1) % 12);
  };

  const handlePreviousMonth = () => {
    setCurrentMonthIndex((prevIndex) => (prevIndex - 1 + 12) % 12);
  };

  const renderCalendar = () => {
    const currentMonth = months[currentMonthIndex];
    const monthIndex = months.indexOf(currentMonth);
    const firstDayOfMonth = new Date(2025, monthIndex, 1).getDay();
    const daysInMonth = new Date(2025, monthIndex + 1, 0).getDate();
    
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    let days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${2025}-${(monthIndex + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`;
      const eventsForDate = events[date] || [];
      const filteredEvents = selectedLocation
        ? eventsForDate.filter(event => event.location === selectedLocation)
        : eventsForDate;
  
      const hasEvent = filteredEvents.length > 0; // Check if there are any events for this date
  
      // Style the day button based on whether it has events
      days.push(
        <button
          key={i}
          className={`day ${hasEvent ? 'highlighted' : ''}`} // Add 'highlighted' class if there are events
          onClick={() => handleDateClick(date)}
          style={{ backgroundColor: hasEvent ? '#e0f7fa' : 'white' }} // Background color change
        >
          {i}
        </button>
      );
    }
  
    const leadingBlanks = Array(firstDayOfMonth).fill(null).map((_, i) => <div key={`blank-${i}`} className="day blank"></div>);
  
    return (
      <div className="month">
        <div className="weekdays">
          {weekdays.map((day, index) => (
            <div key={index} className="weekday">{day}</div>
          ))}
        </div>
        <div className="days">
          {leadingBlanks}
          {days}
        </div>
      </div>
    );
  };
  

  return (
    <div className="calendar-container">
      <div className="calendar-nav">
        <button className="nav-button left" onClick={handlePreviousMonth}>‹</button>
        <h2>{months[currentMonthIndex]}</h2>
        <button className="nav-button right" onClick={handleNextMonth}>›</button>
      </div>

      {/* Location Filter */}
      <div className="location-filter">
        <label htmlFor="location">Filter by Location: </label>
        <select id="location" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
          <option value="">All Locations</option>
          {locations.map((location, index) => (
            <option key={index} value={location}>{location}</option>
          ))}
        </select>
      </div>

      {renderCalendar()}

      {selectedDate && (
        <div className="event-details">
          <h4>Event Details for {selectedDate}:</h4>
          <ul>
            {(events[selectedDate] || [])
              .filter(event => !selectedLocation || event.location === selectedLocation)
              .map((event, index) => (
                <li key={index}>{event.name} - {event.location}
                <br />
                {event.description}</li>
              )) || <p>No events for this day</p>}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Calendar;