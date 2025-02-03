import React from 'react';
import { Card, CardBody } from 'reactstrap';
import { Link } from 'react-router-dom';
import './tour-card.css';

const TourCard = ({ tour }) => {
  const { id, image, name, description, price, location, duration, availability, featured } = tour;
  console.log(image)
  return (
    <div className='tour__card'>
      <Card>
        <div className="tour__img">
          <img src={image} alt={`Tour in ${location}: ${name}`} style={{maxHeight:"250px",minHeight:"250px"}}/>
          {featured && <span className="featured-badge">Featured</span>} {/* Show featured badge if applicable */}
        </div>

        <CardBody>
          <div className="card__top d-flex align-items-center justify-content-between">
            <span className="tour__location d-flex align-items-center gap-1">
              <i className='ri-map-pin-line'></i> {location}
            </span>
          </div>

          <h5 className='tour__title'>
            <Link to={`/tours/${id}`}>{name}</Link> {/* Link to tour details */}
          </h5>
          
          <p className='tour__description' style={{maxHeight:"60px",minHeight:"60px"}}>{description}</p> {/* Displaying description */}
          <div className="card__details d-flex justify-content-between mt-2">
            <span>{duration} days</span>
            <span>Availability: {availability ? 'Available' : 'Not Available'}</span>
          </div>

          <div className="card__bottom d-flex align-items-center justify-content-between mt-3">
            <h5>${price} <span>/ per person</span></h5>
            <Link to={`/package/${id}`}>
              <button className='booking__btn'>View details</button> {/* Book Now button */}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default TourCard;
