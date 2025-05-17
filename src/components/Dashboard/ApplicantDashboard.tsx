import React from 'react';
import { Grid, Typography, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../app/store';
import { useEffect, useState } from 'react';
import { fetchApplications } from '../../features/applications/applicationSlice';
import { fetchDocuments } from '../../features/documents/documentSlice';

const ApplicantDashboard = () => {
    const dispatch = useAppDispatch();
    const { user } = useAppSelector((state) => state.auth);
    const { applications } = useAppSelector((state) => state.applications);
    const { documents } = useAppSelector((state) => state.documents);
    const [documentStatus, setDocumentStatus] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        rejected: 0
    });

    useEffect(() => {
        dispatch(fetchApplications());
        // Fetch documents for all applications
        dispatch(fetchDocuments('all'));
    }, [dispatch]);

    useEffect(() => {
        // Count documents by status
        const stats = {
            total: documents.length,
            pending: documents.filter(doc => doc.status === 'pending').length,
            approved: documents.filter(doc => doc.status === 'approved').length,
            rejected: documents.filter(doc => doc.status === 'rejected').length
        };
        setDocumentStatus(stats);
    }, [documents]);

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Welcome, {user?.firstName}!
            </Typography>

            <Grid container spacing={3}>
                {/* My Applications Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            My Applications
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/applications"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                        >
                            View My Applications
                        </Button>
                    </Paper>
                </Grid>

                {/* Available Programs Section */}
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Available Programs
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/programs"
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                        >
                            Browse Programs
                        </Button>
                    </Paper>
                </Grid>

                {/* Upload Documents Section */}
                <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Documents
                        </Typography>
                        
                        {/* Document Statistics */}
                        <Grid container spacing={2} sx={{ mb: 2 }}>
                            <Grid item xs={6} sm={3}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 1, 
                                        textAlign: 'center',
                                        bgcolor: 'primary.light',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="h5">{documentStatus.total}</Typography>
                                    <Typography variant="body2">Total</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 1, 
                                        textAlign: 'center',
                                        bgcolor: 'warning.light',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="h5">{documentStatus.pending}</Typography>
                                    <Typography variant="body2">Pending</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 1, 
                                        textAlign: 'center',
                                        bgcolor: 'success.light',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="h5">{documentStatus.approved}</Typography>
                                    <Typography variant="body2">Approved</Typography>
                                </Paper>
                            </Grid>
                            <Grid item xs={6} sm={3}>
                                <Paper 
                                    elevation={0} 
                                    sx={{ 
                                        p: 1, 
                                        textAlign: 'center',
                                        bgcolor: 'error.light',
                                        borderRadius: 2
                                    }}
                                >
                                    <Typography variant="h5">{documentStatus.rejected}</Typography>
                                    <Typography variant="body2">Rejected</Typography>
                                </Paper>
                            </Grid>
                        </Grid>
                        
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Upload and manage your application documents here.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/documents"
                            variant="contained"
                            color="primary"
                        >
                            Manage Documents
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    );
};

export default ApplicantDashboard;

