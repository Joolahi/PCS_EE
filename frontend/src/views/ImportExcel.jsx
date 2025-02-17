import React, { useState } from 'react';
import { Container, Typography, Button, Paper, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import { open } from '@tauri-apps/api/dialog';
import { readBinaryFile } from '@tauri-apps/api/fs';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import API_URL from '../api/config.js';

const ImportExcel = () => {
    const [filePath, setFilePath] = useState('');
    const [file, setFile] = useState(null); // State to store the File object
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false); // Loading state
    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
    const { t } = useTranslation();

    const selectFile = async () => {
        try {
            const selectedFilePath = await open({
                filters: [{ name: 'Excel Files', extensions: ['xlsx'] }]
            });
            if (selectedFilePath) {
                setFilePath(selectedFilePath);

                // Read the file as binary data
                const fileData = await readBinaryFile(selectedFilePath);
                const fileName = selectedFilePath.split('\\').pop();
                const file = new File([new Uint8Array(fileData)], fileName, {
                    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                });
                setFile(file); // Set the File object in state
            }
        } catch (error) {
            console.error('Error selecting file:', error);
            setSnackbarMessage('Error selecting file');
            setSnackbarSeverity('error');
        }
    };

    const uploadFile = async () => {
        if (!file) {
            setSnackbarMessage('Please select a file to upload');
            setSnackbarSeverity('error');
            return;
        }

        setLoading(true); // Start loading
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_URL}/api/import_excel`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setSnackbarMessage("File uploaded successfully");
            setSnackbarSeverity('success');
            console.log(response.data);
        } catch (error) {
            setSnackbarMessage(`Error: ${error.response?.data?.error || error.message}`);
            setSnackbarSeverity('error');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    const handleDownload = async () => {
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`${API_URL}/download_excel`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Demo.xlsx');
            document.body.appendChild(link);
            link.click();
            link.remove();
            setSnackbarMessage("File downloaded successfully");
            setSnackbarSeverity('success');
        } catch (error) {
            setSnackbarMessage(`Error: ${error.response?.data?.error || error.message}`);
            setSnackbarSeverity('error');
        } finally {
            setLoading(false); // Stop loading
        }
    };

    return (
      <Container sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom color="#071952">
              {t('import_excel')}
          </Typography>
          <Paper sx={{ p: 4, width: '100%', maxWidth: 600, textAlign: 'center' }}>
              <Typography variant="h4" component="h2" gutterBottom>
                  Upload Excel File
              </Typography>
              <Box sx={{ mb: 2 }}>
                  <Button variant="contained" color="primary" onClick={selectFile} disabled={loading}>
                      Select File
                  </Button>
              </Box>
              {filePath && (
                  <Typography variant="body1" sx={{ mb: 2 }}>
                      Selected File: {filePath}
                  </Typography>
              )}
              <Box sx={{ mb: 2 }}>
                  <Button variant="contained" color="secondary" onClick={uploadFile} disabled={loading}>
                      {loading ? <CircularProgress size={24} /> : 'Upload'}
                  </Button>
              </Box>
              <Typography variant="h4" component="h2" gutterBottom>
                  Download Excel File
              </Typography>
              <Box sx={{ mb: 2 }}>
                  <Button variant="contained" color="primary" onClick={handleDownload} disabled={true}>
                      {loading ? <CircularProgress size={24} /> : 'Download Excel'}
                  </Button>
              </Box>
              {message && (
                  <Typography variant="body1" color="textSecondary">
                      {message}
                  </Typography>
              )}
          </Paper>

          {/* Snackbar for success or error messages */}
          <Snackbar
              open={!!snackbarMessage}
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
      </Container>
    );
};

export default ImportExcel;
