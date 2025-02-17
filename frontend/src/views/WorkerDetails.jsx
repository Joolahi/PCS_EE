import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, 
    Typography, 
    Table, 
    TableBody, 
    TableCell, 
    TableContainer, 
    TableHead, 
    TableRow, 
    Paper, 
    Box, 
    TextField, 
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Autocomplete 
} from '@mui/material';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import names from '../contexts/names';
import API_URL from '../api/config.js';
import ErrorView from './ErrorView';

const WorkerTasks = () => {
    const navigate = useNavigate();
    const [workerName, setWorkerName] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null); // Initialize as null
    const [openErrorDialog, setOpenErrorDialog] = useState(false); // Track error dialog state
    const { t } = useTranslation();

    axios.defaults.withCredentials = true;
    const fetchWorkerTasks = () => {
        if (!workerName) {
            console.error('Worker name is required!');
            return;
        }
        const requestData = {workerName: workerName.label || workerName};
        axios.post(`${API_URL}/api/fetch_user_works`, requestData, {
            headers:
            {
                'Content-Type' : "application/json",
            }
        })
            .then(response => {
                if (response.data.tasks) {
                    setTasks(response.data.tasks);
                    console.log(tasks)
                } else {
                    console.error('Expected an array but got', response.data);
                    setTasks([]);  // Fallback to an empty array if the response is not an array
                }
            })
            .catch(error => {
                console.error('There was an error fetching the worker tasks!', error.response ? error.response.data : error.message);
                setTasks([]);  // Set tasks to an empty array in case of an error
            });
    };

    const handleRowClick = (task) => {
        setSelectedTask(task); // Set the selected task
    };

    const handleClose = () => {
        setSelectedTask(null); // Close the dialog by resetting selectedTask to null
    };

    const handleFinished = () => {
        const worker = workerName?.label || workerName;
        const stateToPass = {
            id: selectedTask?.id || selectedTask?._id,  // MongoDB document ID
            task_id: selectedTask?.task_id || "N/A",  // Task ID for identification
            group_id: selectedTask?.group_id || selectedTask?.Group || "N/A",  // Handle missing group_id
            workerName: worker,
            Jononumero: selectedTask?.Jononumero || 'N/A',
            "Item number": selectedTask?.["Item number"] || 'N/A',
            "Reference number": selectedTask?.["Reference number"] || 'N/A',
            phase: selectedTask?.phase || 'N/A',
            section: selectedTask?.section || 'N/A',
            "Sales order": selectedTask?.["Sales order"] || 'N/A'
            
         };
        navigate('/EndWork', { state: stateToPass });
    };

    const handleNameChange = (event, newValue) => {
        setWorkerName(newValue);
    };

    const handleOpenErrorDialog = () => {
        handleClose();
        setOpenErrorDialog(true);
    }
    
    const handleCloseErrorDialog = () => {
        setOpenErrorDialog(false);
    }

    // Function to determine background color based on status
    const getRowBackgroundColor = (task) => {
        if (task.section === "Leikkaus") {
            switch (task.StatusLeikkaus) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Remmit") {
            switch (task.StatusRemmit) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Esivalmistelu") {
            switch (task.StatusEsivalmistelu) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Erikoispuoli") {
            switch (task.StatusErikoispuoli) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Painatus") {
            switch (task.StatusPainatus) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Hygienia") {
            switch (task.StatusHygienia) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        if (task.section === "Pakkaus") {
            switch (task.StatusPakkaus) {
                case 'Aloitettu':
                    return 'rgba(255, 255, 0, 0.3)'; // Yellow
                case 'Valmis':
                    return 'rgba(0, 255, 0, 0.3)'; // Green
                case 'Häiriö':
                    return 'rgba(255, 0, 0, 0.3)'; // Red
                case 'Yli':
                    return 'rgba(255, 68, 68, 0.4)'; // Red
                default:
                    return 'transparent';
            }
        }
        return "transparent"; // For other sections
        
    };

    return (
        <Container id="main-content" sx={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#071952' }}>
                {t('worker_tasks')}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Autocomplete
                    options={names}
                    getOptionLabel={(option) => option.label || ""}
                    value={workerName}
                    onChange={handleNameChange}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label={t('name')} 
                            variant="outlined" 
                        />
                    )}
                    sx={{ width: '300px', mr: 2 }}
                />
                <Button variant="contained" onClick={fetchWorkerTasks}>
                    {t('search')}
                </Button>
            </Box>

            {/* Task Details Modal */}
            <Dialog open={!!selectedTask} onClose={handleClose}>
                <DialogTitle>{t('task_details')}</DialogTitle>
                <DialogContent>
                    {selectedTask && (
                        <>
                            <DialogContentText>{t('jononumero')}: {selectedTask.Jononumero || 'N/A'}</DialogContentText>
                            <DialogContentText>{t('item number')}: {selectedTask['Item number'] || 'N/A'}</DialogContentText>
                            <DialogContentText>{t('SO number')}: {selectedTask['Sales order'] || 'N/A'}</DialogContentText>
                            <DialogContentText>{t('phase')}: {selectedTask['phase'] || 'N/A'}</DialogContentText>
                            <DialogContentText>{t('section')}: {selectedTask['section'] || 'N/A'}</DialogContentText>
                            <DialogContentText>{t('kpl_done')}: {selectedTask['kpl_done'] || '0'}</DialogContentText>
                            <DialogContentText>{t('total_time')}: {selectedTask['total_time'] || 'N/A'}</DialogContentText>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>{t('close')}</Button>
                    <Button onClick={handleOpenErrorDialog}>{t('issue')}</Button>
                    <Button onClick={handleFinished}>{t('finished')}</Button>
                </DialogActions>
            </Dialog>

            {/* ErrorView Modal */}
            <ErrorView open={openErrorDialog} onClose={handleCloseErrorDialog} />

            {/* Task Table */}
            <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ height: '100%', overflowY: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('jononumero')}</TableCell>
                                <TableCell>{t('item number')}</TableCell>
                                <TableCell>{t('SO number')}</TableCell>
                                <TableCell>{t('Vaihe')}</TableCell>
                                <TableCell>{t('osasto')}</TableCell>
                                <TableCell>{t('personalScore')}</TableCell>
                                <TableCell>{t('total_time')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {tasks.length > 0 ? (
                                tasks
                                    .filter((tasks) => tasks["Osasto"] !== 900 && tasks["Osasto"] !== 800)
                                    .sort((a, b) => {
                                        const aTime = !a["total_time"]
                                        const bTime  = !b["total_time"]

                                        if (aTime && !bTime) {return -1 };
                                        if (!aTime && bTime) {return 1 };
                                        
                                        const isANonInteger = isNaN(parseFloat(a["kpl_done"])) || !Number.isInteger(parseFloat(a["kpl_done"]));
                                        const isBNonInteger = isNaN(parseFloat(b["kpl_done"])) || !Number.isInteger(parseFloat(b["kpl_done"]));
                                        return isANonInteger === isBNonInteger ? 0 : isANonInteger ? -1 : 1;
                                    })
                                    .map((task, index) => (
                                    <TableRow key={index} hover onClick={() => handleRowClick(task)} sx={{ backgroundColor: getRowBackgroundColor(task)}}>
                                        <TableCell>{task["Jononumero"] || 'N/A'}</TableCell>
                                        <TableCell>{task["Item number"] || 'N/A'}</TableCell>
                                        <TableCell>{task["Sales order"] || 'N/A'}</TableCell>
                                        <TableCell>{task["phase"] || 'N/A'}</TableCell>
                                        <TableCell>{task["section"] || 'N/A'}</TableCell>
                                        <TableCell>{task["kpl_done"] || 'Ei lopetettu'}</TableCell>
                                        <TableCell>{task["total_time"]}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">{t('no_tasks_found')}</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Container>
    );
};

export default WorkerTasks;