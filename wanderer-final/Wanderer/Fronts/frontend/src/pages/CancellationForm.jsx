import React, { useState } from "react";
import axios from "axios";

const CancellationForm = ({ bookingId, onCancelSuccess }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async (e) => {
    e.preventDefault();
    setError(""); // Reset error message

    if (!reason.trim()) { // 🔹 Prevent empty reason submission
        setError("Please enter a reason for cancellation.");
        return;
    }

    setLoading(true);

    try {
        const token = localStorage.getItem("access_token"); 
        const response = await axios.post(
            `http://127.0.0.1:8000/bookings/cancel-booking/${bookingId}/`,
            { reason },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        if (response.status === 200) {
            const newStatus = response.data.status;  // ✅ Get updated status
            onCancelSuccess(bookingId, newStatus);   // ✅ Call parent function
        }
    } catch (err) {
        setError(err.response?.data?.error || "An error occurred.");
    }

    setLoading(false);
};




  return (

      <form 
            onSubmit={handleCancel} 
            onClick={(e) => e.stopPropagation()} // 🔹 Prevents accidental closing
            style={{
              background: "white", 
              padding: "20px", 
              borderRadius: "10px", 
              boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
              width: "300px",
              marginTop: "10px",
            }}
          >
            <label>Cancellation Reason:</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px"
              }}
            />
            <button type="submit" className="btn primary__btn" style={{ padding: "8px 15px", backgroundColor: "red", color: "white", border: "none" }}>Confirm</button>
        </form>

  );
};

export default CancellationForm;