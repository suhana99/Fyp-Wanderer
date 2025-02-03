import React, { useState, useEffect } from 'react';
import CommonSection from './../shared/CommonSection';
import { Container, Row, Col } from 'reactstrap';
import { useLocation } from 'react-router-dom';
import TourCard from '../shared/TourCard';
import Newsletter from './../shared/Newsletter';

const SearchResultList = () => {
  const location = useLocation();  // Access the location state passed from the search page
  const [data, setData] = useState(location.state || []);  // Initialize data with the state or empty array

  useEffect(() => {
    console.log("Search results:", location.state);  // Log the data
    if (!location.state || location.state.length === 0) {
      alert('No results found!');
    }
  }, [location.state]);

  return (
    <>
      <CommonSection title={'Tour Search Result'} />
      <section>
        <Container>
          <Row>
            {
              data.length === 0
                ? <h4 className='text-center'>No Tour Found</h4>
                : data.map((tour) => (
                    <Col lg='3' className='mb-4' key={tour.id}>  {/* Use unique id for key */}
                      <TourCard tour={tour} />
                    </Col>
                  ))
            }
          </Row>
        </Container>
      </section>
    </>
  );
};

export default SearchResultList;
