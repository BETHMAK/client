import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  Box,
  Typography,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Grid,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Snackbar,
  Tooltip,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  PendingActions as PendingIcon,
} from '@mui/icons-material';
import { useAppDispatch, useAppSelector } from '../../app/store';
import {
  fetchDocuments,
  uploadDocument,
  uploadMultipleDocuments,
  deleteDocument,
  resetUploadProgress,
  Document,
} from '../../features/documents/documentSlice';

// Utility function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Component for the dropzone area
const DropzoneArea: React.FC<{
  onDrop: (acceptedFiles: File[]) => void;
  disabled: boolean;
}> = ({ onDrop, disabled }) => {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    },
  });

  return (
    <Paper
      {...getRootProps()}
      sx={{
        p: 3,
        textAlign: 'center',
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: (theme) =>
          isDragActive
            ? theme.palette.primary.light
            : disabled
            ? theme.palette.action.disabledBackground
            : theme.palette.background.paper,
        border: '2px dashed',
        borderColor: (theme) =>
          isDragActive
            ? theme.palette.primary.main
            : disabled
            ? theme.palette.action.disabled
            : theme.palette.divider,
        '&:hover': {
          borderColor: (theme) =>
            disabled ? theme.palette.action.disabled : theme.palette.primary.main,
          bgcolor: (theme) =>
            disabled ? theme.palette.action.disabledBackground : theme.palette.background.default,
        },
      }}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon
        sx={{
          fontSize: 48,
          mb: 1,
          color: (theme) =>
            disabled ? theme.palette.action.disabled : theme.palette.primary.main,
        }}
      />
      <Typography variant="h6" gutterBottom>
        {isDragActive ? 'Drop files here' : 'Drag and drop files here'}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        or click to browse files
      </Typography>
      <Typography variant="caption" color="textSecondary" display="block" mt={1}>
        Supported formats: PDF, JPG, PNG, DOC, DOCX
      </Typography>
    </Paper>
  );
};

// Status chip component
const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  let color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning'
    | undefined;
  let icon: React.ReactElement | null = null;

  switch (status) {
    case 'pending':
      color = 'warning';
      icon = <PendingIcon fontSize="small" />;
      break;
    case 'approved':
      color = 'success';
      icon = <CheckCircleIcon fontSize="small" />;
      break;
    case 'rejected':
      color = 'error';
      icon = <ErrorIcon fontSize="small" />;
      break;
    default:
      color = 'default';
  }

  return (
    <Chip
      size="small"
      label={status.charAt(0).toUpperCase() + status.slice(1)}
      color={color}
      icon={icon as React.ReactElement}
    />
  );
};

// Main Documents component
const Documents: React.FC = () => {
  const dispatch = useAppDispatch();
  const { applicationId } = useParams<{ applicationId: string }>();
  
  // Local state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [notification, setNotification] = useState({ 
    open: false, 
    message: '', 
    type: 'success' as 'success' | 'error' | 'warning' 
  });

  // Redux state
  const { documents, isLoading, error, uploadProgress } = useAppSelector(
    (state) => state.documents
  );
  
  // Fetch documents on component mount
  useEffect(() => {
    if (applicationId) {
      dispatch(fetchDocuments(applicationId));
    } else {
      dispatch(fetchDocuments('all'));
    }
  }, [dispatch, applicationId]);
  
  // Reset upload progress when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetUploadProgress());
    };
  }, [dispatch]);

  
  // Handle file drop
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!applicationId) {
        setNotification({
          open: true,
          message: 'Please select an application before uploading documents',
          type: 'error',
        });
        return;
      }

      if (acceptedFiles.length === 1) {
        // Single file upload
        dispatch(
          uploadDocument({
            file: acceptedFiles[0],
            applicationId,
          })
        )
          .unwrap()
          .then(() => {
            setNotification({
              open: true,
              message: 'Document uploaded successfully',
              type: 'success',
            });
          })
          .catch((err) => {
            setNotification({
              open: true,
              message: `Upload failed: ${err}`,
              type: 'error',
            });
          });
      } else if (acceptedFiles.length > 1) {
        // Multiple files upload
        dispatch(
          uploadMultipleDocuments({
            files: acceptedFiles,
            applicationId,
          })
        )
          .unwrap()
          .then(() => {
            setNotification({
              open: true,
              message: `${acceptedFiles.length} documents uploaded successfully`,
              type: 'success',
            });
          })
          .catch((err) => {
            setNotification({
              open: true,
              message: `Upload failed: ${err}`,
              type: 'error',
            });
          });
      }
    },
    [dispatch, applicationId]
  );

  // Handle document deletion
  const handleDeleteDocument = (document: Document) => {
    setDocumentToDelete(document);
    setDeleteDialogOpen(true);
  };

  // Confirm deletion
  const confirmDelete = () => {
    if (documentToDelete) {
      dispatch(deleteDocument(documentToDelete.id))
        .unwrap()
        .then(() => {
          setNotification({
            open: true,
            message: 'Document deleted successfully',
            type: 'success',
          });
        })
        .catch((err) => {
          setNotification({
            open: true,
            message: `Failed to delete document: ${err}`,
            type: 'error',
          });
        });
    }
    setDeleteDialogOpen(false);
    setDocumentToDelete(null);
  };
  
  // Close the notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  // Filter documents based on applicationId parameter
  const filteredDocuments = applicationId 
    ? documents.filter(doc => doc.applicationId === applicationId)
    : documents;

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h5" gutterBottom>
        {applicationId ? 'Application Documents' : 'All Documents'}
      </Typography>
      
      {/* Error message if present */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Upload area */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <DropzoneArea onDrop={onDrop} disabled={isLoading} />
          
          {/* Upload progress */}
          {uploadProgress !== null && (
            <Box sx={{ width: '100%', mt: 2 }}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Uploading: {uploadProgress}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={uploadProgress}
                sx={{ height: 10, borderRadius: 5 }}
              />
            </Box>
          )}
        </Grid>
        
        {/* Document list */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Uploaded Documents
            </Typography>
            
            {/* Loading indicator */}
            {isLoading && !uploadProgress && (
              <Box display="flex" justifyContent="center" my={3}>
                <CircularProgress />
              </Box>
            )}
            
            {/* Empty state */}
            {!isLoading && filteredDocuments.length === 0 && (
              <Typography color="textSecondary" align="center" py={3}>
                No documents uploaded yet.
              </Typography>
            )}
            
            {/* Document list */}
            {filteredDocuments.length > 0 && (
              <List>
                {filteredDocuments.map((document, index) => (
                  <React.Fragment key={document.id}>
                    {index > 0 && <Divider component="li" />}
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center">
                            <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography variant="subtitle1">{document.name}</Typography>
                          </Box>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textPrimary"
                              display="block"
                            >
                              {document.type}
                            </Typography>
                            <Typography
                              component="span"
                              variant="body2"
                              color="textSecondary"
                            >
                              Size: {formatFileSize(document.size)} • Uploaded:{' '}
                              {new Date(document.uploadDate).toLocaleDateString()}
                            </Typography>
                            <Box mt={1}>
                              <StatusChip status={document.status} />
                            </Box>
                          </React.Fragment>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Tooltip title="Delete document">
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDeleteDocument(document)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </ListItemSecondaryAction>
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the document "{documentToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Notification/Toast */}
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

export default Documents;
