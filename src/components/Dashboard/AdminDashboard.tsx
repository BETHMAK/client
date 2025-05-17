import React from 'react';
import { Typography, Paper, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { GridContainer, GridItem } from '../Common/Grid';

const AdminDashboard = () => {
    // No need to access user state here as it's not used in this component

    return (
        <div>
            <Typography variant="h4" gutterBottom>
                Admin Dashboard
            </Typography>

            <GridContainer spacing={3}>
                {/* Program Management Section */}
                <GridItem xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Program Management
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Manage university programs and their details.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/admin/programs"
                            variant="contained"
                            color="primary"
                        >
                            Manage Programs
                        </Button>
                    </Paper>
                </GridItem>

                {/* Applications Review Section */}
                <GridItem xs={12} md={6}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Applications Review
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Review and process student applications.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/admin/applications"
                            variant="contained"
                            color="primary"
                        >
                            Review Applications
                        </Button>
                    </Paper>
                </GridItem>

                {/* Document Verification Section */}
                <GridItem xs={12}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Document Verification
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Verify and manage submitted documents.
                        </Typography>
                        <Button
                            component={RouterLink}
                            to="/admin/documents"
                            variant="contained"
                            color="primary"
                        >
                            Verify Documents
                        </Button>
                    </Paper>
                </GridItem>
            </GridContainer>
        </div>
    );
};

export default AdminDashboard;

