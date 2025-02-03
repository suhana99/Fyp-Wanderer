import React, { useState, useContext } from 'react';
import { Container, Row, Col, Form, FormGroup, Button, Input } from 'reactstrap';
import '../styles/login.css';
import { Link, useNavigate } from 'react-router-dom';
import userIcon from '../assets/images/user.png';
import logo from '../assets/images/wann.png';
import { AuthContext } from '../context/AuthContext';
import { BASE_URL } from '../utils/config';

const Register = () => {
   const [credentials, setCredentials] = useState({
      email: '',
      password: '',
      role: ''
   });

   const { dispatch } = useContext(AuthContext);
   const navigate = useNavigate();

   const handleChange = (e) => {
      setCredentials(prev => ({ ...prev, [e.target.id]: e.target.value }));
   };

   const handleClick = async (e) => {
      e.preventDefault();

      try {
         const res = await fetch(`${BASE_URL}/users/register/`, {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json'
            },
            body: JSON.stringify(credentials)
            
         });

         const result = await res.json();
         console.log("result", result);

         if (!res.ok) {
            alert(result.error || 'Registration failed. Please try again.');
            return;
         }

         console.log("Registration successful:", result);
         alert('Registration successful!');  // Notify the user

         dispatch({ type: 'REGISTER_SUCCESS', payload: result });
         navigate('/login');
      } catch (err) {
         alert('An error occurred: ' + err.message);
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
                        <h2>Register</h2>

                        <Form onSubmit={handleClick}>
                           <FormGroup>
                              <Input
                                 type="email"
                                 placeholder='Email'
                                 id='email'
                                 value={credentials.email}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>
                           <FormGroup>
                              <Input
                                 type="password"
                                 placeholder='Password'
                                 id='password'
                                 value={credentials.password}
                                 onChange={handleChange}
                                 required
                              />
                           </FormGroup>
                           <FormGroup>
                              <Input
                                 type="select"
                                 id='role'
                                 value={credentials.role}
                                 onChange={handleChange}
                                 required
                              >
                                 <option value="">Select Role</option>
                                 <option value="user">User</option>
                                 <option value="hotel_owner">Hotel Owner</option>
                                 <option value="activity_lister">Activity Lister</option>
                                 <option value="event_lister">Event Lister</option>
                              </Input>
                           </FormGroup>
                           <Button className='btn secondary__btn auth__btn' type='submit'>
                              Create Account
                           </Button>
                        </Form>
                        <p>Already have an account? <Link to='/login'>Login</Link></p>
                     </div>
                  </div>
               </Col>
            </Row>
         </Container>
      </section>
   );
}

export default Register;