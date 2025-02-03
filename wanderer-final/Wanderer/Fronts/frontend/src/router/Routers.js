import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import ThankYou from '../pages/ThankYou'
import Home from './../pages/Home'
import Login from './../pages/Login'
import Register from './../pages/Register'
import SearchResultList from './../pages/SearchResultList'
import TourDetails from './../pages/TourDetails'
import Tours from './../pages/Tours'
import FeaturedTourList from '../components/Featured-tours/FeaturedTourList'
import PasswordReset from '../pages/PasswordReset'
import SellerDashboard from '../pages/SellerDashboard'
import ActivitySeller from '../pages/ActivitySeller'
import EventLister from '../pages/EventLister'
import AdminLogin from '../pages/AdminLogin'
import CustomizeHotelsAndActivities from '../pages/CustomizeHotelsAndActivities'
import Logout from '../pages/Logout'
import TravelersDiary from '../pages/TravelersDiary'
import BookingHistory from '../pages/BookingHistory'
import TopDeals from '../components/Popular-destination/TopDeals'
import Explore from '../pages/Explore'
// import '../styles/NoLayout.css'
// import AdminDashboard from '../pages/AdminDashboard'

const Routers = () => {
   return (
      <Routes>
         <Route path='/' element={<Navigate to='/home'/>} />
         <Route path='/admin/login' element={<AdminLogin/>}/>
         <Route path='/home' element={<Home/>} />
         <Route path='/tours' element={<Tours/>} />
         <Route path='/package/:id' element={<TourDetails/>} />
         <Route path='/diary' element={<TravelersDiary/>}/>
         <Route path='/history/' element={<BookingHistory/>}/>
         <Route path='/login' element={<Login/>} />
         <Route path='/logout' element={<Logout/>}/>
         <Route path='/register' element={<Register/>} />
         <Route path='/thank-you' element={<ThankYou/>} />
         <Route path='/tours/search' element={<SearchResultList/>} />
         <Route path='/about' element={<FeaturedTourList/>}/>
         <Route path="/reset-password/:token" element={<PasswordReset/>} />
         <Route path="/hotel-dashboard" element={<SellerDashboard/>}/>
         <Route path="/activity-dashboard" element={<ActivitySeller/>}/>
         <Route path="/event-dashboard" element={<EventLister/>}/>
         <Route path='/customize/' element={<CustomizeHotelsAndActivities/>}/>
         {/* <Route path='/admin-dashboard' element={<AdminDashboard/>}/> */}
         <Route path='/destination/' element={<Explore/>}/>
      </Routes>
   )
}

export default Routers