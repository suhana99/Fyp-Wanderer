// import React from 'react';
// import TourCard from '../../shared/TourCard';
// import useFetch from './../../hooks/useFetch';
// import { BASE_URL } from './../../utils/config';
// import './featuredtourlist.css';

// const FeaturedTourList = () => {
//    // Fetch featured tours from the backend API
//    const { data: featuredTours, loading, error } = useFetch(`${BASE_URL}/package/packages/`);

//    // Debugging: Log fetched data, loading, and error states
//    console.log("Loading State:", loading);
//    console.log("Error State:", error);
//    console.log("Fetched Data:", featuredTours);

//    // Check if data exists and validate its structure
//    const tours = Array.isArray(featuredTours) ? featuredTours : featuredTours?.results || [];

//    return (
//       <div className="featured-tour-list">
//          {loading && <h4>Loading...</h4>} {/* Display loading state */}
//          {error && <h4>Error: {error}</h4>} {/* Display error message */}
//          {!loading && !error && tours.length === 0 && <h4>No tours available</h4>} {/* Handle empty data */}
         
//          {/* Render tour cards */}
//          {!loading && !error && tours.map((tour) => (
//             <div className="tour-card-item" key={tour.id}>
//                <TourCard tour={tour} />
//             </div>
//          ))}
//       </div>
//    );
// };

// export default FeaturedTourList;


import React, { useState } from 'react';
import TourCard from '../../shared/TourCard';
import useFetch from './../../hooks/useFetch';
import { BASE_URL } from './../../utils/config';
import './featuredtourlist.css';
import { Container, Row, Button } from 'reactstrap';

const FeaturedTourList = () => {
   const { data: featuredTours, loading, error } = useFetch(`${BASE_URL}/package/packages/`);
   const [currentPage, setCurrentPage] = useState(1);
   const itemsPerPage = 8; // Number of tours per page

   // Calculate pagination
   const totalPages = Math.ceil((featuredTours?.length || 0) / itemsPerPage);
   const startIndex = (currentPage - 1) * itemsPerPage;
   const endIndex = startIndex + itemsPerPage;
   const currentTours = featuredTours?.slice(startIndex, endIndex);

   const handleNext = () => {
      if (currentPage < totalPages) {
         setCurrentPage(currentPage + 1);
      }
   };

   const handlePrev = () => {
      if (currentPage > 1) {
         setCurrentPage(currentPage - 1);
      }
   };

   return (
      <div className="featured-tour-list">
         {loading && <h4>Loading...</h4>}
         {error && <h4>Error: {error}</h4>}
         {!loading && !error && featuredTours.length === 0 && <h4>No tours available</h4>}
         {!loading && !error && currentTours.map(tour => (
            <div className="tour-card-item" key={tour.id}>
               <TourCard tour={tour} />
            </div>
         ))}

         {/* Pagination Controls */}
         {!loading && !error && featuredTours.length > itemsPerPage && (
            <div className="pagination-controls">
               <Button className="btn primary__btn" onClick={handlePrev} disabled={currentPage === 1}>
                  Previous
               </Button>
               <span className="pagination-info">
                  Page {currentPage} of {totalPages}
               </span>
               <Button className="btn primary__btn" onClick={handleNext} disabled={currentPage === totalPages}>
                  Next
               </Button>
            </div>
         )}
      </div>
   );
}

export default FeaturedTourList;
