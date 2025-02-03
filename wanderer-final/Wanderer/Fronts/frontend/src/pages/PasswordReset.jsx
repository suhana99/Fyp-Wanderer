import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, FormGroup, Button } from 'reactstrap';
import { BASE_URL } from '../utils/config';

const PasswordReset = () => {
    const { token } = useParams(); // Get the token from the URL
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        new_password: '',
        confirm_password: '',
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setPasswords((prev) => ({
            ...prev,
            [e.target.id]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            setError("Passwords do not match!");
            return;
        }

        try {
            const res = await fetch(`${BASE_URL}/users/reset-password/${token}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ new_password: passwords.new_password,confirm_password:passwords.confirm_password }),
            });

            const result = await res.json();

            if (!res.ok) {
                setError(result.error || 'Something went wrong!');
                return;
            }

            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError('An error occurred while resetting the password.');
        }
    };

    return (
        <section>
            <Container>
                <Row>
                    <Col lg="6" className="m-auto">
                        <h2>Reset Password</h2>
                        {error && <p className="text-danger">{error}</p>}
                        {success && <p className="text-success">{success}</p>}
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <input
                                    type="password"
                                    id="new_password"
                                    placeholder="Enter new password"
                                    value={passwords.new_password}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>
                            <FormGroup>
                                <input
                                    type="password"
                                    id="confirm_password"
                                    placeholder="Confirm new password"
                                    value={passwords.confirm_password}
                                    onChange={handleChange}
                                    required
                                />
                            </FormGroup>
                            <Button className="btn secondary__btn auth__btn" type="submit">
                                Reset Password
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default PasswordReset;
