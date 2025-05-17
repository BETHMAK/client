import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    CircularProgress,
    Alert,
    Box,
    Divider,
    Stack,
    LinearProgress,
    Snackbar,
    AlertColor
} from '@mui/material';
import { 
    CloudUpload as CloudUploadIcon,
    ArrowBack as ArrowBackIcon 
} from '@mui/icons-material';
import { RootState, useAppDispatch } from '../../app/store';
import { fetchPrograms } from '../../features/programs/programSlice';
import { submitApplication } from '../../features/applications/applicationSlice';
import { 
    uploadDocument, 
    uploadMultipleDocuments, 
    resetUploadProgress 
} from '../../features/documents/documentSlice';
import { Program } from '../../types';
import { useDropzone } from 'react-dropzone';
import { FileWithPath } from 'react-dropzone';

const ApplicationForm = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams] = useSearchParams();
    const programId = searchParams.get('program');

    const { programs, isLoading: programsLoading } = useSelector((state: RootState) => state.programs);
    const { isLoading: documentLoading, uploadProgress } = useSelector((state: RootState) => state.documents);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [statement, setStatement] = useState('');
    const [comments, setComments] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<FileWithPath[]>([]);
    const [createdApplicationId, setCreatedApplicationId] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ 
        open: boolean; 
        message: string; 
        type: AlertColor;
    }>({ 
        open: false, 
        message: '', 
        type: 'success'
    });
    const [fileError, setFileError] = useState<string | null>(null);

    useEffect(() => {
        // Check if programs are already loaded
        if (programs.length === 0) {
            console.log('Programs not loaded, fetching...');
            dispatch(fetchPrograms());
        } else {
            console.log('Programs already loaded:', programs.length);
        }
        
        // Clean up upload progress when component unmounts
        return () => {
            dispatch(resetUploadProgress());
        };
    }, [dispatch, programs.length]);

    // Separate useEffect for program selection
    useEffect(() => {
        if (programId && programs.length > 0) {
            console.log('Looking for program with ID:', programId);
            console.log('Available programs:', programs.map(p => ({ id: p.id, name: p.name })));
            
            const foundProgram = programs.find(p => {
                const matches = String(p.id) === String(programId);
                console.log(`Comparing program ${p.id} (${p.name}) with ${programId}: ${matches}`);
                return matches;
            });

            if (foundProgram) {
                console.log('Found program:', foundProgram);
                setSelectedProgram(foundProgram);
                setError(null);
            } else {
                console.log('Program not found');
                setError('Program not found. Please select a program from the programs list.');
            }
        }
    }, [programId, programs]);

    // File size limit: 5MB
    const MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop: (acceptedFiles: FileWithPath[]) => {
            setFileError(null);
            
            // Validate file size
            const validFiles = acceptedFiles.filter(file => file.size <= MAX_FILE_SIZE);
            
            if (validFiles.length < acceptedFiles.length) {
                setFileError(`${acceptedFiles.length - validFiles.length} file(s) exceeded the 5MB size limit and were not added.`);
            }
            
            if (validFiles.length > 0) {
                setSelectedFiles([...selectedFiles, ...validFiles]);
            }
        },
        accept: {
            'application/pdf': ['.pdf'],
            'image/jpeg': ['.jpg', '.jpeg'],
            'image/png': ['.png'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        },
        maxSize: MAX_FILE_SIZE,
    });

    const removeFile = (index: number) => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    // Format file size for display
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
    
    // Handle notification close
    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };
    
    // Go back to the programs list
    const handleBack = () => {
        // Clean up any form state if needed
        setSelectedFiles([]);
        dispatch(resetUploadProgress());
        navigate('/programs');
    };

    const uploadDocuments = async (applicationId: string): Promise<boolean> => {
        if (selectedFiles.length === 0) {
            return true;
        }

        try {
            if (selectedFiles.length === 1) {
                const result = await dispatch(uploadDocument({
                    file: selectedFiles[0],
                    applicationId
                })).unwrap();
                
                setNotification({
                    open: true,
                    message: 'Document uploaded successfully',
                    type: 'success'
                });
                
                return true;
            } else {
                const result = await dispatch(uploadMultipleDocuments({
                    files: selectedFiles,
                    applicationId
                })).unwrap();
                
                setNotification({
                    open: true,
                    message: `${selectedFiles.length} documents uploaded successfully`,
                    type: 'success'
                });
                
                return true;
            }
        } catch (err: any) {
            console.error('Error uploading documents:', err);
            setNotification({
                open: true,
                message: `Failed to upload documents: ${err.message || 'Unknown error'}`,
                type: 'error'
            });
            return false;
        }
    };

    const validateForm = (): boolean => {
        // Validate statement of purpose is not empty
        if (!statement.trim()) {
            setError('Statement of Purpose is required.');
            return false;
        }
        
        // Validate statement has a minimum length
        if (statement.trim().length < 50) {
            setError('Statement of Purpose should be at least 50 characters.');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProgram) return;
        
        // Validate form
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const response = await dispatch(submitApplication({ 
                programId: selectedProgram.id,
                statement,
                comments: comments || undefined
            })).unwrap();

            // If we have files to upload and application was created successfully
            if (selectedFiles.length > 0 && response.id) {
                setCreatedApplicationId(response.id);
                const uploadSuccess = await uploadDocuments(response.id);
                
                if (uploadSuccess) {
                    setNotification({
                        open: true,
                        message: 'Application submitted successfully with documents',
                        type: 'success'
                    });
                } else {
                    setNotification({
                        open: true,
                        message: 'Application submitted but some documents failed to upload',
                        type: 'info'
                    });
                }
            } else {
                setNotification({
                    open: true,
                    message: 'Application submitted successfully',
                    type: 'success'
                });
            }

            // Navigate after a short delay to allow the user to see the notification
            setTimeout(() => {
                navigate('/applications');
            }, 1500);
        } catch (err: any) {
            setError('Failed to submit application: ' + (err.message || 'Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (programsLoading) {
        return (
            <Grid container justifyContent="center">
                <CircularProgress />
            </Grid>
        );
    }

    if (!selectedProgram) {
        return (
            <Alert severity="error">
                Program not found. Please select a program from the programs list.
            </Alert>
        );
    }

    return (
        <Box>
            {/* Back button */}
            <Box sx={{ mb: 3 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={handleBack}
                    variant="outlined"
                >
                    Back to Programs
                </Button>
            </Box>
            
            <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
                <Box component="form" onSubmit={handleSubmit}>
                    <Typography variant="h5" gutterBottom>
                        Application for {selectedProgram.name}
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {fileError && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            {fileError}
                        </Alert>
                    )}
                    
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Program Details:
                            </Typography>
                            <Typography variant="body2">
                                Duration: {selectedProgram.duration}
                            </Typography>
                            <Typography variant="body2">
                                Deadline: {new Date(selectedProgram.deadline).toLocaleDateString()}
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Requirements:
                            </Typography>
                            <ul>
                                {selectedProgram.requirements.map((req, index) => (
                                    <li key={index}>
                                        <Typography variant="body2">{req}</Typography>
                                    </li>
                                ))}
                            </ul>
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Statement of Purpose:
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                placeholder="Please explain why you are interested in this program..."
                                required
                                value={statement}
                                onChange={(e) => setStatement(e.target.value)}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Typography variant="subtitle1" gutterBottom>
                                Additional Comments:
                            </Typography>
                            <TextField
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Any additional information you would like to provide..."
                                value={comments}
                                onChange={(e) => setComments(e.target.value)}
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="subtitle1" gutterBottom>
                                Supporting Documents:
                            </Typography>
                            <Paper
                                {...getRootProps()}
                                sx={{
                                    p: 2,
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    bgcolor: isDragActive ? 'action.hover' : 'background.paper',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    mb: 2
                                }}
                            >
                                <input {...getInputProps()} />
                                <CloudUploadIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                                <Typography variant="body1" gutterBottom>
                                    {isDragActive ? 'Drop files here' : 'Drag and drop files here, or click to select files'}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                    Supported formats: PDF, JPEG, PNG, DOC, DOCX
                                </Typography>
                            </Paper>
                            
                            {selectedFiles.length > 0 && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Selected files ({selectedFiles.length}):
                                    </Typography>
                                    <Stack spacing={1}>
                                        {selectedFiles.map((file, index) => (
                                            <Box 
                                                key={index} 
                                                sx={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'space-between',
                                                    p: 1,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    borderRadius: 1
                                                }}
                                            >
                                                <Typography variant="body2" noWrap sx={{ maxWidth: '70%' }}>
                                                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                                                </Typography>
                                                <Button 
                                                    size="small" 
                                                    onClick={() => removeFile(index)}
                                                    color="error"
                                                >
                                                    Remove
                                                </Button>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                            
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                You can upload more documents after submitting your application.
                            </Typography>
                        </Grid>

                        <Grid item xs={12}>
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                                fullWidth
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Submitting...' : 'Submit Application'}
                            </Button>
                        </Grid>
                    </Grid>

                    {isSubmitting && uploadProgress !== null && (
                        <Box sx={{ width: '100%', mt: 2 }}>
                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                Uploading documents: {uploadProgress}%
                            </Typography>
                            <LinearProgress variant="determinate" value={uploadProgress} />
                        </Box>
                    )}
                </Box>
            </Paper>

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

export default ApplicationForm;
