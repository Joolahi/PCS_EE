import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Typography, Paper, CircularProgress, Button, Divider, FormControlLabel,Checkbox, TextField, Box   } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import API_URL from '../../api/config';
import { AuthContext } from "../../contexts/AuthContext";
import axios from 'axios';

const FormDetails = () => {
  const { user } = useContext(AuthContext);
  const { formType, id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation(); // Import translations
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    hyvaksytty: false,
    kasiteltyPvm: "",
    paatos: "",
    palkkioMaksettu: "",
    toimenpiteet: "",
    kaikkiToimenpiteetTehty: "",
  })

  useEffect(() => {
    const fetchFormDetails = async () => {
      try {
        const response = await fetch(`${API_URL}/api/forms/${formType}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch form details');
        const data = await response.json();
        setFormData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFormDetails();
  }, [formType, id]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.put(`${API_URL}/api/forms/update/${formType}/${id}`, formData);
      alert(t('forms.updateSuccess')); // Success message
      navigate(`/formDetails/${formType}/${id}`);
    } catch (err) {
      console.error("Error updating form:", err);
      alert(t('forms.updateError')); // Error message
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;

  const renderEditableFields = () => (
    <>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.hyvaksytty}
            onChange={handleChange}
            name="hyvaksytty"
          />
        }
        label={t('forms.hyvaksytty')}
      />

      <TextField
        label={t('forms.kasiteltyPvm')}
        name="kasiteltyPvm"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.kasiteltyPvm}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label={t('forms.paatos')}
        name="paatos"
        value={formData.paatos}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label={t('forms.palkkioMaksettu')}
        name="palkkioMaksettu"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.palkkioMaksettu}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label={t('forms.toimenpiteet')}
        name="toimenpiteet"
        value={formData.toimenpiteet}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <TextField
        label={t('forms.kaikkiToimenpiteetTehty')}
        name="kaikkiToimenpiteetTehty"
        type="date"
        InputLabelProps={{ shrink: true }}
        value={formData.kaikkiToimenpiteetTehty}
        onChange={handleChange}
        fullWidth
        margin="normal"
      />

      <Button
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        sx={{ mt: 2 }}
      >
        {t('forms.submit')}
      </Button>
    </>
  );

  const renderFormDetails = () => {
    switch (formType) {
      case "Turvallisuushavainto":
        return (
          <>
            <Typography variant="h6">{t('safety.what')}:</Typography>
            <Typography>{formData.whatHappened || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('safety.where')}:</Typography>
            <Typography>{formData.where || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('safety.couses')}:</Typography>
            <ul style={{ paddingLeft: '20px' }}>
              {Object.entries(formData.causes || {})
                .filter(([key, value]) => value)
                .map(([key, value]) => (
                  <li key={key}>{t(`safety.aiheuttaja${key}`) || key}</li>
                ))}
              {formData.causes?.otherCause && (
                <li>{t('safety.aiheuttajaotherCause')}: {formData.causes.otherCause}</li>
              )}
            </ul>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('safety.improvement')}:</Typography>
            <ul style={{ paddingLeft: '20px' }}>
              {Object.entries(formData.improvementSuggestions || {})
                .filter(([key, value]) => value)
                .map(([key, value]) => (
                  <li key={key}>{t(`safety.improvement${key}`) || key}</li>
                ))}
                {formData.improvementSuggestions?.otherSuggestion && (
                <li>{t('safety.improvementotherCause')}: {formData.improvementSuggestions.otherSuggestion}</li>
              )}
            </ul>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('safety.rush')}:</Typography>
            <Typography>{t(`${formData.urgency}`) || "N/A"}</Typography>
          </>
        );

      case "Aloite":
        return (
          <>
            <Typography variant="h6">{t('forms.pvm')}:</Typography>
            <Typography>{formData.laatimispvm || "N/A"}</Typography>
            { user && (
              <>
            <Typography variant="h6" sx={{ mt: 2 }}>{t('forms.aloitteen_laatijat')}:</Typography>
            <Typography>{formData.laatijat?.join(", ") || "N/A"}</Typography>
            </>
            )}
            <Typography variant="h6" sx={{ mt: 2 }}>{t('forms.nykytilanne')}:</Typography>
            <Typography>{formData.nykytilanne || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('forms.parannusehdotus')}:</Typography>
            <Typography>{formData.parannusehdotus || "N/A"}</Typography>
          </>
        );

      case "Poikkeama":
        return (
          <>
            <Typography variant="h6">{t('poikkeamat.PO')}:</Typography>
            <Typography>{formData.PoNumber || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('poikkeamat.WO')}:</Typography>
            <Typography>{formData.WoNumber || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('poikkeamat.havaittu')}:</Typography>
            <Typography>{formData.detectedDeviation || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('poikkeamat.description')}:</Typography>
            <Typography>{formData.description || "N/A"}</Typography>

            <Typography variant="h6" sx={{ mt: 2 }}>{t('poikkeamat.area')}:</Typography>
            <Typography>{formData.selectedOption?.label || "N/A"}</Typography>
          </>
        );

      default:
        return <Typography>{t('forms.missingField')}</Typography>;
    }
  };

  return (
    <Container>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 2 }}>
        {t('close')}
      </Button>
      <Paper elevation={3} sx={{ padding: 3, overflowY: 'auto', maxHeight: '100%' }}>
        <Typography variant="h4" gutterBottom>
          {t(`forms.${formType.toLowerCase()}`) || formType}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        {renderFormDetails()}
        <Box sx={{ mt: 3 }}/>
        {formType === "Aloite" && user ? renderEditableFields() : null}
      </Paper>
    </Container>
  );
};

export default FormDetails;
