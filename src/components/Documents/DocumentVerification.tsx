import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Chip,
  AlertColor,
} from '@mui/material';
import {
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/store';
import {
  fetchDocumentById,
  updateDocumentStatus,
  DocumentStatusUpdateData,
} from '../../features/documents/documentSlice';
import format from 'date-fns/format/index';
import parseISO from 'date-fns/parseISO/index';

// Document preview component based on file type
const DocumentPreview = ({ document }: { document: any }) => {
  const fileType = document.type.toLowerCase();
  const isPdf = fileType.includes('pdf');
  const isImage = fileType.includes('image') || 
                  fileType.includes('jpg') || 
                  fileType.includes('jpeg') || 
                  fileType.includes('png');

  return (
    <Card sx={{ mb: 3, maxWidth: '100%' }}>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: 4 }}>
        {isPdf ? (
          <PdfIcon sx={{ fontSize: 120, color: 'error.main', mb: 2 }} />
        ) : isImage ? (
          <ImageIcon sx={{ fontSize: 120, color: 'primary.main', mb: 2 }} />
        ) : (
          <FileIcon sx={{ fontSize: 120, color: 'info.main', mb: 2 }} />
        )}
        <Typography variant="h6" component="div">
          {document.name}
        </Typography>
        <Typography color="text.secondary">{document.type}</Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Size: {(document.size / 1024).toFixed(1)} KB
        </Typography>
        <Typography variant="body2">
          Uploaded: {format(parseISO(document.uploadDate), 'PPP')}
        </Typography>
        
        <Box mt={3} width="100%">
          {isPdf || isImage ? (
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              component="a"
              href={`${process.env.REACT_APP_API_URL}/documents/view/${document.id}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Document
            </Button>
          ) : (
            <Button 
              variant="contained" 
              color="primary" 
              fullWidth
              component="a"
              href={`${process.env.REACT_APP_API_URL}/documents/download/${document.id}`}
              download
            >
              Download Document
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

// Status chip component
const StatusChip = ({ status }: { status: string }) => {
  switch (status) {
    case 'pending':
      return <Chip label="Pending" color="warning" />;
    case 'verified':
      return <Chip label="verified" color="success" icon={<CheckCircleIcon />} />;
    case 'rejected':
      return <Chip label="Rejected" color="error" icon={<CancelIcon />} />;
    default:
      return <Chip label={status} />;
  }
};

// Main document verification component
const DocumentVerification = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Local state
  const [verificationStatus, setVerificationStatus] = useState<'verified' | 'rejected' | ''>('');
  const [verificationComment, setVerificationComment] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
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
  const { selectedDocument, isLoading, error } = useAppSelector(
    (state) => state.documents
  );

  // Fetch document on component mount
  useEffect(() => {
    if (documentId) {
      // Use the API_URL constant for consistency
      dispatch(fetchDocumentById(documentId));
    }
  }, [dispatch, documentId]);

  // Handle status change
  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationStatus(event.target.value as 'verified' | 'rejected');
  };

  // Handle comment change
  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVerificationComment(event.target.value);
  };

  // Open confirmation dialog
  const handleVerify = () => {
    if (!verificationStatus) {
      setNotification({
        open: true,
        message: 'Please select a verification status',
        type: 'warning',
      });
      return;
    }
    setConfirmDialogOpen(true);
  };

  // Confirm document verification
  const confirmVerification = () => {
    if (!documentId || !verificationStatus) return;

    const statusData: DocumentStatusUpdateData = {
      id: documentId,
      status: verificationStatus,
      comment: verificationComment.trim() || undefined,
    };

    dispatch(updateDocumentStatus(statusData))
      .unwrap()
      .then(() => {
        setNotification({
          open: true,
          message: `Document ${verificationStatus === 'verified' ? 'verified' : 'rejected'} successfully`,
          type: 'success',
        });
        // Reset form
        setVerificationComment('');
      })
      .catch((err) => {
        setNotification({
          open: true,
          message: `Verification failed: ${err}`,
          type: 'error',
        });
      });

    setConfirmDialogOpen(false);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Go back
  const handleBack = () => {
    if (selectedDocument?.applicationId) {
      navigate(`/applications/${selectedDocument.applicationId}/review`);
    } else {
      navigate('/applications');
    }
  };

  // Loading state
  if (isLoading) {
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
  if (!selectedDocument) {
    return (
      <Alert severity="warning" sx={{ my: 2 }}>
        Document not found. Please check the ID and try again.
      </Alert>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      {/* Header with back button */}
      <Box display="flex" alignItems="center" mb={3}>
        <Button startIcon={<ArrowBackIcon />} onClick={handleBack} sx={{ mr: 2 }}>
          Back to Application
        </Button>
        <Typography variant="h5">Document Verification</Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Document Info Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h6">Document Information</Typography>
              <StatusChip status={selectedDocument.status} />
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            {/* Document Preview */}
            <DocumentPreview document={selectedDocument} />
            
            {/* Document Metadata */}
            <Typography variant="subtitle1" gutterBottom>
              Application Details
            </Typography>
            <Typography variant="body2" gutterBottom>
              Application ID: {selectedDocument.applicationId}
            </Typography>
          </Paper>
        </Grid>

        {/* Verification Section */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification
            </Typography>
            <Divider sx={{ mb: 3 }} />

            {/* Current Status */}
            <Typography variant="subtitle1" gutterBottom>
              Current Status: <StatusChip status={selectedDocument.status} />
            </Typography>

            {/* Disable verification if already verified */}
            {selectedDocument.status !== 'pending' ? (
              <Alert severity="info" sx={{ my: 2 }}>
                This document has already been {selectedDocument.status}. 
                You can still update the status below if needed.
              </Alert>
            ) : null}

            {/* Verification Form */}
            <Box mt={3}>
              <FormControl component="fieldset">
                <FormLabel component="legend">Verification Status</FormLabel>
                <RadioGroup
                  aria-label="verification-status"
                  name="verification-status"
                  value={verificationStatus}
                  onChange={handleStatusChange}
                >
                  <FormControlLabel
                    value="verified"
                    control={<Radio color="success" />}
                    label="verified Document"
                  />
                  <FormControlLabel
                    value="rejected"
                    control={<Radio color="error" />}
                    label="Reject Document"
                  />
                </RadioGroup>
              </FormControl>

              <TextField
                fullWidth
                label="Verification Comments"
                multiline
                rows={4}
                value={verificationComment}
                onChange={handleCommentChange}
                placeholder="Add comments about the document verification..."
                margin="normal"
                variant="outlined"
              />

              <Button
                variant="contained"
                color={verificationStatus === 'verified' ? 'success' : verificationStatus === 'rejected' ? 'error' : 'primary'}
                disabled={!verificationStatus}
                onClick={handleVerify}
                sx={{ mt: 2 }}
                fullWidth
              >
                {verificationStatus === 'verified'
                  ? 'Verify Document'
                  : verificationStatus === 'rejected'
                  ? 'Reject Document'
                  : 'Verify Document'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Verification History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Verification History
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {/* Placeholder for verification history - would be implemented fully with backend support */}
            <Typography color="textSecondary">
              Verification history will be displayed here when available.
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Document Verification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to mark this document as "
            {verificationStatus}"?
            {(!verificationComment || verificationComment.trim() === '') && (
              <Box component="span" sx={{ display: 'block', mt: 1, color: 'warning.main' }}>
                Adding verification comments is recommended.
              </Box>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmVerification} color="primary" autoFocus>
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
        <Alert onClose={handleCloseNotification} severity={notification.type}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DocumentVerification;

