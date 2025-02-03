import React from 'react';
import './TopDeals.css'; 
import { Container, Row, Col } from 'reactstrap';
import pokhara from '../../assets/images/pokhara.jpg';
import lumbini from '../../assets/images/lumbini.jpg';
import kathmandu from '../../assets/images/kathmandu.jpg';
import rara from '../../assets/images/rara.jpg';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from './../../utils/config';

const topDealsData = [
  { title: 'Pokhara', tours: '5+ Tours', image: pokhara },
  { title: 'Lumbini', tours: '5+ Tours', image: lumbini },
  { title: 'Kathmandu', tours: '5+ Tours', image: kathmandu },
  { title: 'Annapurna Circuit', tours: '5+ Tours', image: rara },
];

const TopDeals = () => {
  const navigate = useNavigate();

  const handleLocationClick = async (location) => {
    try {
      // Build the query string
      const queryString = `location=${location}`;

      // Fetch filtered data from the backend
      const res = await fetch(`${BASE_URL}/package/packages/?${queryString}`);
      if (!res.ok) throw new Error('Something went wrong!');

      const result = await res.json();

      // Navigate to results page with data passed in the state
      if (result && result.length > 0) {
        navigate(`/tours/search`, { state: result });
      } else {
        alert('No results found!');
      }
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Container>
      <Row>
        <Col lg="12" className="mb-5">
          <div className="top-deals-container">
            <div className="top-deals-header">
              <h2>Top Deals Around Nepal</h2>
              <p>The best tours and trip deals, globally.</p>
            </div>

            <div className="deals-wrapper">
              {topDealsData.map((deal, index) => (
                <div
                  key={index}
                  className="deal-card"
                  onClick={() => handleLocationClick(deal.title)} // Pass location on click
                >
                  <img src={deal.image} alt={deal.title} className="deal-image" />
                  <div className="deal-content">
                    <h3>{deal.title}</h3>
                    <p>{deal.tours}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default TopDeals;
