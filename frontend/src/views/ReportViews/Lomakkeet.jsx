import { Typography, Box, Button, Container, Stack, Dialog, DialogTitle, DialogContent, DialogActions, Divider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import React, { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';

const Lomakkeet = () => {
  const { t } = useTranslation();
  const navigate = useNavigate(); // Initialize useNavigate at the top level

  return (
    <Container 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '80vh',
        textAlign: 'center',
        paddingTop: 6,
        borderRadius: '8px',
        maxWidth: '700px',
        margin: 'auto',
      }}
    >
      <Typography variant="h2" component="h1" color="#071952" gutterBottom>
        {t("lomakkeet")}
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: "#071952", fontSize: "25px" }}>
        {t('forms.select_form')}
      </Typography>

      <Stack spacing={2} direction="column" alignItems="center" width="100%">
        <Button
          component={NavLink}
          to="/aloite"
          sx={{
            color: 'white',
            backgroundColor: 'rgba(24,154,226, 1.0)',
            '&:hover': { backgroundColor: 'rgba(17, 125, 183, 1)', color: 'black' },
            borderRadius: '8px',
            padding: '10px 20px',
            width: '400px',
          }}
        >
          <Box>{t('aloite')}</Box>
        </Button>

        <Button
          component={NavLink}
          to="/safetyobservation"
          sx={{
            color: 'white',
            backgroundColor: 'rgba(24,154,226, 1.0)',
            '&:hover': { backgroundColor: 'rgba(17, 125, 183, 1)', color: 'black' },
            borderRadius: '8px',
            padding: '10px 20px',
            width: '400px',
          }}
        >
          <Box>{t('turvallisuus')}</Box>
        </Button>

        <Button
          component={NavLink}
          to="/poikkeama"
          sx={{
            color: 'white',
            backgroundColor: 'rgba(24,154,226, 1.0)',
            '&:hover': { backgroundColor: 'rgba(17, 125, 183, 1)', color: 'black' },
            borderRadius: '8px',
            padding: '10px 20px',
            width: '400px',
          }}
        >
          <Box>{t('poikkeama')}</Box>
        </Button>
        <Button 
              onClick={() => navigate('/allforms')}
              sx={{
                color: 'white',
                backgroundColor: 'rgba(24,154,226, 1.0)',
                '&:hover': { backgroundColor: 'rgba(17, 125, 183, 1)', color: 'black' },
                borderRadius: '8px',
                padding: '10px 20px',
                width: '400px',
              }}
            >
        <Box>{t('sentforms')}</Box>
        </Button>
      </Stack>
    </Container>
  );
};

export default Lomakkeet;
