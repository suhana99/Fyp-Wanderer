import React, { useEffect, useRef, useContext, useState } from 'react';
import { Container, Row, Button } from 'reactstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { FaHeart, FaDollarSign, FaRupeeSign } from 'react-icons/fa'; // Importing icons
import Logo from '../../assets/images/logo1.png';
import './header.css';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/config';


const Header = () => {
   const headerRef = useRef(null);
   const menuRef = useRef(null);
   const navigate = useNavigate();
   const { user, dispatch } = useContext(AuthContext);
   
   // State for packages and selected currency
   const [packages, setPackages] = useState([]);
   // const [currency, setCurrency] = useState('NPR'); // Default to NPR
   // const [conversionRate, setConversionRate] = useState(0.0075); // Default conversion rate for NPR to USD

   // Fetch packages from backend API
   useEffect(() => {
      const fetchPackages = async () => {
         try {
            const res = await fetch(`${BASE_URL}/package/packages/`); // Replace with your actual API endpoint
            const data = await res.json();
            setPackages(data);
         } catch (error) {
            console.error('Error fetching packages:', error);
         }
      };
      
      fetchPackages();
   }, []);


const nav__links = [
   {
      path: '/home',
      display: 'Home'
   },
   {
      path: '/about',
      display: 'Packages'
   },
   {
      path: '/destination',
      display: 'Explore'
   },
   {
      path: '/diary',
      display: 'Diary'
   },
   
];
if (user) {
   nav__links.push({
      path: '/history',
      display: 'History'
   });
}


   // Toggle currency between NPR and USD
   // const toggleCurrency = () => {
   //    setCurrency((prevCurrency) => {
   //       const newCurrency = prevCurrency === 'NPR' ? 'USD' : 'NPR';
         
   //       // Update package prices based on selected currency
   //       const updatedPackages = packages.map(pkg => ({
   //          ...pkg,
   //          price: newCurrency === 'USD'
   //             ? (pkg.price * conversionRate).toFixed(2)  // Convert to USD
   //             : (pkg.price / conversionRate).toFixed(2)  // Convert to NPR
   //       }));

   //       setPackages(updatedPackages);
   //       return newCurrency;
   //    });
   // };

   const logout = () => {
      dispatch({ type: 'LOGOUT' });
      navigate('/');
   };

   const stickyHeaderFunc = () => {
      window.addEventListener('scroll', () => {
         if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
            headerRef.current.classList.add('sticky__header');
         } else {
            headerRef.current.classList.remove('sticky__header');
         }
      });
   };

   useEffect(() => {
      stickyHeaderFunc();
      return () => window.removeEventListener('scroll', stickyHeaderFunc);
   }, []);

   const toggleMenu = () => menuRef.current.classList.toggle('show__menu');


   return (
      <header className='header' ref={headerRef}>
         <Container>
            <Row>
               <div className="nav__wrapper d-flex align-items-center justify-content-between">
                  {/* ========== LOGO ========== */}
                  <div className="logo">
                     <img src={Logo} alt="Logo" />
                  </div>
                  {/* ========================== */}

                  {/* ========== MENU START ========== */}
                  <div className="navigation" ref={menuRef} onClick={toggleMenu}>
                     <ul className="menu d-flex align-items-center gap-5">
                        {nav__links.map((item, index) => (
                           <li className="nav__item" key={index}>
                              <NavLink to={item.path} className={navClass => navClass.isActive ? 'active__link' : ''}>{item.display}</NavLink>
                           </li>
                        ))}
                     </ul>
                  </div>
                  {/* ================================ */}

                  <div className="nav__right d-flex align-items-center gap-4">
                     {/* <div className="nav__icons d-flex align-items-center gap-3"> */}
                        
                        {/* Currency Change Icon - toggles between Dollar and Rupees */}
                        {/* <span className="currency__icon" onClick={toggleCurrency} style={{ cursor: 'pointer' }}> */}
                           {/* {currency === 'USD' ? <FaDollarSign size={24} /> : <FaRupeeSign size={24} />} */}
                        {/* </span> */}
                     {/* </div> */}

                     <div className="nav__btns d-flex align-items-center gap-2">
                        {user ? (
                           <>
                              <h5 className='mb-0'>{user.username}</h5>
                              <Button className='btn btn-dark' onClick={logout}>Logout</Button>
                           </>
                        ) : (
                           <>
                              <Button className='btn secondary__btn'><Link to='/login'>Login</Link></Button>
                              <Button className='btn primary__btn'><Link to='/register'>Register</Link></Button>
                           </>
                        )}
                     </div>

                     <span className="mobile__menu" onClick={toggleMenu}>
                        <i className="ri-menu-line"></i>
                     </span>
                  </div>
               </div>
            </Row>
         </Container>
      </header>
   );
};

export default Header;