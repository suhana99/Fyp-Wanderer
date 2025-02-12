import React, { useState } from "react";
import axios from "axios";

const CancellationForm = ({ bookingId, onCancelSuccess }) => {
  const [reason, setReason] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [bankName, setBankName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const validateForm = () => {
    let errors = {};

    if (!reason.trim() || reason.length < 10) {
      errors.reason = "Reason must be at least 10 characters.";
    }
    if (!/^\d{6,}$/.test(accountNumber)) {
      errors.accountNumber = "Account number must be at least 6 digits.";
    }
    if (!/^[A-Za-z\s]{3,}$/.test(accountHolderName)) {
      errors.accountHolderName = "Name must contain only letters and be at least 3 characters.";
    }
    if (!/^[A-Za-z\s]{3,}$/.test(bankName)) {
      errors.bankName = "Bank name must contain only letters and be at least 3 characters.";
    }

    setValidationErrors(errors);
    
    // ✅ If errors exist, return false to stop form submission
    return Object.keys(errors).length === 0;
  };

  const handleCancel = async (e) => {
    e.preventDefault(); // ✅ Prevent default form submission

    setError(""); // Clear previous errors

    if (!validateForm()) {
      return; // ✅ Stop function execution if validation fails
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.post(
        `http://127.0.0.1:8000/bookings/cancel-booking/${bookingId}/`,
        {
          reason,
          account_number: accountNumber,
          account_holder_name: accountHolderName,
          bank_name: bankName,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200) {
        const newStatus = response.data.status;

        if (onCancelSuccess) {
          onCancelSuccess(bookingId, newStatus);
        }
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred.");
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleCancel}
      onClick={(e) => e.stopPropagation()}
      style={{
        background: "white",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.1)",
        width: "300px",
        marginTop: "10px",
      }}
    >
      {error && <p style={{ color: "red" }}>{error}</p>}

      <label>Cancellation Reason:</label>
      <input
        type="text"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      {validationErrors.reason && <p style={{ color: "red", fontSize: "12px" }}>{validationErrors.reason}</p>}

      <label>Account Number:</label>
      <input
        type="text"
        value={accountNumber}
        onChange={(e) => setAccountNumber(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      {validationErrors.accountNumber && <p style={{ color: "red", fontSize: "12px" }}>{validationErrors.accountNumber}</p>}

      <label>Account Holder Name:</label>
      <input
        type="text"
        value={accountHolderName}
        onChange={(e) => setAccountHolderName(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      {validationErrors.accountHolderName && <p style={{ color: "red", fontSize: "12px" }}>{validationErrors.accountHolderName}</p>}

      <label>Bank Name:</label>
      <input
        type="text"
        value={bankName}
        onChange={(e) => setBankName(e.target.value)}
        style={{
          width: "100%",
          padding: "8px",
          marginBottom: "5px",
          border: "1px solid #ccc",
          borderRadius: "5px",
        }}
      />
      {validationErrors.bankName && <p style={{ color: "red", fontSize: "12px" }}>{validationErrors.bankName}</p>}

      <button
        type="submit"
        className="btn primary__btn"
        style={{
          padding: "8px 15px",
          backgroundColor: "red",
          color: "white",
          border: "none",
        }}
        disabled={loading}
      >
        {loading ? "Processing..." : "Confirm"}
      </button>
    </form>
  );
};

export default CancellationForm;
