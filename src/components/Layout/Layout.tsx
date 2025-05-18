import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../app/store';
import { logout } from '../../features/auth/authSlice';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppBar position="static">
                <Toolbar>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            flexGrow: 1,
                            textDecoration: 'none',
                            color: 'inherit'
                        }}
                    >
                        B3THMAK APPLICATION
                    </Typography>
                    {user ? (
                        <>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/dashboard"
                                sx={{ mx: 1 }}
                            >
                                Dashboard
                            </Button>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/programs"
                                sx={{ mx: 1 }}
                            >
                                Programs
                            </Button>
                            <Button 
                                color="inherit" 
                                component={RouterLink} 
                                to="/applications"
                                sx={{ mx: 1 }}
                            >
                                My Applications
                            </Button>
                            
                            {/* Admin Navigation Links */}
                            {user.role === 'admin' && (
                                <>
                                    <Button 
                                        color="inherit" 
                                        component={RouterLink} 
                                        to="/admin/applications"
                                        sx={{ mx: 1 }}
                                    >
                                        Review Applications
                                    </Button>
                                    <Button 
                                        color="inherit" 
                                        component={RouterLink} 
                                        to="/admin/programs"
                                        sx={{ mx: 1 }}
                                    >
                                        Manage Programs
                                    </Button>
                                </>
                            )}
                            
                            <Typography sx={{ mr: 2 }}>
                                Welcome, {user.firstName}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/login"
                            >
                                Login
                            </Button>
                            <Button
                                color="inherit"
                                component={RouterLink}
                                to="/register"
                            >
                                Register
                            </Button>
                        </>
                    )}
                </Toolbar>
            </AppBar>
            <Container component="main" sx={{ mt: 4, mb: 4, flex: 1 }}>
                {children}
            </Container>
            <Box
                component="footer"
                sx={{
                    py: 3,
                    px: 2,
                    mt: 'auto',
                    backgroundColor: (theme) =>
                        theme.palette.mode === 'light'
                            ? theme.palette.grey[200]
                            : theme.palette.grey[800],
                }}
            >
                <Container maxWidth="sm">
                    <Typography variant="body1" align="center">
                        © {new Date().getFullYear()} University Application System
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
};

export default Layout;

