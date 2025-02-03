import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import '../styles/login.css';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from '../assets/images/user.png';
import logo from '../assets/images/wann.png';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

const AdminLogin = () => {
   const [credentials, setCredentials] = useState({
      email: '',
      password: ''
   });

   const { dispatch } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleChange = (e) => {
      setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
   };

   const handleClick = async (e) => {
      e.preventDefault();
   
      dispatch({ type: 'LOGIN_START' });
   
      try {
         const res = await fetch(`${BASE_URL}/adminspage/login/`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
         });
   
         const result = await res.json();
   
         if (!res.ok) {
            alert(result.error || 'Something went wrong!');
            dispatch({ type: 'LOGIN_FAILURE', payload: result.error || 'Login failed.' });
            return;
         }
   
         // Store tokens in localStorage
         localStorage.setItem('access_token', result.access);
         localStorage.setItem('refresh_token', result.refresh);
   
         // Store the role as 'admin' for Admin users
        
        localStorage.setItem('role', 'admin');
        navigate('/admin-dashboard'); // Redirect to admin dashboard
        
         dispatch({ type: 'LOGIN_SUCCESS', payload: result });

      } catch (err) {
         dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
         alert(err.message);
      }
   };

   return (
      <section>
         <Container>
            <Row>
               <Col lg='8' className='m-auto'>
                  <div className="login__container d-flex justify-content-between">
                     <div className="login__img">
                        <img src={logo} alt="Logo" />
                     </div>

                     <div className="login__form">
                        <div className="user">
                           <img src={userIcon} alt="User Icon" />
                        </div>
                        <h2>Admin Login</h2>

                        <Form onSubmit={handleClick}>
                           <FormGroup>
                              <input
                                 type="email"
                                 placeholder="Admin Email"
                                 id="email"
                                 value={credentials.email}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>
                           <FormGroup>
                              <input
                                 type="password"
                                 placeholder="Password"
                                 id="password"
                                 value={credentials.password}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>
                           <Button className="btn secondary__btn auth__btn" type="submit">
                              Login
                           </Button>
                        </Form>
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default AdminLogin;
