import React, { useState } from 'react';
import { Box, Container, Typography, IconButton, Grid, TextField, FormControlLabel, Radio, RadioGroup, Button, Autocomplete, Snackbar, Alert, CircularProgress } from '@mui/material';
import DatePicker, { registerLocale } from 'react-datepicker';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../../api/config';
import fi from 'date-fns/locale/fi';

registerLocale('fi', fi);

const Poikkeama = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    formType: 'Poikkeama',
    PoNumero: '',
    WoNumero: '',
    tuotekoodi: '',
    havaittuPoikkeama: '',
    lisatiedot: '',
    date: null,
    nimi: '',
    selectedOption: null,
    decision: ''
  });
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
  const [missingFields, setMissingFields] = useState([]);
  const [showNotification, setShowNotification] = useState(false);

  const handleInputChange = (field, value) => {
    if (field === 'date') {
      setFormData({ ...formData, [field]: value }); // Keep as a Date object
    } else {
      setFormData({ ...formData, [field]: value });
    }
  };
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    console.log('Submit triggered');
  
    const requiredFields = [
      { field: 'PoNumero', label: t("poikkeamat.PO") },
      { field: 'WoNumero', label: t("poikkeamat.WO") },
      { field: 'tuotekoodi', label: t("poikkeamat.code") },
      { field: 'havaittuPoikkeama', label: t("poikkeamat.info") },
      { field: 'lisatiedot', label: t("poikkeamat.description") },
      { field: 'date', label: t("poikkeamat.date") },
      { field: 'nimi', label: t("poikkeamat.nimi") },
    ];
  
    const missing = requiredFields
      .filter(({ field }) => !formData[field])
      .map(({ field }) => field);
  
    console.log('Missing fields:', missing); // Log missing fields
  
    setMissingFields(missing);
  
    if (missing.length > 0) {
      setShowNotification(true);
      setLoading(false);
      return;
    }
     // Format the date for submission
    const formattedFormData = {
      ...formData,
      date: formData.date ? formData.date.toLocaleDateString('fi-FI', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }) : null,
    };

    try {
      const response = await axios.post(`${API_URL}/api/save-deviation`, formattedFormData);
      if (response.status === 200)
      {
        setSnackbarMessage('Form data submitted successfully');
        setSnackbarSeverity('success');
        console.log('Form data submitted:', formattedFormData);
      } else{
        setSnackbarMessage(response.data.error || "Failed to submit form data");
        setSnackbarSeverity('error');
      }
    } catch (error){
      const errorMessage = error.response?.data?.error || 'Failed to submit form data';
      setSnackbarMessage(errorMessage);
      setSnackbarSeverity('error');
    } finally {
      setLoading(false);
    }
    // console.log('Form data submitted:', formData);
  };
  

  const isFieldMissing = (field) => missingFields.includes(field);

  const options = [
    { label: t("poikkeamat.area1"), id: 1 },
    { label: t("poikkeamat.area2"), id: 2 },
    { label: t("poikkeamat.area3"), id: 12 },
    { label: t("poikkeamat.area4"), id: 3 },
    { label: t("poikkeamat.area5"), id: 4 },
    { label: t("poikkeamat.area6"), id: 5 },
    { label: t("poikkeamat.area7"), id: 6 },
    { label: t("poikkeamat.area8"), id: 7 },
    { label: t("poikkeamat.area9"), id: 8 },
    { label: t("poikkeamat.area10"), id: 9 },
    { label: t("poikkeamat.area11"), id: 10 },
    { label: t("poikkeamat.area12"), id: 11 },
  ];

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
        <Typography variant="h3" gutterBottom sx={{ color: "#071952" }}>
          {t("poikkeamat.notification")}
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("poikkeamat.PO")}
                value={formData.PoNumero}
                onChange={(e) => handleInputChange('PoNumero', e.target.value)}
                error={isFieldMissing('PoNumero')}
                helperText={isFieldMissing('PoNumero') ? t("forms.missingField") : ""}
                autoComplete='off'
                InputLabelProps={{ style: { color: '#071952' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("poikkeamat.WO")}
                value={formData.WoNumero}
                onChange={(e) => handleInputChange('WoNumero', e.target.value)}
                error={isFieldMissing('WoNumero')}
                helperText={isFieldMissing('WoNumero') ? t("forms.missingField") : ""}
                autoComplete='off'
                InputLabelProps={{ style: { color: '#071952' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("poikkeamat.code")}
                value={formData.parannusehdotus}
                onChange={(e) => handleInputChange('tuotekoodi', e.target.value)}
                error={isFieldMissing('tuotekoodi')}
                helperText={isFieldMissing('tuotekoodi') ? t("forms.missingField") : ""}
                autoComplete='off'
                InputLabelProps={{ style: { color: '#071952' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t("poikkeamat.havaittu")}
                value={formData.havaittuPoikkeama}
                onChange={(e) => handleInputChange('havaittuPoikkeama', e.target.value)}
                errror={isFieldMissing('havaittuPoikkeama')}
                helperText={isFieldMissing('havaittuPoikkeamat') ? t("forms.missingField") : ""}
                autoComplete='off'
                InputLabelProps={{ style: { color: '#071952' } }}
              />
            </Grid>

            {/* Decision Radio Buttons */}
            <Grid item xs={6}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
                {t("poikkeamat.info")}
              </Typography>
              <RadioGroup
                row
                value={formData.decision}
                onChange={(e) => handleInputChange('decision', e.target.value)}
                sx={{ border: isFieldMissing('decision') ? '1px solid red' : '0px solid #071952', borderRadius: '4px', padding: '4px', marginLeft: '40px' }}
              >
                <FormControlLabel
                  value="Kyllä"
                  control={<Radio />}
                  label={<Typography sx={{ color: '#071952' }}>{t("poikkeamat.yes")}</Typography>}
                />
                <FormControlLabel
                  value="Ei"
                  control={<Radio />}
                  label={<Typography sx={{ color: '#071952' }}>{t("poikkeamat.no")}</Typography>}
                />
              </RadioGroup>
              {isFieldMissing('decision') && <Typography color="error">{t("forms.missingField")}</Typography>}
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
                {t("poikkeamat.area")}
              </Typography>
              <Autocomplete
                options={options}
                value={formData.selectedOption || null} // Use null when there's no selection
                onChange={(event, newValue) => handleInputChange('selectedOption', newValue)}
                isOptionEqualToValue={(option, value) => option.id === value?.id} // Check value for null
                renderInput={(params) => <TextField {...params} label={t("poikkeamat.alue")} />}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label={t("poikkeamat.description")}
                value={formData.lisatiedot}
                onChange={(e) => handleInputChange('lisatiedot', e.target.value)}
                error={isFieldMissing('lisatiedot')}
                helperText={isFieldMissing('lisatiedot') ? t("forms.missingField") : ""}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
                {t("poikkeamat.date")}
              </Typography>
              <DatePicker
                selected={formData.date}
                onChange={(date) => handleInputChange('date', date)}
                dateFormat="dd/MM/yyyy"
                locale="fi"
                customInput={
                  <TextField
                    fullWidth
                    error={isFieldMissing('date')}
                    helperText={isFieldMissing('date') ? t("forms.missingField") : ""}
                  />
                }
                autoComplete='off'
                portalId="root-portal"
              />
            </Grid>

            <Grid item xs={6}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
                {t("poikkeamat.nimi")}
              </Typography>
              <TextField
                fullWidth
                label="Nimi"
                value={formData.nimi}
                onChange={(e) => handleInputChange('nimi', e.target.value)}
                error={isFieldMissing('nimi')}
                helperText={isFieldMissing('nimi') ? t("forms.missingField") : ""}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
                {loading ? <CircularProgress size={24} /> : t("forms.submit")}
              </Button>
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

export default Poikkeama;
