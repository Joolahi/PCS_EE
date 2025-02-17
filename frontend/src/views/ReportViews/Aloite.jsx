import React, { useState } from 'react';
import { Container, TextField, Checkbox, FormControlLabel, Grid, Typography, Button, IconButton, Box, Snackbar, CircularProgress, Alert } from '@mui/material';
import DatePicker, {registerLocale} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {useTranslation} from 'react-i18next';
import axios from 'axios';
import API_URL from '../../api/config.js';  
import fi from 'date-fns/locale/fi';

registerLocale('fi', fi);

const Aloite = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
  const [formData, setFormData] = useState({
    formType: 'Aloite',
    laatimispvm: null,
    laatijat: ['', '', ''],
    otsikko: '',
    nykytilanne: '',
    parannusehdotus: '',
    liitteet: '',
    hyvaksytty: false,
    kasiteltyPvm: null,
    paatos: '',
    palkkioMaksettu: null,
    toimenpiteet: '',
    kaikkiToimenpiteetTehty: null,
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleLaatijatChange = (index, value) => {
    const updatedLaatijat = [...formData.laatijat];
    updatedLaatijat[index] = value;
    setFormData({ ...formData, laatijat: updatedLaatijat });
  };

  const formattedFormData = {
    ...formData,
    laatimispvm : formData.laatimispvm ? formData.laatimispvm.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }): null,
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/save-initative`, formattedFormData);
      if (response.status === 200) {
        setSnackbarMessage('Form data submitted successfully');
        setSnackbarSeverity('success');
      } else {
        setSnackbarMessage(response.data.error || 'Failed to submit form data');
        setSnackbarSeverity('error');
      }
      
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Failed to submit form data';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
    //console.log('Form data submitted:', formData);
  };

  return (
    <Box sx={{ padding: 2, maxWidth: '800px', margin: 'auto' }}>
      <IconButton onClick={() => navigate('/lomakkeet')} sx={{ mb: 2 }}>
        <ArrowBackIcon fontSize="large" color="primary" />
      </IconButton>

      <Container
        sx={{
          padding: 4,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          height: '80vh',
          overflowY: 'auto',
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ color: "#071952" }}>
          {t('forms.aloitelomake')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Date of Initiation */}
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
                {t('forms.pvm')}
              </Typography>
              <DatePicker
                selected={formData.laatimispvm}
                onChange={(date) => handleInputChange('laatimispvm', date)}
                dateFormat="dd/MM/yyyy"
                locale="fi"
                customInput={
                  <TextField 
                    fullWidth
                  />
                }
                autoComplete='off'
                portalId="root-portal" // Ensure it doesn't get hidden by other elements
              />
            </Grid>

            {/* Authors */}
            {formData.laatijat.map((_, index) => (
              <Grid item xs={12} key={index}>
                <TextField
                  fullWidth
                  label={`${t("forms.aloitteen_laatijat")} ${index + 1}`}
                  value={formData.laatijat[index]}
                  onChange={(e) => handleLaatijatChange(index, e.target.value)}
                  InputLabelProps={{ style: { color: '#071952' } }} 
                  autoComplete='off'
                />
              </Grid>
            ))}

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('forms.otsikko')}
                value={formData.otsikko}
                onChange={(e) => handleInputChange('otsikko', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            {/* Current Situation */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t('forms.nykytilanne')}
                value={formData.nykytilanne}
                onChange={(e) => handleInputChange('nykytilanne', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            {/* Improvement Suggestion */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t('forms.parannusehdotus')}
                value={formData.parannusehdotus}
                onChange={(e) => handleInputChange('parannusehdotus', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
          </Grid>
        </form>
      </Container>
      <Snackbar
                open={!!snackbarMessage} // Open snackbar if message exists
                autoHideDuration={6000}
                onClose={() => setSnackbarMessage(null)}
            >
                <Alert
                    onClose={() => setSnackbarMessage(null)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
    </Box>
  );
};

export default Aloite;
