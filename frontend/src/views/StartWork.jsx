import React, { useState, useRef, useEffect } from 'react';
import { Container, Typography, Paper, Box, TextField, Button, Modal, Autocomplete, Snackbar, CircularProgress } from '@mui/material';
import { Alert } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import names from '../contexts/names';
import phases from '../contexts/phases';
import API_URL from '../api/config.js';
import { useTranslation } from 'react-i18next';

const StartWork = () => {
    const { state } = useLocation();
    const row = state || {};
    const navigate = useNavigate();

    const [workers, setWorkers] = useState([{ name: null}]);  // Array to store multiple workers
    const [phase, setPhase] = useState(null);
    const [open, setOpen] = useState(false);
    const [section, setSection] = useState(row.section || '');
    const [loading, setLoading] = useState(false); // State for loading spinner
    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message state
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity ("success", "error", etc.)

    const nameRef = useRef([]);
    const phaseRef = useRef(null);
    const submitButtonRef = useRef(null);
    const {t} = useTranslation();
    useEffect(() => {
        nameRef.current[0]?.focus();
    }, []);

    const handleNameChange = (index ,event, newValue) => {
        const updateWorkers = [...workers]
        updateWorkers[index].name = newValue
        setWorkers(updateWorkers);
    };

    const handlePhaseChange = (event, newValue) => {
        setPhase(newValue);
    };

    const handleNameKeyDown = (index ,event) => {
        if (event.key === 'Enter' && index === workers.length -1) {
            phaseRef.current.focus();
        }
    };

    const handlePhaseKeyDown = (event) => {
        if (event.key === 'Enter' && workers.every(worker => worker.name) && phase) {
            setOpen(true);
        }
    };

    const handleSubmitKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleSubmit();
        }
    };

    const addWorkerField = () => {
        setWorkers([...workers, { name: null}]); 
    }

    const handleSubmit = async () => {
        if (!workers.every(worker => worker.name) || !phase) {
            setSnackbarMessage('All names must be filled');
            setSnackbarSeverity('error');
            return;
        }

        const data = {
            id: row.object_id,
            workerNames: workers.map(worker => worker.name.label),
            phase:phase.label,
            section: section
        };

        setLoading(true); // Start loading
        setOpen(false); // Close the modal
        console.log(data);

        try {
            const response = await axios.post(`${API_URL}/api/start_task`, data, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            if (response.status === 200) {
                setSnackbarMessage('Task started successfully!');
                setSnackbarSeverity('success');
                setOpen(false); // Close the modal
            } else {
                setSnackbarMessage(response.data.error || 'Error starting task');
                setSnackbarSeverity('error');
            }
        } catch (error) {
            setSnackbarMessage('Error occurred: ' + error.message);
            setSnackbarSeverity('error');
        } finally {
            setLoading(false); // Stop loading
            setTimeout(() => navigate(-1), 2000)
        }

        setWorkers([{ name: null }]);
        setPhase(null);
        nameRef.current[0].focus();
    };

    const handleClose = () => {
        setOpen(false);
        setWorkers([{ name: null }]);
        setPhase(null);
        phaseRef.current.focus();
    };

    // Filter phases based on the selected department
    const filteredPhases = phases.filter(phase => phase.id === section);

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
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                Start Work
            </Typography>
            <Paper sx={{ padding: 2 }}>
                <Box mb={2}>
                    <Typography variant="h6">{t('Jononumero')} : {row.Jononumero}</Typography>
                    <Typography variant="h6">{t('Item number')} : {row["Item number"]}</Typography>
                    <Typography variant="h6">{t('reference number')}: {row["Reference number"]}</Typography>
                    <Typography variant="h6">{t("status")} : {row["StatusLeikkaus"]}</Typography>
                    <Typography variant="h6">{t('osasto')} : {row["section"]}</Typography>
                    {/*<Typography variant="h6">{row["object_id"]}</Typography>*/}
                    <Button variant="outlined" onClick={addWorkerField}>
                        {t('Add Another Worker')}
                    </Button>
                </Box>
                <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {workers.map((worker, index) => (
                        <Autocomplete
                            key={index}
                            options={names}
                            getOptionLabel={(option) => option.label || ""}
                            value={worker.name}
                            onChange={(event, newValue) => handleNameChange(index, event, newValue)}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    label={`Name ${index + 1}`} 
                                    variant="outlined" 
                                    inputRef={(ref) => nameRef.current[index] = ref} 
                                    onKeyDown={(event) => handleNameKeyDown(index, event)}
                                />
                            )}
                            isOptionEqualToValue={(option, value) => option?.label === value?.label}
                        />
                    ))}
                    <Autocomplete
                        options={filteredPhases}  // Use the filtered list
                        getOptionLabel={(option) => option.label || ""}
                        value={phase}
                        onChange={handlePhaseChange}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label="Phase" 
                                variant="outlined" 
                                inputRef={phaseRef} 
                                onKeyDown={handlePhaseKeyDown}
                            />
                        )}
                        isOptionEqualToValue={(option, value) => option?.label === value?.label}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={() => setOpen(true)}
                        ref={submitButtonRef}
                        onKeyDown={handleSubmitKeyDown}
                        disabled={loading} // Disable the button while loading
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
                    {workers.map((worker, index) => (
                        <Typography key={index} sx={{ mt: 2 , color:"#071952" }}>
                            {t('Name')} : {index + 1}: {worker?.name?.label}
                        </Typography>
                    ))}
                    <Typography sx={{ mt: 2, color:"#071952" }}>
                        {t('Phase')} : {phase?.label}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleClose}
                        >
                            {t('Edit')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSubmit}
                            onKeyDown={handleSubmitKeyDown}
                        >
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

export default StartWork;
