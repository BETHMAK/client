import React from 'react';
import { Container, Paper, Typography, Box, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import Documents from './Documents';

/**
 * DocumentsPage component wraps the Documents component with navigation
 * and provides a container layout
 */
const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();
  
  const handleBack = () => {
    if (applicationId) {
      navigate(`/applications/${applicationId}`);
    } else {
      navigate('/applications');
    }
  };

  return (
    <Container maxWidth="lg">
      <Paper sx={{ p: 3, mt: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ mr: 2 }}
          >
            Back to Application
          </Button>
          <Typography variant="h5">
            Document Management
          </Typography>
        </Box>
        <Documents />
      </Paper>
    </Container>
  );
};

export default DocumentsPage;
