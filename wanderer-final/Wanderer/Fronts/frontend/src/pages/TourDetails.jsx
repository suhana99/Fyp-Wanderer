import React, { useState, useRef, useEffect, useContext } from 'react';
import '../styles/tour-details.css';
import { Container, Row, Col, Form, ListGroup } from 'reactstrap';
import { useParams } from 'react-router-dom';
import calculateAvgRating from '../utils/avgRating';
import avatar from '../assets/images/avatar.jpg';
import Booking from '../components/Booking/Booking';
import Newsletter from '../shared/Newsletter';
import useFetch from '../hooks/useFetch';
import { BASE_URL } from '../utils/config';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from "jwt-decode";
import axios from 'axios';

const TourDetails = () => {
    const { id } = useParams();
    const reviewMsgRef = useRef(null);
    const [tourRating, setTourRating] = useState(null);
    const { user } = useContext(AuthContext);
    const [editingReview, setEditingReview] = useState(null)

    const { data: reviews, loading: reviewsLoading, error: reviewsError } = useFetch(`${BASE_URL}/package/packages/${id}/reviews`);
    const { data: packageData, loading: packageLoading, error: packageError } = useFetch(`${BASE_URL}/package/packages/${id}`);
    const { image: photo, name: title, description: desc, price, base_price, location: address, duration, availability, hotels = [], activities = [] } = packageData || {};

    const [isCustomizeMode, setIsCustomizeMode] = useState(false);
    const [selectedHotels, setSelectedHotels] = useState([]);
    const [selectedHotelsDisplay, setSelectedHotelsDisplay] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState([]);
    const [selectedActivitiesDisplay, setSelectedActivitiesDisplay] = useState([]);
    const [totalPrice, setTotalPrice] = useState(base_price || 0);
    const [customDuration, setCustomDuration] = useState(duration || 0);
    const [customizedPrice, setCustomizedPrice] = useState(price);

    const handleCustomize = () => setIsCustomizeMode(!isCustomizeMode);

    const { totalRating, avgRating } = calculateAvgRating(reviews);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };


    // Add or remove hotels
    const handleAddHotel = (hotel) => {
        if (!selectedHotels.some((item) => item.id === hotel.id)) {
            setSelectedHotels((prev) => [...prev, { ...hotel, duration: 1 }]); // Add hotel with default duration of 1
        }
    };

    const handleRemoveHotel = (hotelId) => {
        setSelectedHotels((prev) => prev.filter((item) => item.id !== hotelId));
    };

    // Add or remove activities
    const handleAddActivity = (activity) => {
        if (!selectedActivities.some((item) => item.id === activity.id)) {
            setSelectedActivities((prev) => [...prev, activity]);
        }
    };

    const handleRemoveActivity = (activityId) => {
        setSelectedActivities((prev) => prev.filter((item) => item.id !== activityId));
    };

    // Update hotel duration
    const increaseHotelDuration = (hotelId) => {
        setSelectedHotels((prev) =>
            prev.map((hotel) => hotel.id === hotelId ? { ...hotel, duration: hotel.duration + 1 } : hotel)
        );
    };

    const decreaseHotelDuration = (hotelId) => {
        setSelectedHotels((prev) =>
            prev.map((hotel) =>
                hotel.id === hotelId && hotel.duration > 1 ? { ...hotel, duration: hotel.duration - 1 } : hotel
            )
        );
    };

    // Automatically update custom duration based on selected hotels' durations
    useEffect(() => {
        const totalHotelDuration = selectedHotels.reduce((sum, hotel) => sum + hotel.duration, 0);
        setCustomDuration(totalHotelDuration || duration);
    }, [selectedHotels, duration]);

    const storedToken = localStorage.getItem('access_token');  // Get access token from localStorage

    // Decode the stored token to get the current user's details (like userID or email)
    const decodedToken = storedToken ? jwtDecode(storedToken) : null;
    console.log("decoded", decodedToken);
    const currentUserId = decodedToken ? decodedToken.user_id : null;

    const handleEditReview = (review) => {
        setEditingReview(review);
        reviewMsgRef.current.value = review.comment;
        setTourRating(review.rating); // Pre-fill the rating
    };


    const handleDeleteReview = async (reviewId) => {
        try {
            const token = localStorage.getItem('access_token'); // Retrieve token from local storage
            console.log(token);
            if (!token) {
                alert('Authentication token not found');
                return;
            }

            const res = await fetch(`${BASE_URL}/package/packages/${id}/reviews/${reviewId}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (res.status === 204) {
                // Successful deletion, no content returned
                alert('Review deleted successfully!');
                window.location.reload(); // Reload the page to reflect the deleted review
            } else {
                // If not 204, handle errors (e.g., bad request, forbidden, etc.)
                const result = await res.json();
                alert(result.message || 'Error occurred while deleting review');
            }
        } catch (error) {
            alert("catched error");
            console.log(error.message);
        }
    };

    const handleSubmitCustomization = async () => {
        // const [selectedHotelsDisplay, setSelectedHotelsDisplay] = useState([]);
        setSelectedHotelsDisplay(selectedHotels.map((hotel) => hotel.id));
        // const [selectedActivitiesDisplay, setSelectedActivitiesDisplay] = useState([]);
        setSelectedActivitiesDisplay(selectedActivities.map((activity) => activity.id));
        try {
            const token = localStorage.getItem('access_token'); // Retrieve token from local storage

            if (!token) {
                alert('Authentication token not found. Please log in.');
                return;
            }

            const response = await axios.patch(
                `${BASE_URL}/package/customize-package/${id}/`,
                {
                    hotels: selectedHotels.map((hotel) => hotel.id),
                    activities: selectedActivities.map((activity) => activity.id),
                    duration: customDuration, // Include custom duration in the request
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`, // Use token from localStorage
                    },
                }
            );

            if (response.status === 200) {
                alert("Customization saved successfully!");
                // window.location.reload();  // Reload the page to fetch and display the new review

            }
        } catch (error) {
            console.error("Error submitting customization:", error);

            if (error.response && error.response.status === 401) {
                alert('Unauthorized: Your session may have expired. Please log in again.');
            } else {
                alert("Failed to save customization. Please try again.");
            }
        }
    };
    const [allHotels, setAllHotels] = useState([]);
    const [allActivities, setAllActivities] = useState([]);
    const [customizedHotel, setCustomizedHotel] = useState(hotels);
    const [customizedActivity, setCustomizedActivity] = useState(activities);

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching all hotels and activities...");
                
                // Fetch all hotels
                const hotelResponse = await fetch(`${BASE_URL}/package/hotels/`); // Replace with your actual API URL
                if (!hotelResponse.ok) throw new Error('Failed to fetch hotels');
                const hotelData = await hotelResponse.json();
                setAllHotels(hotelData);
    
                // Fetch all activities
                const activityResponse = await fetch(`${BASE_URL}/package/activities/`); // Replace with your actual API URL
                if (!activityResponse.ok) throw new Error('Failed to fetch activities');
                const activityData = await activityResponse.json();
                setAllActivities(activityData);

                // const customHotels=await fetch(`${BASE_URL}/package/custom-hotels/`);

    
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);

    const matchedHotels = allHotels.filter(allHotel =>
        hotels.some(hotel => hotel.id === allHotel.id)
    );
    
    const matchedcustomHotels = allHotels.filter(allHotel =>
        customizedHotel.some(hotel => hotel.id === allHotel.id)
    );

    const matchedActivities = allActivities.filter(allActivity =>
        activities.some(activity => activity.id === allActivity.id)
    );
    console.log("all",allActivities);
    
    const matchedcustomActivities = allActivities.filter(allActivity =>
        customizedActivity.some(activity => activity.id === allActivity.id)
    );

    // Update total price dynamically
    useEffect(() => {
        let calculatedPrice = base_price || 0;

        // Add price for selected hotels based on their durations
        calculatedPrice += selectedHotels.reduce((sum, hotel) => sum + hotel.price * hotel.duration, 0);

        // Add price for selected activities
        calculatedPrice += selectedActivities.reduce((sum, activity) => sum + activity.price, 0);

        setTotalPrice(calculatedPrice);
    }, [selectedHotels, selectedActivities, base_price]);

    if (packageLoading) return <p>Loading...</p>;
    if (packageError) return <p>Error loading package details. Please try again later.</p>;
    const submitHandler = async e => {
        e.preventDefault();
        const reviewText = reviewMsgRef.current.value.trim();

        console.log('Review Text:', reviewText);
        try {
            if (!user) {
                alert('Please sign in');
                return;
            }

            const token = localStorage.getItem('access_token'); // Retrieve token from local storage
            if (!token) {
                alert('Authentication token not found');
                return;
            }

            const reviewObj = {
                comment: reviewText,
                rating: tourRating,
            };

            console.log(reviewObj);

            let res;

            if (editingReview) {
                // Update existing review
                res = await fetch(`${BASE_URL}/package/packages/${id}/reviews/${editingReview.id}/`, { // Endpoint for updating
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reviewObj),
                });
                const result = await res.json();
                if (!res.ok) {
                    alert(result.message || 'Error occurred while editing review');
                }
                else {
                    alert("successfully edited!");
                    window.location.reload();  // Reload the page to fetch and display the new review

                }
            } else {

                res = await fetch(`${BASE_URL}/package/packages/${id}/reviews/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(reviewObj),
                });

                const result = await res.json();
                if (!res.ok) {
                    alert(result.message || 'Error occurred while submitting review');
                }
                else {
                    alert("successfully added!");
                    window.location.reload();  // Reload the page to fetch and display the new review

                }
            }
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <section>
            <Container>
                {packageLoading && <h4 className='text-center pt-5'>LOADING...</h4>}
                {packageError && <h4 className='text-center pt-5'>{packageError}</h4>}
                {
                    !packageLoading && !packageError &&
                    <Row>
                        <Col lg='8'>
                            <div className="tour__content">
                            <img src={photo} alt={title} style={{maxHeight:"550px"}} />
                                <div className="tour__info" >
                                    <h2>{title}</h2>
                                    <h6 className='my-3 pb-3 text-secondary '>{desc}</h6>
                                    <div className="d-flex align-items-center gap-5">
                                        <span className="tour__rating d-flex align-items-center gap-1">
                                            <i className='ri-star-fill' style={{ color: 'var(--secondary-color)' }}></i> {avgRating === 0 ? null : avgRating}
                                            {avgRating === 0 ? 'Not rated' : <span>({reviews?.length})</span>}
                                        </span>

                                        <span><i className='ri-map-pin-fill'></i> {address}</span>
                                    </div>
                                    <div className="tour__extra-details">
                                        <span><i className='ri-map-pin-2-line'></i> Duration: {customDuration}  days</span>
                                        {isCustomizeMode ? (
                                            <span><i className='ri-money-dollar-circle-line'></i> ${totalPrice}/ per person</span>
                                        ) : (
                                            <span><i className='ri-money-dollar-circle-line'></i> ${price}/ per person</span>
                                        )}
                                        {/* <span><i className='ri-money-dollar-circle-line'></i> Total price: ${price}/ per person</span> */}
                                        <span><i className='ri-money-dollar-circle-line'></i> Base price ${base_price}</span>
                                        <span><i className='ri-check-line'></i> {availability ? 'Available' : 'Not Available'}</span>
                                    </div>
                                    <h5 className="text-xl font-semibold ">Hotels</h5>
                                    <div className="selected-hotels space-y-4 py-2">
                                                {!isCustomizeMode && matchedHotels.map(hotel => (
                                                    <li key={hotel.id}>{hotel.name}</li>
                                                ))}
                                                {isCustomizeMode && matchedcustomHotels.map(hotel => (
                                                    <li key={hotel.id}>{hotel.name}</li>
                                                ))}
                                    </div>
                                    <h5 className="text-xl font-semibold ">Activities</h5>
                                    <div className="selected-hotels space-y-4 py-2">
                                                {!isCustomizeMode && matchedActivities.map(activity => (
                                                    <li key={activity.id}>{activity.name}</li>
                                                ))}
                                                {isCustomizeMode && matchedcustomActivities.map(activity => (
                                                    <li key={activity.id}>{activity.name}</li>
                                                ))}
                                    </div>





                                    {/* Customize Button */}
                                    <button
                                        onClick={handleCustomize}
                                        className={`btn primary__btn text-white ${isCustomizeMode ? "bg-current" : ""
                                            }`}
                                    >
                                        {isCustomizeMode ? "Cancel Customization" : "Customize Package"}
                                    </button>

                                    {isCustomizeMode && (
                                        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 justify-center items-center my-3  ">
                                            <div className="bg-white p-6 px-4 py-4 rounded-lg w-11/12 max-w-3xl shadow-lg transform transition-all ease-in-out duration-300 z-50">
                                                <h5 className="text-xl font-semibold mt-6 mb-4">Selected Hotels</h5>
                                                <div className="selected-hotels space-y-4 py-2">
                                                    {selectedHotels.map((hotel) => (
                                                        <div key={hotel.id} className="selected-hotel-item flex justify-between items-center">
                                                            <Row>
                                                                <span className='text-lg'>{hotel.name} - ${hotel.price}/day <span> <button
                                                                    onClick={() => handleRemoveHotel(hotel.id)}
                                                                    class="bg-white hover:bg-gray-100 text-gray-800 font-normal py-1 px-3 mx-2 border border-gray-400 rounded "
                                                                >
                                                                    remove
                                                                </button></span></span>

                                                            </Row>
                                                            <span className='my-3'>Duration: {hotel.duration} days
                                                                <span>   <div>
                                                                    <button
                                                                        onClick={() => increaseHotelDuration(hotel.id)}
                                                                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 mx-2 border border-gray-400 rounded "
                                                                    >
                                                                        +
                                                                    </button>
                                                                    <button
                                                                        onClick={() => decreaseHotelDuration(hotel.id)}
                                                                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded"
                                                                    >
                                                                        -
                                                                    </button>

                                                                </div></span>
                                                            </span>

                                                        </div>
                                                    ))}
                                                </div>

                                                <h5 className="text-xl font-semibold mb-4 pt-4">Available Hotels</h5>
                                                <div className="hotel-list space-y-4">
                                                    {hotels.map((hotel) => (
                                                        <div key={hotel.id} className="hotel-item flex justify-between items-center py-2">
                                                            <p>{hotel.name} (${hotel.price}/day)</p>
                                                            <div className="flex space-x-2">
                                                                <button
                                                                    onClick={() => handleAddHotel(hotel)}
                                                                    disabled={selectedHotels.some((item) => item.id === hotel.id)}
                                                                    className="btn secondary__btn"
                                                                >
                                                                    Add
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveHotel(hotel.id)}
                                                                    disabled={!selectedHotels.some((item) => item.id === hotel.id)}
                                                                    className="btn secondary__btn"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <h5 className="text-xl font-semibold  my-3 mb-4">Available Activities</h5>
                                                <div className="activity-list space-y-4">
                                                    {activities.map((activity) => (
                                                        <div key={activity.id} className="activity-item flex justify-between items-center">
                                                            <p>{activity.name} (${activity.price})</p>
                                                            <div className='pb-4'>
                                                                <button
                                                                    onClick={() => handleAddActivity(activity)}
                                                                    disabled={selectedActivities.some((item) => item.id === activity.id)}
                                                                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded mx-2"
                                                                >
                                                                    Add
                                                                </button>
                                                                <button
                                                                    onClick={() => handleRemoveActivity(activity.id)}
                                                                    disabled={!selectedActivities.some((item) => item.id === activity.id)}
                                                                    className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className="mt-6 flex justify-end">
                                                    <button onClick={handleSubmitCustomization} className="btn primary__btn text-white">
                                                        Submit Customization
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* ============ REVIEWS SECTION START ============ */}
                                <div className="tour__reviews mt-4">
                                    <h4>Reviews ({reviews?.length} reviews)</h4>

                                    <Form onSubmit={submitHandler}>
                                        <div className="d-flex align-items-center gap-3 mb-4 rating__group">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <span key={star} onClick={() => setTourRating(star)}>
                                                    {star} <i className='ri-star-s-fill'></i>
                                                </span>
                                            ))}
                                        </div>

                                        <div className="review__input">
                                            <input type="text" ref={reviewMsgRef} placeholder='Share your thoughts' required />
                                            <button className='btn primary__btn text-white' type='submit'>
                                                Submit
                                            </button>
                                        </div>
                                    </Form>
                                    <ListGroup className='user__reviews'>
                                        {reviewsLoading && <h5>Loading reviews...</h5>}
                                        {reviewsError && <h5>{reviewsError}</h5>}
                                        {
                                            reviews?.map(review => (
                                                <div className="review__item" key={review.id}>
                                                    <img src={avatar} alt="" />

                                                    <div className="w-100">
                                                        <div className="d-flex align-items-center justify-content-between">
                                                            <div>
                                                                <h5>{review.email}</h5>
                                                                <p>{new Date(review.date_added).toLocaleDateString('en-US', options)}</p>
                                                            </div>

                                                            <span className='d-flex align-items-center'>
                                                                {review.rating}<i className='ri-star-s-fill'></i>
                                                            </span>
                                                        </div>
                                                        <h6>{review.comment}</h6>
                                                        {/* Display Edit and Delete buttons if the review belongs to the logged-in user */}
                                                        {currentUserId && review.user === currentUserId && (
                                                            <div className="review__actions">
                                                                <button onClick={() => handleEditReview(review)} className="btn btn-primary">Edit</button>
                                                                <button onClick={() => handleDeleteReview(review.id)} className="btn btn-danger">Delete</button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        }
                                    </ListGroup>
                                </div>
                                {/* ============ REVIEWS SECTION END ============== */}

                            </div>
                        </Col>
                        <Col lg='4'>
                            <Booking tour={packageData} avgRating={avgRating} isCustomizedMode={isCustomizeMode} totalPrice={totalPrice} hotels={matchedHotels} activities={matchedActivities} />
                        </Col>
                    </Row>
                }
            </Container>
        </section>
    );
};

export default TourDetails;