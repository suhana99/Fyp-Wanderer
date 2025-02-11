import React, { useState } from "react";
import axios from "axios";

const CancellationForm = ({ bookingId, onCancelSuccess }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCancel = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const token = localStorage.getItem("access_token"); // Assuming JWT token storage
      const response = await axios.post(
        `http://127.0.0.1:8000/bookings/cancel-booking/${bookingId}/`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "cancelled") {
        onCancelSuccess(bookingId); // Notify parent of success
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred.");
    }

    setLoading(false);
  };

  return (
    <div className="bg-white p-4 rounded shadow-lg w-96 mt-3">
      <h2 className="text-lg font-semibold mb-2">Cancel Booking</h2>
      <form onSubmit={handleCancel}>
        <textarea
          className="w-full p-2 border rounded mb-2"
          placeholder="Enter cancellation reason..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          className="btn primary__btn" style={{color: "white", marginLeft:"7px", marginTop:"-60px"}}
          disabled={loading}
        >
          {loading ? "Processing..." : "Confirm"}
        </button>
      </form>
    </div>
  );
};

export default CancellationForm;
