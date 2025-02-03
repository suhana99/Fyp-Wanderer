import React, { useRef } from 'react';
import './search-bar.css';
import { Col, Form, FormGroup } from 'reactstrap';
import { BASE_URL } from '../utils/config';
import { useNavigate } from 'react-router-dom';

const SearchBar = () => {
  const locationRef = useRef('');
  const durationRef = useRef('');
  // const costRef = useRef(''); // New ref for the cost input
  const navigate = useNavigate();

  const searchHandler = async () => {
    const location = locationRef.current.value;
    const duration = durationRef.current.value;
    // const price = costRef.current.value; // Get the cost value

    // Build the query string with only non-empty fields
    let queryString = '';

    if (location) queryString += `location=${location}&`;
    if (duration) queryString += `duration=${duration}&`;
    // if (price) queryString += `price__lte=${price}&`; // Include the cost in the query string

    // console.log("haha",queryString);
    

    // Remove the trailing '&'
    queryString = queryString.slice(0, -1);

    if (!queryString) {
      alert('Please fill in at least one field.');
      return;
    }

    try {
      // Fetch filtered data from backend
      const res = await fetch(`${BASE_URL}/package/packages/?${queryString}`);
      if (!res.ok) throw new Error('Something went wrong!');

      const result = await res.json();

      // Check if result contains the expected data structure
      if (!result || result.length === 0) {
        alert('No results found!');
        return;
      }

      // Navigate to results page with data passed in the state
      navigate(`/tours/search`, { state: result }); // Pass the full result
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Col lg="12">
      <div className="search__bar">
        <Form className="d-flex align-items-center gap-4">
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-map-pin-line"></i>
            </span>
            <div>
              <h6>Location</h6>
              <input type="text" placeholder="Where are you going?" ref={locationRef} />
            </div>
          </FormGroup>
          <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-calendar-2-fill"></i>
            </span>
            <div>
              <h6>Days</h6>
              <input type="number" placeholder="Approx days" ref={durationRef} />
            </div>
          </FormGroup>
          {/* New Cost Field */}
          {/* <FormGroup className="d-flex gap-3 form__group form__group-fast">
            <span>
              <i className="ri-money-dollar-circle-line"></i>
            </span>
            <div>
              <h6>Cost</h6>
              <input type="number" placeholder="Max cost" ref={costRef} />
            </div>
          </FormGroup> */}

          <span className="search__icon" type="submit" onClick={searchHandler}>
            <i className="ri-search-line"></i>
          </span>
        </Form>
      </div>
    </Col>
  );
};

export default SearchBar;