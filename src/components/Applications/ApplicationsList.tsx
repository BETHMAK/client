import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchApplications } from '../../features/applications/applicationSlice';
import { GridContainer, GridItem } from '../Common/Grid';

const getStatusColor = (status: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    switch (status) {
        case 'pending':
            return 'default';
        case 'under-review':
            return 'info';
        case 'accepted':
            return 'success';
        case 'rejected':
            return 'error';
        default:
            return 'default';
    }
};

const ApplicationsList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { applications, isLoading, error } = useAppSelector((state) => state.applications);

    useEffect(() => {
        dispatch(fetchApplications());
    }, [dispatch]);

    if (isLoading) {
        return (
            <GridContainer justifyContent="center">
                <CircularProgress />
            </GridContainer>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <div>
            <GridContainer justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h4">
                    My Applications
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/programs')}
                >
                    Browse Programs
                </Button>
            </GridContainer>

            {applications.length === 0 ? (
                <Alert severity="info">
                    You haven't submitted any applications yet. Browse our programs to apply!
                </Alert>
            ) : (
                <GridContainer spacing={3}>
                    {applications.map((application) => (
                        <GridItem xs={12} key={application.id}>
                            <Card>
                                <CardContent>
                                    <GridContainer spacing={2}>
                                        <GridItem xs={12}>
                                            <Typography variant="h6">
                                                {application.program.name}
                                            </Typography>
                                            <Chip
                                                label={application.status}
                                                color={getStatusColor(application.status)}
                                                sx={{ mt: 1 }}
                                            />
                                        </GridItem>
                                        
                                        <GridItem xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Submitted: {new Date(application.submissionDate).toLocaleDateString()}
                                            </Typography>
                                        </GridItem>
                                        
                                        <GridItem xs={12} sm={6}>
                                            <Typography variant="body2" color="text.secondary">
                                                Last Updated: {new Date(application.lastUpdated).toLocaleDateString()}
                                            </Typography>
                                        </GridItem>

                                        {application.notes && application.notes.length > 0 && (
                                            <GridItem xs={12}>
                                                <Typography variant="subtitle2">
                                                    Latest Note:
                                                </Typography>
                                                <Typography variant="body2">
                                                    {application.notes[application.notes.length - 1].content}
                                                </Typography>
                                            </GridItem>
                                        )}

                                        <GridItem xs={12}>
                                            <Button
                                                variant="outlined"
                                                onClick={() => navigate(`/applications/${application.id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </GridItem>
                                    </GridContainer>
                                </CardContent>
                            </Card>
                        </GridItem>
                    ))}
                </GridContainer>
            )}
        </div>
    );
};

export default ApplicationsList;

