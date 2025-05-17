import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
    Grid, 
    Card, 
    CardContent, 
    Typography, 
    Button, 
    Chip,
    CircularProgress,
    Alert,
    Snackbar
} from '@mui/material';
import { fetchPrograms } from '../../features/programs/programSlice';
import { RootState, useAppDispatch } from '../../app/store';

const ProgramList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { programs, isLoading, error } = useSelector((state: RootState) => state.programs);
    const { user } = useSelector((state: RootState) => state.auth);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'error' as 'success' | 'error' | 'warning'
    });

    useEffect(() => {
        dispatch(fetchPrograms());
    }, [dispatch]);

    // Handle apply button click
    const handleApply = (programId: string) => {
        console.log('Applying to program:', programId);
        if (!user) {
            setNotification({
                open: true,
                message: 'You must be logged in to apply for a program',
                type: 'error'
            });
            return;
        }
        
        // Ensure programId is a string and properly encoded
        const encodedProgramId = encodeURIComponent(String(programId));
        console.log('Program ID being passed:', encodedProgramId);
        
        // Navigate to application form with program ID
        navigate(`/applications/new?program=${encodedProgramId}`);
    };

    // Close notification
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (isLoading) {
        return (
            <Grid container justifyContent="center">
                <CircularProgress />
            </Grid>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Available Programs
            </Typography>
            <Grid container spacing={3}>
                {programs.map((program) => (
                    <Grid item xs={12} md={6} key={program.id}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    {program.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {program.description}
                                </Typography>
                                <Typography variant="body2">
                                    Duration: {program.duration}
                                </Typography>
                                <Typography variant="body2">
                                    Deadline: {new Date(program.deadline).toLocaleDateString()}
                                </Typography>
                                <div style={{ marginTop: 16 }}>
                                    {program.requirements.map((req, index) => (
                                        <Chip
                                            key={index}
                                            label={req}
                                            size="small"
                                            sx={{ mr: 1, mb: 1 }}
                                        />
                                    ))}
                                </div>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ mt: 2 }}
                                    onClick={() => handleApply(program.id)}
                                >
                                    Apply Now
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            
            <Snackbar
                open={notification.open}
                autoHideDuration={6000}
                onClose={handleCloseNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert onClose={handleCloseNotification} severity={notification.type}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ProgramList;

