import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
  Chip,
  List,
  ListItem,
  ListItemText,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  AlertColor,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/store';
import {
  fetchApplicationById,
  updateApplicationStatus,
  StatusUpdateData,
} from '../../features/applications/applicationSlice';
import { fetchDocuments } from '../../features/documents/documentSlice';
import format from 'date-fns/format/index';
import parseISO from 'date-fns/parseISO/index';

// Status Chip component
const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return (
        <Chip
          icon={<ScheduleIcon />}
          label="Pending"
          color="warning"
          variant="outlined"
        />
      );
    case 'under-review':
      return (
        <Chip
          icon={<AssignmentIcon />}
          label="Under Review"
          color="info"
          variant="outlined"
        />
      );
    case 'accepted':
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Accepted"
          color="success"
          variant="outlined"
        />
      );
    case 'rejected':
      return (
        <Chip
          icon={<CancelIcon />}
          label="Rejected"
          color="error"
          variant="outlined"
        />
      );
    default:
      return <Chip label={status} />;
  }
};

// Document Status Chip component
const DocumentStatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return (
        <Chip
          label="Pending Verification"
          color="warning"
          size="small"
          variant="outlined"
        />
      );
    case 'approved':
      return (
        <Chip label="Verified" color="success" size="small" variant="outlined" />
      );
    case 'rejected':
      return (
        <Chip
          label="Rejected"
          color="error"
          size="small"
          variant="outlined"
        />
      );
    default:
      return <Chip label={status} size="small" />;
  }
};

const ApplicationReview = () => {
  const { applicationId } = useParams<{ applicationId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // State
  const [reviewNotes, setReviewNotes] = useState('');
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    type: AlertColor;
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Redux state
  const { selectedApplication, isLoading, error } = useAppSelector(
    (state) => state.applications
  );
  const { documents, isLoading: documentsLoading } = useAppSelector(
    (state) => state.documents
  );

  // Fetch application and documents on component mount
  useEffect(() => {
    if (applicationId) {
      dispatch(fetchApplicationById(applicationId));
      dispatch(fetchDocuments(applicationId));
    }
  }, [dispatch, applicationId]);

  // Filter documents for this application
  const applicationDocuments = documents.filter(
    (doc) => doc.applicationId === applicationId
  );

  // Check document verification status
  const allDocumentsVerified = applicationDocuments.length > 0 && 
    applicationDocuments.every(doc => doc.status === 'approved');
  
  const hasRejectedDocuments = applicationDocuments.some(doc => doc.status === 'rejected');

  // Handle status update
  const handleStatusUpdate = (status: string) => {
    setSelectedStatus(status);
    setStatusDialogOpen(true);
  };

  // Confirm status update
  const confirmStatusUpdate = () => {
    if (!applicationId || !selectedStatus) return;

    const statusData: StatusUpdateData = {
      id: applicationId,
      status: selectedStatus,
      notes: reviewNotes.trim() || undefined,
    };

    dispatch(updateApplicationStatus(statusData))
      .unwrap()
      .then(() => {
        setNotification({
          open: true,
          message: `Application status updated to ${selectedStatus}`,
          type: 'success',
        });
        setReviewNotes('');
      })
      .catch((err) => {
        setNotification({
          open: true,
          message: `Failed to update status: ${err}`,
          type: 'error',
        });
      });

    setStatusDialogOpen(false);
    setSelectedStatus(null);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Go back
  const handleBack = () => {
    navigate('/admin/applications');
  };

  // Loading state
  if (isLoading || documentsLoading) {
    return (
      <Box display="flex" justifyContent="center" my={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert severity="error" sx={{ my: 2 }}>
        {error}
      </Alert>
    );
  }

  // Not found state
  if (!selectedApplication) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        Application not found. Please check the ID and try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mr: 2 }}
        >
          Back to Applications
        </Button>
        <Typography variant="h5">Application Review</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Application Details Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Application Details</Typography>
              <StatusChip status={selectedApplication.status} />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Program
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedApplication.program.name}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Duration: {selectedApplication.program.duration}
                </Typography>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>
                  Applicant
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {selectedApplication.applicant.firstName}{' '}
                  {selectedApplication.applicant.lastName}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Email: {selectedApplication.applicant.email}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Dates
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Submitted:{' '}
                      {format(
                        parseISO(selectedApplication.submissionDate),
                        'PPP'
                      )}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Last Updated:{' '}
                      {format(
                        parseISO(selectedApplication.lastUpdated),
                        'PPP'
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Documents Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents
            </Typography>

            {applicationDocuments.length === 0 ? (
              <Typography color="textSecondary">
                No documents have been uploaded for this application.
              </Typography>
            ) : (
              <>
                <Box mb={2}>
                  {allDocumentsVerified ? (
                    <Alert severity="success">
                      All documents have been verified
                    </Alert>
                  ) : hasRejectedDocuments ? (
                    <Alert severity="error">
                      Some documents have been rejected
                    </Alert>
                  ) : (
                    <Alert severity="info">
                      Documents are pending verification
                    </Alert>
                  )}
                </Box>
                <List>
                  {applicationDocuments.map((document) => (
                    <ListItem
                      key={document.id}
                      divider
                      secondaryAction={
                        <Button
                          size="small"
                          color="primary"
                          variant="contained"
                          onClick={() => navigate(`/documents/${document.id}/verify`)}
                        >
                          Verify Document
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={document.name}
                        secondary={
                          <Box mt={0.5}>
                            <DocumentStatusChip status={document.status} />
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Paper>
        </Grid>

        {/* Application Notes Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Application Notes
            </Typography>

            {selectedApplication.notes.length === 0 ? (
              <Typography color="textSecondary" paragraph>
                No notes have been added to this application.
              </Typography>
            ) : (
              <List>
                {selectedApplication.notes.map((note, index) => (
                  <Accordion key={index} sx={{ mb: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography>
                        Note by {note.author.firstName} {note.author.lastName} on{' '}
                        {format(parseISO(note.date), 'PPP')}
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph>
                        {note.content}
                      </Typography>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </List>
            )}

            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom>
                Add Review Notes
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                placeholder="Enter your review notes here..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                variant="outlined"
              />
            </Box>
          </Paper>
        </Grid>

        {/* Action Buttons */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Actions
            </Typography>
            <Box display="flex" justifyContent="space-between">
              <Button
                variant="contained"
                color="primary"
                disabled={selectedApplication.status === 'under-review'}
                onClick={() => handleStatusUpdate('under-review')}
              >
                Mark as Under Review
              </Button>
              <Box>
                <Button
                  variant="contained"
                  color="success"
                  sx={{ mr: 2 }}
                  disabled={selectedApplication.status === 'accepted'}
                  onClick={() => handleStatusUpdate('accepted')}
                >
                  Accept Application
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  disabled={selectedApplication.status === 'rejected'}
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  Reject Application
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={statusDialogOpen} onClose={() => setStatusDialogOpen(false)}>
        <DialogTitle>Confirm Status Change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to change the application status to "
            {selectedStatus}"?
            {(!reviewNotes || reviewNotes.trim() === '') && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                No review notes have been added. It's recommended to provide notes for status changes.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStatusDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmStatusUpdate} color="primary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicationReview;

