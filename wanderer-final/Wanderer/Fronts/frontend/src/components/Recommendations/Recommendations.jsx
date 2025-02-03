import React, { useEffect, useState } from 'react';
import package1Img from '../../assets/images/packages/Package_1.jpg';
import package38Img from '../../assets/images/packages/Package_38.jpg';
import package32Img from '../../assets/images/packages/Package_30.jpg';
import package3Img from '../../assets/images/packages/Package_3.jpg';
import package9Img from '../../assets/images/packages/Package_9.jpg';
import package2Img from '../../assets/images/packages/Package_2.jpg';
import './featuredtourlist.css';
import TourCard from '../../shared/TourCard';
import useFetch from './../../hooks/useFetch';
import { BASE_URL } from './../../utils/config';

// Map package names to images (if needed for images)
const packageImages = {
  'Package 1': package1Img,
  'Package 38': package38Img,
  'Package 32': package32Img,
  'Package 3': package3Img,
  'Package 9': package9Img,
  'Package 2': package2Img,
};

// FeaturedTourList Component
const PackagesList = () => {
  const [tourIds, setTourIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch recommended tour IDs from the recommendation API
  useEffect(() => {
    const userEmail = localStorage.getItem('user_email'); // Retrieve the email from localStorage

    const fetchRecommendTours = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8001/predict/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            accept: 'application/json',
          },
          body: JSON.stringify({ user_email: userEmail }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommended tours.');
        }

        const data = await response.json();
        const recommendedPackageIds = data.recommended_packages.map(tour => tour.package_id); // Ensure package_id is used
        console.log("recommend",recommendedPackageIds);
        
        setTourIds(recommendedPackageIds);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendTours();
  }, []);

  // Fetch featured tours filtered by tourIds
  const { data: featuredTours, loading: fetchLoading, error: fetchError } = useFetch(
    tourIds.length > 0 ? `${BASE_URL}/package/packages/?ids=${tourIds.join(',')}` : `${BASE_URL}/package/packages/`
  );

  // Display loading or error states
  if (loading || fetchLoading) {
    return <h4>Loading...</h4>;
  }

  if (error || fetchError) {
    return <h4>Error: {error || fetchError}</h4>;
  }

  // Filtered tours to display only those with matched IDs
  const filteredTours = featuredTours?.filter(tour => tourIds.includes(tour.id)) || [];
  console.log("filtered",filteredTours);
  

  return (
    <div className="featured-tour-list">
      {filteredTours.length === 0 ? (
        <h4>No tours available</h4>
      ) : (
        filteredTours.map(tour => (
          <div className="tour-card-item" key={tour.id}>
            <TourCard tour={tour} />
          </div>
        ))
      )}
    </div>
  );
};

export default PackagesList;
