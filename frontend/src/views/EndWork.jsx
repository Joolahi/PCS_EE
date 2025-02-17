import React, { useState, useRef, useEffect} from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Modal, IconButton, Autocomplete, Snackbar, CircularProgress, Alert } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../api/config.js';
import { useTranslation } from 'react-i18next';

const EndWork = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const row = state || {};
    const { t } = useTranslation();

    const [name, setName] = useState('');
    const [kpl, setKpl] = useState('');
    const [comment, setComment] = useState('');
    const [open, setOpen] = useState(false);

    const [loading, setLoading] = useState(false); // Loading state for spinner
    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity

    const nameRef = useRef(null);
    const kplRef = useRef(null);
    const commentRef = useRef(null);

    useEffect(() => {
        if (row.workerName) {
            setName(row.workerName);
        }
        if (nameRef.current) {
            nameRef.current.focus();
        }
    }, [row.workerName]);

    const handleKplChange = (event) => {
        setKpl(event.target.value);
    };

    const handleCommentChange = (event) => {
        setComment(event.target.value);
    };

    const handleKplKeyDown = (event) => {
        if (event.key === 'Enter') {
            commentRef.current.focus();
        }
    };

    const handleCommentKeyDown = (event) => {
        if (event.key === 'Enter' && name && kpl && comment) {
            setOpen(true);
        }
    };

    const handleSubmit = async () => {
        if (!row?.id || !row?.group_id) {
            setSnackbarMessage('Missing required task details');
            setSnackbarSeverity('error');
            return;
        }
    
        const data = {
            id: row.id || row._id,  // MongoDB document ID
            group_id: row.group_id,  // Group ID
            task_id: row.task_id || "N/A",  // Task ID
            workerName: name,
            kpl_done: parseInt(kpl, 10),  // Ensure KPL is sent as a number
            comment: comment
        };
    
        setLoading(true); // Start loading spinner
        setOpen(false); // Close confirmation modal
    
        try {
            const response = await axios.post(`${API_URL}/api/endTask`, data);
            if (response.status === 200) {
                setSnackbarMessage('Task ended successfully!');
                setSnackbarSeverity('success');
    
                // Optionally navigate back to tasks list
                setTimeout(() => navigate('/workerdetails'), 2000);
            } else {
                setSnackbarMessage(response.data.error || 'Failed to end task');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            setSnackbarMessage(`Error: ${error.response?.data?.error || error.message}`);
            setSnackbarSeverity('error');
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    const handleClose = () => {
        setOpen(false);
        nameRef.current.focus();
    };

    const handleBackClick = () => {
        navigate(-1, { state: { ...row, name, kpl, comment } });
    };

    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    return (
        <Container>
            <Box display="flex" alignItems="center" mb={2}>
                <IconButton onClick={handleBackClick}>
                    <ArrowBackIcon />
                </IconButton>
            </Box>
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                {t("End Work")}
            </Typography>
            <Paper sx={{ padding: 2 }}>
                <Box mb={2}>
                    <Typography variant="h6">{t('Jononumero')} : {row?.Jononumero || 'N/A'}</Typography>
                    <Typography variant="h6">{t('Item number')} : {row?.["Item number"] || 'N/A'}</Typography>
                    <Typography variant="h6">{t('reference number')}: {row?.["Reference number"] || 'N/A'}</Typography>
                    <Typography variant="h6">{t('Phase')} : {row?.phase || 'N/A'}</Typography>
                    <Typography variant="h6">{t('Osasto')} : {row?.section || 'N/A'}</Typography>
                    <Typography variant="h6">{t('Name')} : {row?.workerName || 'N/A'}</Typography>
                </Box>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="KPL"
                        variant="outlined"
                        value={kpl}
                        onChange={handleKplChange}
                        onKeyDown={handleKplKeyDown}
                        inputRef={kplRef}
                    />
                    <TextField
                        label="Comment"
                        variant="outlined"
                        value={comment}
                        onChange={handleCommentChange}
                        onKeyDown={handleCommentKeyDown}
                        inputRef={commentRef}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpen(true)}
                        disabled={loading} // Disable button while loading
                    >
                        {loading ? <CircularProgress size={24} /> : "Submit"}
                    </Button>
                </Box>
            </Paper>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                    <Typography id="modal-modal-title" variant="h6" component="h2" color="#071952">
                    {t('Confirm Information')}
                    </Typography>
                    <Typography sx={{ mt: 2, color: "#071952" }}>
                    {t('Name')} : {name}
                    </Typography>
                    <Typography sx={{ mt: 2, color: "#071952" }}>
                        KPL: {kpl}
                    </Typography>
                    <Typography sx={{ mt: 2, color: "#071952" }}>
                        {t('Kommentti')} {comment}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button variant="contained" color="secondary" onClick={handleClose}>
                        {t('Edit')}
                        </Button>
                        <Button variant="contained" color="primary" onClick={handleSubmit}>
                        {t('Confirm')}
                        </Button>
                    </Box>
                </Box>
            </Modal>

            <Snackbar
                open={!!snackbarMessage} // Open if there's a message
                autoHideDuration={6000}
                onClose={() => setSnackbarMessage(null)}
                sx={{
                    position: 'fixed',
                    top: 0,
                    marginLeft: '45%',
                    zIndex: 9999
                }}
            >
                <Alert
                    onClose={() => setSnackbarMessage(null)}
                    severity={snackbarSeverity}
                    sx={{ width: '100%',
                          fontSize: '1.5rem'
                     }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default EndWork;
