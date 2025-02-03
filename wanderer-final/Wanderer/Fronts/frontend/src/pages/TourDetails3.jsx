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

const TourDetails = () => {
    const { id } = useParams(); // Get the package ID from the URL
    const reviewMsgRef = useRef(null); // For handling review input
    const [tourRating, setTourRating] = useState(null); // To track selected rating
    const { user } = useContext(AuthContext); // To get user context
    const [editingReview, setEditingReview] = useState(null); // For handling the edit state

    // Fetch the package data from the backend
    const { data: packageData, loading: packageLoading, error: packageError } = useFetch(`${BASE_URL}/package/packages/${id}`);

    // Fetch the reviews for the specific package
    const { data: reviews, loading: reviewsLoading, error: reviewsError } = useFetch(`${BASE_URL}/package/packages/${id}/reviews`);

    // Destructure package data
    const { image: photo, name: title, description: desc, price, location: address, duration, availability, hotels = [], activities = [] } = packageData || {};

    // Calculate average rating from the reviews
    const { totalRating, avgRating } = calculateAvgRating(reviews);

    const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Date options for formatting

    const [isHotelCustomized, setIsHotelCustomized] = useState(false);
    const [hotel, setHotel] = useState([]);

    const handleCustomize = async () => {
        setIsHotelCustomized(prevState => !prevState); // Toggle hotel customization
        if (hotel.length === 0) { // Fetch hotels only if they are not already fetched
            try {
                const token = localStorage.getItem('access_token'); // Get token from localStorage (or from context if you're using one)
                const response = await fetch(`${BASE_URL}/package/packages/${id}/available-hotels/`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`, // Add the token to the headers
                        'Content-Type': 'application/json',
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setHotel(data); // Set fetched hotels data
                } else {
                    console.error('Error fetching hotels:', response.statusText);
                    // You can handle the 401 response here to redirect the user to the login page or show a message
                }
            } catch (error) {
                console.error('Error fetching hotels:', error);
            }
        }
    };

    const handleAddHotel = async (hotelId) => {
        try {
            const response = await fetch(`${BASE_URL}/package/customize-package/${id}/`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem('token')}`,  // Token for authorization
                },
                body: JSON.stringify({ hotel_id: hotelId }),
            });

            if (response.ok) {
                alert("Hotel added successfully!");
                // Optionally refresh the data to reflect changes
            } else {
                alert("Failed to add hotel. Please try again.");
            }
        } catch (error) {
            console.error("Error adding hotel:", error);
        }
    };


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

            const res = await fetch(`${BASE_URL}/package/packages/${id}/reviews/`, {
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
        } catch (error) {
            alert(error.message);
        }
    };

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


    useEffect(() => {
        window.scrollTo(0, 0);
    }, [packageData]);

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
                                <img src={photo} alt={title} />

                                <div className="tour__info" >
                                    <h2>{title}</h2>
                                    <div className="d-flex align-items-center gap-5">
                                        <span className="tour__rating d-flex align-items-center gap-1">
                                            <i className='ri-star-fill' style={{ color: 'var(--secondary-color)' }}></i> {avgRating === 0 ? null : avgRating}
                                            {avgRating === 0 ? 'Not rated' : <span>({reviews?.length})</span>}
                                        </span>

                                        <span><i className='ri-map-pin-fill'></i> {address}</span>
                                    </div>

                                    <div className="tour__extra-details">
                                        <span><i className='ri-map-pin-2-line'></i> Duration: {duration} days</span>
                                        <span><i className='ri-money-dollar-circle-line'></i> ${price}/ per person</span>
                                        <span><i className='ri-check-line'></i> {availability ? 'Available' : 'Not Available'}</span>
                                    </div>
                                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
                                        <span style={{ fontSize: '15px', position: "relative" }}>Hotels: {hotels.length > 0 ? (
                                            <span>
                                                {hotels.map(hotel => (
                                                    <li key={hotel.id}>{hotel.name}</li>
                                                ))}

                                                <button onClick={handleCustomize} className='btn primary__btn text-white' type=" " style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}>Customize</button>

                                                {isHotelCustomized && (
                                                    <div className="hotel-list-container">
                                                        <h4 className="hotel-list-title">Available Hotels</h4>
                                                        <div className="hotel-list">
                                                            {packageData?.hotels?.map((h) => (
                                                                <div key={h.id} className="hotel-item">
                                                                    <p className="hotel-name">{h.name}</p>
                                                                    <button
                                                                        onClick={() => handleAddHotel(h.id)}
                                                                        className="add-hotel-btn"
                                                                    >
                                                                        Add Hotel
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </span>

                                        ) : (
                                            <p style={{ fontSize: '14px', margin: '-5px ' }}>No hotels available<button className='btn primary__btn text-white' type=" " style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}>Customize</button></p>
                                        )}
                                        </span>
                                    </div>
                                    <div style={{ marginTop: "25px", marginBottom: "25px" }}>
                                        <span style={{ fontSize: '15px', position: 'relative' }}>Activities: {activities.length > 0 ? (
                                            <span>
                                                {activities.map(activities => (
                                                    <li key={activities.id}>{activities.name}</li>
                                                ))}
                                                <button className='btn primary__btn text-white' type=" " style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}>Customize</button>
                                            </span>

                                        ) : (
                                            <p style={{ fontSize: '14px', margin: '-5px ' }}>No activities available <button className='btn primary__btn text-white' type=" " style={{ fontSize: '12px', padding: '5px 10px', position: 'absolute', right: '250px' }}>Customize</button></p>
                                        )}
                                        </span>
                                    </div>
                                    <h5>Description</h5>
                                    <p>{desc}</p>
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
                            <Booking tour={packageData} avgRating={avgRating} />
                        </Col>
                    </Row>
                }
            </Container>
            <Newsletter />
        </section>
    );
};

export default TourDetails;

