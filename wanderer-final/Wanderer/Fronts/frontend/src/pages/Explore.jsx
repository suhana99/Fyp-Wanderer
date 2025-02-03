import React from 'react'
import TopDeals from '../components/Popular-destination/TopDeals'
import Calendar from './Calendar'
import Recommendations from './Recommendations'
function Explore() {
  return (
    <div>
      {/* <TopDeals /> */}
      <div className="top-deals-header">
              <h2>Explore Events Calendar</h2>
              <p>Find Events Based on your Journey Dates </p>
            </div>
      <Calendar />
      {/* <Recommendations /> */}
    </div>
  )
}

export default Explore