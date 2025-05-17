import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
    Schedule as ScheduleIcon,
    Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/store';
import { fetchApplications } from '../../features/applications/applicationSlice';
import { format } from 'date-fns';

const AdminApplicationsList = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const { applications, isLoading, error } = useAppSelector(state => state.applications);
    
    useEffect(() => {
        dispatch(fetchApplications());
    }, [dispatch]);

    const getStatusChip = (status: string) => {
        switch (status) {
            case 'pending':
                return <Chip icon={<ScheduleIcon />} label="Pending" color="warning" />;
            case 'under-review':
                return <Chip icon={<AssignmentIcon />} label="Under Review" color="info" />;
            case 'accepted':
                return <Chip icon={<CheckCircleIcon />} label="Accepted" color="success" />;
            case 'rejected':
                return <Chip icon={<CancelIcon />} label="Rejected" color="error" />;
            default:
                return <Chip label={status} />;
        }
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Review Applications
            </Typography>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Application ID</TableCell>
                            <TableCell>Program</TableCell>
                            <TableCell>Applicant</TableCell>
                            <TableCell>Submission Date</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((application) => (
                            <TableRow key={application.id}>
                                <TableCell>{application.id}</TableCell>
                                <TableCell>{application.program.name}</TableCell>
                                <TableCell>
                                    {application.applicant.firstName} {application.applicant.lastName}
                                </TableCell>
                                <TableCell>
                                    {format(new Date(application.submissionDate), 'PPP')}
                                </TableCell>
                                <TableCell>
                                    {getStatusChip(application.status)}
                                </TableCell>
                                <TableCell>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={() => navigate(`/applications/${application.id}/review`)}
                                    >
                                        Review
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {applications.length === 0 && (
                <Typography color="textSecondary" align="center" sx={{ mt: 2 }}>
                    No applications found.
                </Typography>
            )}
        </Box>
    );
};

export default AdminApplicationsList;
