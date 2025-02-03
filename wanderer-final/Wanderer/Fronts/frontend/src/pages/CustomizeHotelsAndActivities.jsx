import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Input } from 'reactstrap';
import { BASE_URL } from '../utils/config';  // Assuming you have a config file for BASE_URL

const CustomizeHotelsAndActivities = ({ hotels, setHotels }) => {
    const [modalOpen, setModalOpen] = useState(false);  // State to toggle modal visibility
    const [allHotels, setAllHotels] = useState([]);  // State for all hotels fetched from the backend
    const [activities, setActivities] = useState([]); // State for activities
    const [selectedHotel, setSelectedHotel] = useState(null); // State for the selected hotel
    const [selectedActivity, setSelectedActivity] = useState(null); // State for the selected activity

    // Fetch all hotels and activities when the modal opens
    const fetchHotelsAndActivities = async () => {
        try {
            const res = await fetch(`${BASE_URL}/package/hotels/`);  // Fetching all hotels from the backend
            const hotelsData = await res.json();
            setAllHotels(hotelsData);
            
            const activitiesRes = await fetch(`${BASE_URL}/package/activities/`);  // Fetching all activities from the backend
            const activitiesData = await activitiesRes.json();
            setActivities(activitiesData);
        } catch (error) {
            console.error('Error fetching hotels and activities:');
        }
    };

    const toggleModal = () => {
        setModalOpen(!modalOpen);
        if (!modalOpen) {
            fetchHotelsAndActivities();  // Fetch hotels and activities when the modal opens
        }
    };

    const handleHotelSelection = (hotel) => {
        setSelectedHotel(hotel);  // Update the selected hotel
    };

    const handleActivitySelection = (activity) => {
        setSelectedActivity(activity);  // Update the selected activity
    };

    const handleSave = () => {
        // Handle saving the selected hotel and activity, either send them to the backend or update the state
        const updatedHotels = [...hotels, selectedHotel];
        setHotels(updatedHotels);
        toggleModal();
    };

    return (
        <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <span style={{ fontSize: '15px', position: "relative" }}>Hotels: 
                {hotels.length > 0 ? (
                    <span>
                        {hotels.map((hotel) => (
                            <li key={hotel.id}>{hotel.name}</li>
                        ))}
                        <button
                            className='btn primary__btn text-white'
                            type="button"
                            style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}
                            onClick={toggleModal}
                        >
                            Customize
                        </button>
                    </span>
                ) : (
                    <p style={{ fontSize: '14px', margin: '-5px' }}>No hotels available
                        <button
                            className='btn primary__btn text-white'
                            type="button"
                            style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}
                            onClick={toggleModal}
                        >
                            Customize
                        </button>
                    </p>
                )}
            </span>

            {/* Modal for customizing hotels and activities */}
            <Modal isOpen={modalOpen} toggle={toggleModal}>
                <ModalHeader toggle={toggleModal}>Customize Hotels and Activities</ModalHeader>
                <ModalBody>
                    <h5>Select Hotel</h5>
                    <FormGroup>
                        <Input type="select" onChange={(e) => handleHotelSelection(e.target.value)} value={selectedHotel}>
                            <option>Select a hotel</option>
                            {allHotels.map((hotel) => (
                                <option key={hotel.id} value={hotel.id}>
                                    {hotel.name}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>

                    <h5>Select Activity</h5>
                    <FormGroup>
                        <Input type="select" onChange={(e) => handleActivitySelection(e.target.value)} value={selectedActivity}>
                            <option>Select an activity</option>
                            {activities.map((activity) => (
                                <option key={activity.id} value={activity.id}>
                                    {activity.name}
                                </option>
                            ))}
                        </Input>
                    </FormGroup>

                    <Button color="primary" onClick={handleSave}>Save</Button>
                </ModalBody>
            </Modal>
        </div>
    );
};

export default CustomizeHotelsAndActivities;
