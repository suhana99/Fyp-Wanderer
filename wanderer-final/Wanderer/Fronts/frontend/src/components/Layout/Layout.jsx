import React from 'react'
import Header from './../Header/Header'
import Routers from '../../router/Routers'
import Footer from './../Footer/Footer'
import '../../styles/NoLayout.css'
import { useLocation } from 'react-router-dom'

const Layout = () => {
   const location = useLocation()
   
   const noLayoutRoutes = [
      'hotel-dashboard', 
      'activity-dashboard', 
      'event-dashboard'
    ]
    
    const isNoLayoutRoute = noLayoutRoutes.some(route => 
      location.pathname.includes(route)
    )
   return (
      <>
         {!isNoLayoutRoute && <Header />}
         <Routers />
         {!isNoLayoutRoute && <Footer />}   
      </>
   )
}

export default Layout