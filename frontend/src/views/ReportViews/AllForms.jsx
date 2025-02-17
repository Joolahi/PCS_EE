import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Paper, CircularProgress, Button, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../../api/config';
import { useTranslation } from 'react-i18next';

const AllForms = () => {
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchAllForms = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/getAllForms`);
        setForms(response.data);
      } catch (error) {
        console.error("Error fetching all forms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllForms();
  }, []);

  return (
    <Container>
      <IconButton onClick={() => navigate('/lomakkeet')} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" color="primary" />
      </IconButton>
      <Typography variant="h4" gutterBottom>
        {t('forms.all submitted forms')}
      </Typography>
      {loading ? (
        <CircularProgress />
      ) : (
        <Grid container spacing={2}>
          {forms.map((form) => (
            <Grid item xs={12} key={form._id}>
              <Paper elevation={3} sx={{ padding: 2 }}>
                <Typography variant="h6">
                  {t(form.formType)} - {form.date || "No title"}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Submitted on: {form.created_at || "N/A"}
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/formDetails/${form.formType}/${form._id}`)}
                  sx={{ marginTop: 1 }}
                >
                  View Details
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AllForms;
