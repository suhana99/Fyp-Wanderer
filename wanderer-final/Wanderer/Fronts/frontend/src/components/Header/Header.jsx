import React, { useEffect, useRef, useContext, useState } from 'react';
import { Container, Row, Button } from 'reactstrap';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import Logo from '../../assets/images/logo1.png';
import './header.css';
import { AuthContext } from '../../context/AuthContext';
import { BASE_URL } from '../../utils/config';


const Header = () => {
   const headerRef = useRef(null);
   const menuRef = useRef(null);
   const navigate = useNavigate();
   const { user, dispatch } = useContext(AuthContext);
   const [packages, setPackages] = useState([]);
   useEffect(() => {
      const fetchPackages = async () => {
         try {
            const res = await fetch(`${BASE_URL}/package/packages/`);
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