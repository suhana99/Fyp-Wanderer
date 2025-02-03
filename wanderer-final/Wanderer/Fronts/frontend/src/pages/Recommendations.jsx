// import React, { useEffect, useState } from 'react';
// import axios from 'axios';

// const PackageList = ({ apiEndpoint }) => {
//   const [packages, setPackages] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     // Fetch packages from the provided endpoint
//     const fetchPackages = async () => {
//       try {
//         const response = await axios.get(apiEndpoint);
//         setPackages(response.data.results || response.data); // Handle paginated or non-paginated responses
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to load packages. Please try again later.');
//         setLoading(false);
//       }
//     };

//     fetchPackages();
//   }, [apiEndpoint]);

//   if (loading) {
//     return <p>Loading packages...</p>;
//   }

//   if (error) {
//     return <p className="error">{error}</p>;
//   }

//   return (
//     <div className="package-list">
//       {packages.length > 0 ? (
//         packages.map((pkg) => (
//           <div className="package-card" key={pkg.id}>
//             <img
//               src={pkg.image || '/placeholder.png'}
//               alt={pkg.name}
//               className="package-image"
//             />
//             <div className="package-details">
//               <h3>{pkg.name}</h3>
//               <p>{pkg.description || 'No description available.'}</p>
//               <p>
//                 <strong>Location:</strong> {pkg.location}
//               </p>
//               <p>
//                 <strong>Price:</strong> ${pkg.price.toFixed(2)}
//               </p>
//               <p>
//                 <strong>Duration:</strong> {pkg.duration} days
//               </p>
//               <p>
//                 <strong>Average Rating:</strong> {pkg.avg_rating || 'N/A'}
//               </p>
//               <p>
//                 <strong>Reviews:</strong> {pkg.num_reviews || 0}
//               </p>
//               <p>
//                 <strong>Bookings:</strong> {pkg.num_bookings || 0} (Successful: {pkg.successful_bookings || 0})
//               </p>
//               <h4>Hotels</h4>
//               <ul>
//                 {pkg.hotels.map((hotel) => (
//                   <li key={hotel.id}>
//                     {hotel.name} - {hotel.location} (${hotel.price})
//                   </li>
//                 ))}
//               </ul>
//               <h4>Activities</h4>
//               <ul>
//                 {pkg.activities.map((activity) => (
//                   <li key={activity.id}>
//                     {activity.name} - {activity.location} (${activity.price})
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         ))
//       ) : (
//         <p>No packages available.</p>
//       )}
//     </div>
//   );
// };

// export default PackageList;
