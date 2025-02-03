import React, { useContext, useState } from 'react';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import '../styles/login.css';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from '../assets/images/user.png';
import logo from '../assets/images/wann.png';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

const Login = () => {
   const [credentials, setCredentials] = useState({
      email: '',
      password: ''
   });

   const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
   const [forgotPasswordError, setForgotPasswordError] = useState('');
   const { dispatch } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleChange = (e) => {
      setCredentials((prev) => ({ ...prev, [e.target.id]: e.target.value }));
      localStorage.setItem("user_email1", e.target.value);
   };

   const handleClick = async (e) => {
      e.preventDefault();
   
      dispatch({ type: 'LOGIN_START' });
   
      try {
         const res = await fetch(`${BASE_URL}/users/login/`, {
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
   
         // Store tokens and email in localStorage
         localStorage.setItem('access_token', result.access);
         localStorage.setItem('refresh_token', result.refresh);
         localStorage.setItem('user_email', credentials.email);
         
         // Optionally store user type or role in localStorage if needed
         if (result.message.includes('Admin')) {
            localStorage.setItem('role', 'admin');
            navigate('/seller-dashboard'); // Redirect to admin dashboard
         } else if (result.message.includes('Hotel_owner')) {
            localStorage.setItem('role', 'hotel_owner');
            navigate('/hotel-dashboard'); // Redirect to seller dashboard
         }  else if (result.message.includes('Activity_Lister')) {
            localStorage.setItem('role', 'activity_lister');
            navigate('/activity-dashboard'); // Redirect to seller dashboard
         }  else if (result.message.includes('Event_Lister')) {
            localStorage.setItem('role', 'event_lister');
            navigate('/event-dashboard'); // Redirect to seller dashboard
         } else {
            localStorage.setItem('role', 'user');
            navigate('/home'); // Redirect to user home page
         }
   
         dispatch({ type: 'LOGIN_SUCCESS', payload: result });
      } catch (err) {
         dispatch({ type: 'LOGIN_FAILURE', payload: err.message });
         alert('An error occurred while logging in.');
      }
   };

   const handleForgotPassword = async (email) => {
      try {
         const res = await fetch(`${BASE_URL}/users/forgot-password/`, {  
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
         });

         const result = await res.json();

         if (!res.ok) {
            setForgotPasswordError(result.error || 'Something went wrong!');
            return;
         }

         alert('Password reset link sent to your email!');
      } catch (err) {
         setForgotPasswordError('An error occurred while requesting password reset.');
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
                        <h2>Login</h2>

                        <Form onSubmit={handleClick}>
                           <FormGroup>
                              <input
                                 type="email"
                                 placeholder="Email"
                                 id="email"
                                 value={credentials.email}
                                 onChange={
                                    handleChange
                                 }
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
                        <p>Don't have an account? <Link to='/register'>Create</Link></p>

                        <p>
                           Forgot password?{' '}
                           <span
                              onClick={() => {
                                 const email = prompt("Please enter your email:");
                                 if (email) {
                                    setForgotPasswordEmail(email); // Update state with email
                                    handleForgotPassword(email); // Call function to handle password reset
                                 }
                              }}
                              style={{ cursor: 'pointer', textDecoration: 'underline' }}
                           >
                              Click here
                           </span>
                        </p>
                        {forgotPasswordError && <p className="text-danger">{forgotPasswordError}</p>}
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
};

export default Login;
