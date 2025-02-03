import React, { useState, useContext, useEffect, useCallback } from "react";
import { Form, FormGroup, ListGroup, ListGroupItem, Button, Alert } from "reactstrap";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { AuthContext } from "../../context/AuthContext";
import { BASE_URL } from "../../utils/config";
import "./booking.css";

const stripePromise = loadStripe("pk_test_51Qffv9Klirj7tM4tuQ6CglnFb3RWhn7S25NWGSGOaY7Es8nOk7qyorFaVKzcpH3nxEOk3I9YFPiSBT1pQ7PDVeWi00DAFuAkbZ");

const Booking = ({ tour, avgRating, totalPrice, isCustomizedMode, hotels,activities }) => {
  const price = isCustomizedMode ? totalPrice : tour.price;
  const hotelIds = hotels.map((hotel) => hotel.id);
  const activityIds = activities.map((activity) => activity.id);
  const { reviews, id } = tour;
  const navigate = useNavigate();
  const { user } = useContext(AuthContext); 
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [booking, setBooking] = useState({
    user: user ? user._id : null,
    package: isCustomizedMode ? id : id,
    number_of_people: 1,
    booking_date: "",
    fullname: "",
    phone: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = useCallback((e) => {
    const { id, value } = e.target;

    if (id === "number_of_people") {
      const numberValue = parseInt(value, 10);
      if (numberValue < 1) {
        setBooking((prev) => ({ ...prev, [id]: 1 }));
        return;
      }
    }

    if (id === "booking_date") {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selectedDate < today) {
        setBooking((prev) => ({ ...prev, [id]: today.toISOString().split("T")[0] }));
        return;
      }
    }

    setBooking((prev) => ({ ...prev, [id]: value }));
  }, []);

  const serviceFee = 10;
  const totalAmount = isCustomizedMode
    ? Number(totalPrice) * Number(booking.number_of_people) + Number(serviceFee)
    : Number(price) * Number(booking.number_of_people) + Number(serviceFee);

  const createBookingSession = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/bookings/create/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...booking,
          hotel: hotelIds.join(","),
          activity: activityIds.join(","),
          total_amount: totalAmount, // Ensure Stripe uses the correct totalAmount
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Booking creation failed");
      }

      localStorage.setItem("session_id", result.session_id);
      return result.stripe_checkout_url;
    } catch (error) {
      setError(error.message);
      return null;
    }
  }, [booking, totalAmount]);

  const handleBookingSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (isSubmitting) return;

      setIsSubmitting(true);

      if (!user) {
        setError("Please sign in to book");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error("Stripe initialization failed");
        }

        const checkoutUrl = await createBookingSession();

        if (checkoutUrl) {
          window.location.href = checkoutUrl;
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
        setIsSubmitting(false);
      }
    },
    [user, createBookingSession, isSubmitting]
  );

  const confirmBooking = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const sessionId = localStorage.getItem("session_id");
      if (!sessionId) {
        throw new Error("Session ID is missing. Please try again.");
      }
      const res = await fetch(`${BASE_URL}/bookings/confirm/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
        credentials: "include",
        body: JSON.stringify({
          ...booking,
          hotel: hotelIds.join(","),
          activity: activityIds.join(","),
          session_id: sessionId,
          total_amount: totalAmount, // Confirm with the same totalAmount
        }),
      });

      const result = await res.json();

      if (res.ok) {
        navigate("/thank-you");
      } else {
        throw new Error(result.error || "Booking confirmation failed");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  }, [booking, totalAmount, navigate]);

  useEffect(() => {
    const confirmBookingIfNeeded = async () => {
      if (isSubmitting) return;
  
      setIsSubmitting(true);
  
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const status = urlParams.get("status");
        const sessionId = urlParams.get("session_id");
  
        if (status === "succeeded" && sessionId) {
          // Check if the booking is already confirmed
          const confirmedSessionId = localStorage.getItem("confirmed_session_id");
          if (confirmedSessionId === sessionId) {
            console.log("Booking already confirmed.");
            return;
          }
  
          await confirmBooking();
  
          // Mark the session as confirmed
          localStorage.setItem("confirmed_session_id", sessionId);
          localStorage.removeItem("session_id"); // Clear the session ID
        }
      } catch (error) {
        console.error("Error confirming booking:", error);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    confirmBookingIfNeeded();
  }, [confirmBooking, isSubmitting]);
  return (
    <div className="booking">
      {error && (
        <Alert color="danger" className="mb-3">
          {error}
        </Alert>
      )}

      <div className="booking__top d-flex align-items-center justify-content-between">
        <h3>
          ${price} <span>/per person</span>
        </h3>
        <span className="tour__rating d-flex align-items-center">
          <i className="ri-star-fill" style={{ color: "var(--secondary-color)" }}></i>
          {avgRating === 0 ? null : avgRating} ({reviews?.length})
        </span>
      </div>

      <div className="booking__form">
        <h5>Information</h5>
        <Form className="booking__info-form" onSubmit={handleBookingSubmit}>
          <input
            type="hidden"
            id="hotels"
            value={hotelIds.join(",")}
          />
          <input
            type="hidden"
            id="activities"
            value={activityIds.join(",")}
          />

          <FormGroup>
            <input
              type="text"
              placeholder="Full Name"
              id="fullname"
              required
              onChange={handleChange}
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <input
              type="tel"
              placeholder="phone"
              id="phone"
              required
              onChange={handleChange}
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup className="d-flex align-items-center gap-3">
            <input
              type="date"
              id="booking_date"
              required
              min={new Date().toISOString().split("T")[0]}
              onChange={handleChange}
              disabled={isLoading}
            />

            <input
              type="number"
              placeholder="Guest"
              id="number_of_people"
              required
              min="1"
              max="10"
              onChange={handleChange}
              disabled={isLoading}
            />
          </FormGroup>

          <div className="booking__bottom">
            <ListGroup>
              <ListGroupItem className="border-0 px-0">
                <h5 className="d-flex align-items-center gap-1">
                  ${price} <i className="ri-close-line"></i> 1 person
                </h5>
                <span>${price}</span>
              </ListGroupItem>
              <ListGroupItem className="border-0 px-0">
                <h5>Service charge</h5>
                <span>${serviceFee}</span>
              </ListGroupItem>
              <ListGroupItem className="border-0 px-0 total">
                <h5>Total</h5>
                <span>${totalAmount}</span>
              </ListGroupItem>
            </ListGroup>

            <Button
              className="btn primary__btn w-100 mt-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Book Now"}
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Booking;
