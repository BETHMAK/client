import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
    Grid,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    CircularProgress,
    Alert,
    Snackbar,
    Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { 
    fetchPrograms, 
    createProgram, 
    updateProgram, 
    deleteProgram 
} from '../../features/programs/programSlice';
import { RootState, useAppDispatch } from '../../app/store';
import { Program } from '../../types';

const AdminProgramList = () => {
    const dispatch = useAppDispatch();
    const { programs, isLoading, error } = useSelector((state: RootState) => state.programs);
    const [openDialog, setOpenDialog] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [programToDelete, setProgramToDelete] = useState<Program | null>(null);
    const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [notification, setNotification] = useState({
        open: false,
        message: '',
        type: 'success' as 'success' | 'error' | 'warning',
    });
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: '',
        deadline: '',
        requirements: '',
    });

    useEffect(() => {
        dispatch(fetchPrograms());
    }, [dispatch]);

    const handleOpenDialog = (program?: Program) => {
        if (program) {
            setSelectedProgram(program);
            setFormData({
                name: program.name,
                description: program.description,
                duration: program.duration,
                deadline: new Date(program.deadline).toISOString().split('T')[0],
                requirements: program.requirements.join('\n'),
            });
        } else {
            setSelectedProgram(null);
            setFormData({
                name: '',
                description: '',
                duration: '',
                deadline: '',
                requirements: '',
            });
        }
        setOpenDialog(true);
    };

    const handleSubmit = async () => {
        const programData = {
            ...formData,
            requirements: formData.requirements.split('\n').filter(req => req.trim()),
            isActive: true, // Set isActive to true by default for new programs
        };

        try {
            if (selectedProgram) {
                await dispatch(updateProgram({
                    id: selectedProgram.id,
                    programData,
                })).unwrap();
                
                setNotification({
                    open: true,
                    message: `Program "${formData.name}" has been updated successfully`,
                    type: 'success'
                });
            } else {
                await dispatch(createProgram(programData)).unwrap();
                
                setNotification({
                    open: true,
                    message: `Program "${formData.name}" has been created successfully`,
                    type: 'success'
                });
            }
            setOpenDialog(false);
        } catch (err: any) {
            setNotification({
                open: true,
                message: `Failed to ${selectedProgram ? 'update' : 'create'} program: ${err.message}`,
                type: 'error'
            });
        }
    };

    const handleDeleteClick = (program: Program) => {
        setProgramToDelete(program);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!programToDelete) return;

        try {
            setDeletingId(programToDelete.id);
            await dispatch(deleteProgram(programToDelete.id)).unwrap();
            setNotification({
                open: true,
                message: `Program "${programToDelete.name}" has been deleted successfully`,
                type: 'success'
            });
        } catch (err: any) {
            setNotification({
                open: true,
                message: `Failed to delete program: ${err.message}`,
                type: 'error'
            });
        } finally {
            setDeletingId(null);
            setDeleteDialogOpen(false);
            setProgramToDelete(null);
        }
    };

    const handleCloseNotification = () => {
        setNotification({ ...notification, open: false });
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" my={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <div>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4">Manage Programs</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenDialog()}
                >
                    Add New Program
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            <Grid container spacing={3}>
                {programs.map((program) => (
                    <Grid item xs={12} md={6} key={program.id}>
                        <Card>
                            <CardContent>
                                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                    <Typography variant="h6" gutterBottom>
                                        {program.name}
                                    </Typography>
                                    <Box>
                                        <IconButton 
                                            onClick={() => handleOpenDialog(program)}
                                            color="primary"
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton 
                                            onClick={() => handleDeleteClick(program)}
                                            color="error"
                                            disabled={deletingId === program.id}
                                        >
                                            {deletingId === program.id ? (
                                                <CircularProgress size={24} />
                                            ) : (
                                                <DeleteIcon />
                                            )}
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {program.description}
                                </Typography>
                                <Typography variant="body2">
                                    Duration: {program.duration}
                                </Typography>
                                <Typography variant="body2">
                                    Deadline: {new Date(program.deadline).toLocaleDateString()}
                                </Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Program Form Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>
                    {selectedProgram ? 'Edit Program' : 'Add New Program'}
                </DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Program Name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                        <TextField
                            fullWidth
                            label="Duration"
                            value={formData.duration}
                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Deadline"
                            type="date"
                            value={formData.deadline}
                            onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                            margin="normal"
                            required
                            InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                            fullWidth
                            label="Requirements (one per line)"
                            value={formData.requirements}
                            onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                            margin="normal"
                            multiline
                            rows={4}
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {selectedProgram ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => !deletingId && setDeleteDialogOpen(false)}>
                <DialogTitle>Confirm Delete</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete the program "{programToDelete?.name}"? 
                        This action cannot be undone and will affect all associated applications.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button 
                        onClick={() => setDeleteDialogOpen(false)}
                        disabled={!!deletingId}
                    >
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleDelete} 
                        color="error" 
                        variant="contained"
                        disabled={!!deletingId}
                    >
                        {deletingId ? <CircularProgress size={24} /> : 'Delete'}
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
        </div>
    );
};

export default AdminProgramList;
