import React, { useEffect, useState } from 'react';
import {
    Container,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Button,
    Modal, 
    Box, 
    TextField,
    CircularProgress,
    Snackbar,
    Alert
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_URL from '../api/config.js';
import InfoIcon from '@mui/icons-material/Info';
import phases from '../contexts/phases';

const Painatus = () => {
    const [data, setData] = useState([]); // Initialize to an empty array
    const [filteredData, setFilteredData] = useState([]);
    const [selectedField, setSelectedField] = useState(200);

    const [hlo, setHlo] = useState([]);
    const [kpl, setKpl] = useState([]);
    const [vaihe, setVaihe] = useState([]);
    const [kommentti, setKommentti] = useState([]);
    const [totalVaihe, setTotalVaihe] = useState([]);
    const [totalKpl, setTotalKpl] = useState([]);
    const [taskIds, setTaskIds] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [totalMadeInput, setTotalMadeInput] = useState();
    const [selectedKey, setSelectedKey] = useState('');
    const [isProductReady, setIsProductReady] = useState(false);

    const [selectedTask, setSelectedTask] = useState(null);
    const [newKplDone, setNewKplDone] = useState('');
    const [newPhase, setNewPhase] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    
    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message state
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity ("success", "error", etc.)

    const navigate = useNavigate();
    const { t } = useTranslation(); // Initialize the t function for translations

    axios.defaults.withCredentials = true;

    const fetchData = (osasto) => {
        setLoading(true);
        axios.get(`${API_URL}/api/getOsasto${osasto}`, { withCredentials: true })
            .then(response => {
                setLoading(false);
                console.log(`Response from backend for Osasto ${osasto}:`, response);
    
                let responseData = response.data;
    
                if (typeof responseData === 'string') {
                    responseData = responseData.replace(/NaN/g, 'null');
                    responseData = JSON.parse(responseData);
                }
    
                if (Array.isArray(responseData)) {
                    const cleanedData = responseData.map(row => ({
                        Jononumero: row.Jononumero ? parseFloat(row.Jononumero) : null,
                        "Item number": row["Item number"] ?? 'N/A',
                        "Reference number": row["Reference number"] ?? 'N/A',
                        "Quantity": row["Quantity"] ?? 'N/A',
                        "object_id": row["_id"] ?? 'N/A',
                        "Hygienialuokka": row["Hygienialuokka"] ?? '-',
                        "StatusPainatus": row["StatusPainatus"] ?? 'Ei aloitettu',
                        "total_madePainatus": row["total_madePainatus"] ?? '-',
                        "section": osasto,
                        "SOnumber": row["Sales order"] ?? 'Ei ole',
                        "Deliver remainder": row["Deliver remainder"] ?? 'Ei ole'
                    }));
                    console.log("Cleaned Data:", cleanedData);
    
                    // Sort the data by Jononumero in ascending order
                    cleanedData.sort((a, b) => (a.Jononumero === null ? 1 : (b.Jononumero === null ? -1 : a.Jononumero - b.Jononumero)));
    
                    setData(cleanedData);
                    setFilteredData(cleanedData);
                } else {
                    console.error('Expected an array but got:', typeof responseData);
                    setData([]);
                }
            })
            .catch(error => {
                setLoading(false);
                console.error(`Error fetching data for osasto ${osasto}:`, error);
                setData([]);
            });
    };
    
    useEffect(() => {
        fetchData(selectedField); // Fetch data for the initial osasto value
    }, [selectedField]); // Dependency ensures data refresh when osasto changes

    const handleRowClick = (row) => { 
        navigate('/StartWork', { state: {...row, section: "Painatus" }});
    };

    const handleFieldChange = (event) => {
        const selected = event.target.value;
        setSelectedField(selected);
        fetchData(selected); // Dynamically fetch new osasto data
    };

    const handleHistory = (row) => {
        const selectedKey = row.object_id
        setSelectedKey(selectedKey);
        console.log("Selected Key:", selectedKey);
    
        axios.post(`${API_URL}/api/fetch_history`, { id: selectedKey, section: "Painatus" }, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            let taskData = response.data.tasks;
    
            if (Array.isArray(taskData) && taskData.length > 0) {
                console.log("Filtered tasks from backend:", taskData);
    
                // Prepare arrays for storing multiple data points
                const hloArray = [];
                const kplArray = [];
                const vaiheArray = [];
                const kommenttiArray = [];
    
                const vaiheKplMapping = {};
                const taskIdsArray = [];

                // Loop through each task and collect data
                taskData.forEach(task => {
                    hloArray.push(task.workerName || 'Unknown Worker');
                    kplArray.push(task.kpl_done || 'Not finished');
                    vaiheArray.push(task.phase || 'No Phase');
                    kommenttiArray.push(task.comment || 'No Comment');
                    taskIdsArray.push(task.task_id || 'No Task ID');

                    // Map KPL values by phase
                    const vaihe = task.phase || 'No Phase';
                    const kpl = task.kpl_done || 0;
                    if (vaiheKplMapping[vaihe]) {
                        vaiheKplMapping[vaihe] += kpl;
                    } else {
                        vaiheKplMapping[vaihe] = kpl;
                    }
                });
    
                const totalVaiheArray = Object.keys(vaiheKplMapping);
                const totalKplArray = Object.values(vaiheKplMapping);
    
                // Set state with collected data
                setHlo(hloArray);
                setKpl(kplArray);
                setVaihe(vaiheArray);
                setKommentti(kommenttiArray);
                setTotalVaihe(totalVaiheArray);
                setTotalKpl(totalKplArray);
                setTaskIds(taskIdsArray);    
                setOpenModal(true); // Open the modal when data is available
            } else {
                console.log('No tasks found for the provided section.');
                setHlo([]);
                setKpl([]);
                setVaihe([]);
                setKommentti([]);
                setTotalVaihe([]);
                setTotalKpl([]);
                setTaskIds([]);
            }
        })
        .catch(error => {
            console.error('Error fetching tasks by section:', error.response?.data?.error || error.message);
        });
    };

    const handleProuductReadyClick = () => {
        setIsProductReady(true);
    }

    const handleConfirmClick = () => {
        console.log("Selected Key:", selectedKey);
        const section = "Painatus";
        if (totalMadeInput !== '' && selectedKey) {
            setUpdating(true);
    
            axios.post(`${API_URL}/api/update_total_made_section`, {
                id: selectedKey,  // MongoDB document ID
                section: section, // Pass the section dynamically
                total_made: parseInt(totalMadeInput, 10) // User-provided total_made value
            }, {
                headers: { 'Content-Type': 'application/json' }
            })
            .then(response => {
                setUpdating(false);
                console.log("Total made updated successfully:", response.data);
    
                setSnackbarMessage(response.data.message || "Total made updated successfully");
                setSnackbarSeverity("success");
                setOpenModal(false); // Close the modal
                setTotalMadeInput(''); // Clear the input field
                fetchData(selectedField); // Refresh the data
            })
            .catch(error => {
                setUpdating(false);
                console.error("Error updating total made:", error.response?.data?.error || error.message);
                setSnackbarMessage( error.response?.data?.error || error.message ||"Failed to update total made. Please try again.");
                setSnackbarSeverity("error");
            });
        } else {
            setSnackbarMessage("Fill in the total made field before confirming.");
            setSnackbarSeverity("error");
        }
    };

    const handleEditTask = (task) => {
        setSelectedTask(task);
        setNewKplDone(task.kpl_done || '');
    
        // Ensure `task.phase` is valid
        const validPhase = phases
            .filter(p => p.id === "Painatus") 
            .some(p => p.label === task.phase) ? task.phase : "";
    
        setNewPhase(validPhase); 
        setIsEditing(true);
    };

    const handleModifyTask = () => {
        if (!selectedTask || newKplDone === "" || newPhase === "") {
            setSnackbarMessage("Fill in all fields before updating the task.");
            setSnackbarSeverity("error");
            return
        }
        setUpdating(true);
        axios.post(`${API_URL}/api/modify_task`, {
            id: selectedTask.id,
            task_id: selectedTask.task_id,
            new_quantity: parseInt(newKplDone, 10),
            new_phase: newPhase
        })
        .then(response => {
            setUpdating(false);
            console.log("Task updated successfully:", response.data);

            setSnackbarMessage("Task updated Successfully! 🎉")
            setSnackbarSeverity("success");
            setIsEditing(false);
            setOpenModal(false); // Close the modal
            fetchData(selectedField); // Refresh the data
        })
        .catch(error => {
            setUpdating(false);
            console.error("Error updating task:", error.response?.data?.error || error.message);
            setSnackbarMessage(error.response?.data?.error || error.message || "Failed to update task. Please try again.");
        });
    };

    
    const getStatusColor = (StatusPainatus) => {
        switch (StatusPainatus) {
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
    };

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                {t('print')}
            </Typography>

            <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
                <InputLabel>{t("Select osasto")}</InputLabel>
                <Select value={selectedField} onChange={handleFieldChange} label={t("Selected osasto")}>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200}>200</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                    <MenuItem value={400}>400</MenuItem>
                    <MenuItem value={500}>500</MenuItem>
                </Select>
            </FormControl>
            {loading ? (<CircularProgress />
            ) : (
            <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
                <TableContainer sx={{ height: '100%', overflowY: 'auto' }}>
                    <Table stickyHeader size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{fontWeight: 'bolder', padding: '6px 10px', fontSize: '0.875rem' }} >{t('osasto')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('jononumero')}</TableCell>
                                <TableCell sx={{fontWeight: 'bolder', padding: '6px 10 px', fontSize: '0.875rem'}}>{t('item number')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('hygienialuokka')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('SO number')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('deliver remainder')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('quantity')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('made')}</TableCell>
                                <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{t('status')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {filteredData.length > 0 ? (
                                filteredData.map((row, index) => (
                                    <TableRow
                                        key={index}
                                        onClick={() => handleRowClick(row)}
                                        sx={{
                                            cursor: 'pointer',
                                            bgcolor: getStatusColor(row["StatusPainatus"]),
                                            '&:hover': {
                                                bgcolor: 'rgba(0, 0, 0, 0.08)',
                                            }
                                        }}
                                    >
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["section"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row.Jononumero}</TableCell>
                                        <TableCell sx={{fontWeight: 'bold', padding: '6px 10px', fontSize: '0.875rem'}}>{row["Item number"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["Hygienialuokka"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["SOnumber"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem', color: "#115399" }} >{row["Deliver remainder"]}</TableCell>                                                                                
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["Quantity"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["total_madePainatus"]}</TableCell>
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["StatusPainatus"]}</TableCell>
                                        <TableCell>
                                            <Button onClick={(event) => {
                                                event.stopPropagation();
                                                handleHistory(row);  // Pass the row data to handleHistory
                                            }}>
                                                <InfoIcon/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        {t('No data available')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            )}

             {/* Modal to display history data */}
             <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setIsProductReady(false); // Reset product ready clicked state when modal is closed
                    setIsEditing(false);
                    setSelectedTask(null);
                }}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={{
                    position: 'absolute', 
                    top: '50%', 
                    left: '50%', 
                    transform: 'translate(-50%, -50%)', 
                    bgcolor: 'background.paper', 
                    boxShadow: 24, 
                    p: 4,
                    maxHeight: "80vh",
                    overflowY: 'auto' }}>
                    <Typography variant="h5" component="h2">{t('History Data')}</Typography>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('Hlo')}</TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('KPL')}</TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('Vaihe')}</TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('Kommentti')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {hlo.map((value, index) => (
                                <TableRow key={index}>
                                    <TableCell>{value}</TableCell>
                                    <TableCell>{kpl[index]}</TableCell>
                                    <TableCell>{vaihe[index]}</TableCell>
                                    <TableCell>{kommentti[index]}</TableCell>
                                    <TableCell>
                                        <Button onClick={() => handleEditTask({
                                            id: selectedKey,
                                            task_id: taskIds[index], // Fix: Correctly reference task_id
                                            kpl_done: kpl[index],
                                            phase: vaihe[index],
                                        })}>
                                            Edit
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {/* Extra Section: Display Total KPL by Phase */}
                    <Typography variant="h6" component="h3" sx={{ mt: 3 }}>
                        {t('Total KPL by Phase')}
                    </Typography>
                    <Table size='small '>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('Vaihe')}</TableCell>
                                <TableCell sx={{ fontSize: '1.2rem', fontWeight: 'bold', padding: '12px 16px' }}>{t('Total KPL')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {totalVaihe.map((phase, index) => (
                                <TableRow key={index}>
                                    <TableCell>{phase}</TableCell>
                                    <TableCell>{totalKpl[index]}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    <Button onClick={handleProuductReadyClick} sx={{ mt: 2 }}>{t('Product ready')}</Button>

                    {isProductReady && (
                        <>
                            <TextField
                                label={t('Enter Total Made')}
                                value={totalMadeInput}
                                onChange={(e) => setTotalMadeInput(e.target.value)}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <Button onClick={handleConfirmClick} sx={{ mt: 2 }}>
                                {updating ? <CircularProgress size={24}/> : t('Confirm')}
                            </Button>
                        </>
                    )}
                                        {isEditing && selectedTask && (
                        <Box sx={{ mt: 3 }}>
                            <Typography variant="h6">{t('Modify Task')}</Typography>
                            <TextField
                                label="New KPL Done"
                                type="number"
                                value={newKplDone}
                                onChange={(e) => setNewKplDone(e.target.value)}
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <FormControl fullWidth sx={{ mt: 2 }}>
                                <InputLabel id="phase-label">Select Phase</InputLabel>
                                <Select
                                    labelId="phase-label"
                                    value={phases.some(p => p.label === newPhase) ? newPhase : ""}
                                    onChange={(e) => setNewPhase(e.target.value)}
                                >
                                    {phases
                                        .filter(phase => phase.id === "Painatus") // ✅ Filter for "Leikkaus" phases
                                        .map((phase, index) => (
                                            <MenuItem key={index} value={phase.label}> {/* Use label as value */}
                                                {phase.label}
                                            </MenuItem>
                                        ))
                                    }
                                </Select>
                            </FormControl>
                            <Button
                                onClick={handleModifyTask}
                                sx={{ mt: 2 }}
                                disabled={updating}
                            >
                                {updating ? <CircularProgress size={24} /> : "Confirm Update"}
                            </Button>
                        </Box>
                    )}
                    <Button onClick={() => setOpenModal(false)} sx={{ mt: 2 }}>{t('Close')}</Button>
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

export default Painatus;
