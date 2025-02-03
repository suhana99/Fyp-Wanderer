// import React, { useState, useEffect } from 'react';
// import PackagesList from './recommendations';

// function UserDetails() {
//   const [email, setEmail] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Replace with your actual API URL
//     fetch('http://localhost:8000/emaildetail/', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Uncomment and replace with actual token if authentication is required
//         // 'Authorization': `Bearer ${your_jwt_token}`
//       },
//       body: JSON.stringify({ email: 'user@example.com' }), // Replace with dynamic user email if needed
//     })
//       .then((response) => {
//         if (!response.ok) {
//           throw new Error(`Error: ${response.statusText}`);
//         }
//         return response.json();
//       })
//       .then((data) => {
//         setEmail(data.email); // Assuming the response is just the email object
//         setLoading(false);
//       })
//       .catch((err) => {
//         setError(err.message);
//         setLoading(false);
//       });
//   }, []);

//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>Error: {error}</div>;
//   }

//   return (
//     <div>
//       <h2>User Details</h2>
//       <div>
//         <p><strong>Email:</strong> {email}</p>
//         {/* Add more user details as needed */}
//       </div>
//       {/* <PackagesList user={{ email }} /> */}
//     </div>
//   );
// }

// export default UserDetails;
