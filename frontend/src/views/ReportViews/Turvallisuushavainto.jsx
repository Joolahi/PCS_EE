import React, { useState } from 'react';
import { Container, TextField, Checkbox, FormControlLabel, Grid, Typography, Button, IconButton, Box, Snackbar, CircularProgress, Alert} from '@mui/material';
import DatePicker,{registerLocale} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import API_URL from '../../api/config';
import fi from 'date-fns/locale/fi';
import axios from 'axios';
import { set } from 'date-fns';

registerLocale('fi', fi);

const SafetyObservationForm = () => {
  const {t} = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Loading state for spinner
  const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
  const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
  const [formData, setFormData] = useState({
    formType: 'Turvallisuushavainto',
    date: null,
    safetyIssue: false,
    nearMiss: false,
    causes: {
      cleanliness: false,
      accessRoutes: false,
      equipment: false,
      protectiveEquipment: false,
      noise: false,
      chemicals: false,
      workInstructions: false,
      riskTaking: false,
      otherCause: '',
    },
    improvementSuggestions: {
      workMethods: false,
      maintenance: false,
      planning: false,
      management: false,
      communication: false,
      training: false,
      responsibilities: false,
      otherSuggestion: '',
    },
    urgency: '',
    whatHappened: '',
    where: '',
    howAndWhy: '',
    whoInvolved: '',
    consequences: '',
    isResolved: false,
    actionProposal: '',
    yourName: '',
    employerName: '',
  });

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleCheckboxChange = (category, field) => (event) => {
    setFormData({ ...formData, [category]: { ...formData[category], [field]: event.target.checked } });
  };
  
  const formattedFormData = {
    ...formData,
    date: formData.date ? formData.date.toLocaleDateString('fi-FI', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }) : null,
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/save-safetyObservation`, formattedFormData);
      if(response.status === 200) {
      setSnackbarMessage('Form data submitted successfully');
      setSnackbarSeverity('success');
      } else{
        snackbarMessage(response.data.error || 'Failed to submit form data');
        setSnackbarSeverity('error');
    }
  } catch (error) {
    const errorMessage = error.reponse?.data?.error || error.message || 'Failed to submit form data';
    setSnackbarMessage(errorMessage);
    setSnackbarSeverity('error');
  } finally {
    setLoading(false);
  }
}

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
          {t('safety.havainto')}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* Date and Time */}
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ color: '#071952', fontWeight: 'bold', mb: 1 }}>
              {t('safety.date')}
              </Typography>
              <DatePicker
                selected={formData.date}
                onChange={(date) => handleInputChange('date', date)}
                dateFormat="dd/MM/yyyy"
                customInput={<TextField fullWidth />}
                autoComplete='off'
              />
            </Grid>

            {/* Safety Issue or Near Miss */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.safetyIssue}
                    onChange={(e) => handleInputChange('safetyIssue', e.target.checked)}
                  />
                }
                label={<Typography sx={{ color: '#071952' }}>{t("safety.puute")}</Typography>}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.nearMiss}
                    onChange={(e) => handleInputChange('nearMiss', e.target.checked)}
                  />
                }
                label={<Typography sx={{ color: '#071952' }}>{t("safety.close")}</Typography>}
              />
            </Grid>

            {/* Causes */}
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ color: '#071952', mb: 1 }}>
                {t("safety.aiheuttaja")}
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={formData.causes.cleanliness} onChange={handleCheckboxChange('causes', 'cleanliness')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja1")}</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.causes.accessRoutes} onChange={handleCheckboxChange('causes', 'accessRoutes')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja2")}</Typography>}
              />
               <FormControlLabel
                control={<Checkbox checked={formData.causes.equipment} onChange={handleCheckboxChange('causes', 'equipment')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja3")}</Typography>}
              />
               <FormControlLabel
                control={<Checkbox checked={formData.causes.protectiveEquipment} onChange={handleCheckboxChange('causes', 'protectiveEquipment')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja4")}</Typography>}
              />
               <FormControlLabel
                control={<Checkbox checked={formData.causes.noise} onChange={handleCheckboxChange('causes', 'noise')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja5")}</Typography>}
              />
               <FormControlLabel
                control={<Checkbox checked={formData.causes.chemicals} onChange={handleCheckboxChange('causes', 'chemicals')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja6")}</Typography>}
              />
               <FormControlLabel
                control={<Checkbox checked={formData.causes.workInstructions} onChange={handleCheckboxChange('causes', 'workInstructions')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja7")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.causes.riskTaking} onChange={handleCheckboxChange('causes', 'riskTaking')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.aiheuttaja8")}</Typography>}
              />
              <TextField
                fullWidth
                label={t("safety.aiheuttaja9")}
                value={formData.causes.otherCause}
                onChange={(e) => handleInputChange('causes', { ...formData.causes, otherCause: e.target.value })}
                InputLabelProps={{ style: { color: '#071952' } }}
                sx={{ mt: 2 }}
                autoComplete='off'
              />
            </Grid>

            {/* Improvement Suggestions */}
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ color: '#071952', mb: 1 }}>
                {t("safety.improvement")}
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.workMethods} onChange={handleCheckboxChange('improvementSuggestions', 'workMethods')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement1")}</Typography>}
              />
              <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.maintenance} onChange={handleCheckboxChange('improvementSuggestions', 'maintenance')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement2")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.planning} onChange={handleCheckboxChange('improvementSuggestions', 'planning')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement3")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.management} onChange={handleCheckboxChange('improvementSuggestions', 'management')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement4")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.communication} onChange={handleCheckboxChange('improvementSuggestions', 'communication')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement5")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.training} onChange={handleCheckboxChange('improvementSuggestions', 'training')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement6")}</Typography>}
              />
                <FormControlLabel
                control={<Checkbox checked={formData.improvementSuggestions.responsibilities} onChange={handleCheckboxChange('improvementSuggestions', 'responsibilities')} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.improvement7")}</Typography>}
              />

              <TextField
                fullWidth
                label={t("safety.aiheuttaja9")}
                value={formData.improvementSuggestions.otherSuggestion}
                onChange={(e) =>
                  handleInputChange('improvementSuggestions', {
                    ...formData.improvementSuggestions,
                    otherSuggestion: e.target.value,
                  })
                }
                InputLabelProps={{ style: { color: '#071952' } }}
                sx={{ mt: 2 }}
                autoComplete='off'
              />
            </Grid>

            {/* Urgency */}
            <Grid item xs={12}>
              <Typography variant="h4" sx={{ color: '#071952', mb: 1 }}>
              {t("safety.rush")}
              </Typography>
              <FormControlLabel
                control={<Checkbox checked={formData.urgency === 'immediate'} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.rush1")}</Typography>}
                onChange={(e) => handleInputChange('urgency', e.target.checked ? 'immediate' : '')}
                autoComplete='off'
              />
              <FormControlLabel
                control={<Checkbox checked={formData.urgency === 'later'} />}
                label={<Typography sx={{ color: '#071952' }}>{t("safety.rush2")}</Typography>}
                onChange={(e) => handleInputChange('urgency', e.target.checked ? 'later' : '')}
                autoComplete='off'
              />
            </Grid>

            {/* Descriptions */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("safety.what")}
                value={formData.whatHappened}
                onChange={(e) => handleInputChange('whatHappened', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label={t("safety.where")}
                value={formData.where}
                onChange={(e) => handleInputChange('where', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("safety.howWhy")}
                value={formData.howAndWhy}
                onChange={(e) => handleInputChange('howAndWhy', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("safety.who")}
                value={formData.whoInvolved}
                onChange={(e) => handleInputChange('whoInvolved', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t("safety.couses")}
                value={formData.consequences}
                onChange={(e) => handleInputChange('consequences', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            {/* Resolution */}
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.isResolved}
                    onChange={(e) => handleInputChange('isResolved', e.target.checked)}
                  />
                }
                label={<Typography sx={{ color: '#071952' }}>{t("safety.ok")}</Typography>}
              />
            </Grid>

            {/* Action Proposal */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t("safety.ehdotus")}
                value={formData.actionProposal}
                onChange={(e) => handleInputChange('actionProposal', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            {/* Names */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("safety.name")}
                value={formData.yourName}
                onChange={(e) => handleInputChange('yourName', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={t("safety.supervisor")}
                value={formData.employerName}
                onChange={(e) => handleInputChange('employerName', e.target.value)}
                InputLabelProps={{ style: { color: '#071952' } }}
                autoComplete='off'
              />
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit" fullWidth>
               {loading ? <CircularProgress size={24} />: t('forms.submit')}
              </Button>
            </Grid>
          </Grid>
        </form>
      </Container>
      <Snackbar 
      open={snackbarMessage !== null}
      autoHideDuration={6000}
      onClose={() => setSnackbarMessage(null)}>
        <Alert
          onClose={() => setSnackbarMessage(null)} 
          severity={snackbarSeverity} 
          sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SafetyObservationForm;
