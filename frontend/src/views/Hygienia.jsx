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
    CircularProgress,
    Box
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import API_URL from '../api/config.js';
import InfoIcon from '@mui/icons-material/Info';

const Hygienia = () => {
    const [data, setData] = useState([]); // Initialize to an empty array
    const [filteredData, setFilteredData] = useState([]);
    const [selectedField, setSelectedField] = useState(300);
    
    const [hlo, setHlo] = useState([]);
    const [kpl, setKpl] = useState([]);
    const [vaihe, setVaihe] = useState([]);
    const [kommentti, setKommentti] = useState([]);
    const [totalVaihe, setTotalVaihe] = useState([]);
    const [totalKpl, setTotalKpl] = useState([]);

    const [openModal, setOpenModal] = useState(false);
    const [selectedKey, setSelectedKey] = useState('');

    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { t } = useTranslation(); // Initialize the t function for translations

    axios.defaults.withCredentials = true;

    const fetchData = (osasto) => {
        setLoading(true);
        axios.get(`${API_URL}/api/getOsasto${osasto}` , { withCredentials: true })
            .then(response => {
                setLoading(false);
                console.log('Response:', response);
                let responseData = response.data;
                
                if (typeof responseData === "string") {
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
                        "StatusHygienia": row["StatusHygienia"] ?? 'Ei aloitettu',
                        "total_madeHygienia": row["total_madeHygienia"] ?? '-',
                        "section": osasto,
                        "SOnumber" : row["Sales order"] ?? "Ei ole",
                        "Deliver remainder" : row["Deliver remainder"] ?? "Ei ole"
                    }));
                    console.log("Cleaned Data:", cleanedData);

                    // Sort the data by Jononumero in ascending order
                    cleanedData.sort((a, b) => (a.Jononumero === null ? 1 : (b.Jononumero === null ? -1 : a.Jononumero - b.Jononumero)));
                    setData(cleanedData);
                    setFilteredData(cleanedData);
                } else {
                    console.error('Expected an array but got:', typeof responseData);
                    setData([]); // Set data to an empty array if the response is not as expected
                }
            })
            .catch(error => {
                setLoading(false);
                console.error('There was an error fetching the data!', error);
                setData([]); // Set data to an empty array on error
            });
    };

    useEffect(() => {
        fetchData(selectedField);
    }, [selectedField]);

    const handleRowClick = (row) => {
        navigate('/StartWork', { state: {...row, section: "Hygienia" }});
    };

    const handleFieldChange = (event) => {
        const selected = event.target.value;
        setSelectedField(selected);
        setFilteredData(selected);
    }

    const handleHistory = (row) => {
        const selectedKey = row.object_id
        setSelectedKey(selectedKey);
        console.log("Selected Key:", selectedKey);
    
        axios.post(`${API_URL}/api/fetch_history`, { id: selectedKey, section: "Hygienia" }, {
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
    
                // Loop through each task and collect data
                taskData.forEach(task => {
                    hloArray.push(task.workerName || 'Unknown Worker');
                    kplArray.push(task.kpl_done || 'Not finished');
                    vaiheArray.push(task.phase || 'No Phase');
                    kommenttiArray.push(task.comment || 'No Comment');
    
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
    
                setOpenModal(true); // Open the modal when data is available
            } else {
                console.log('No tasks found for the provided section.');
                setHlo([]);
                setKpl([]);
                setVaihe([]);
                setKommentti([]);
                setTotalVaihe([]);
                setTotalKpl([]);
            }
        })
        .catch(error => {
            console.error('Error fetching tasks by section:', error.response?.data?.error || error.message);
        });
    };


    const getStatusColor = (StatusHygienia) => {
        switch (StatusHygienia) {
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
                {t('hygiene_side')}
            </Typography>

            <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
                <InputLabel>{t("Select osasto")}</InputLabel>
                <Select value={selectedField} onChange={handleFieldChange} label={t("Selected osasto")}>
                    <MenuItem value={100}>100</MenuItem>
                    <MenuItem value={200} >200</MenuItem>
                    <MenuItem value={300}>300</MenuItem>
                </Select>
            </FormControl>
            {loading ? (<CircularProgress />
            ) : (
                <Paper sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <TableContainer sx={{ height: '100%', overflowY: 'auto' }}>
                        <Table stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{fontWeight: 'bolder', padding: '6px 10 px', fontSize: '0.875rem'}} >{t('osasto')}</TableCell>
                                    <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }}>{t('jononumero')}</TableCell>
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
                                                bgcolor: getStatusColor(row["StatusHygienia"]),
                                                '&:hover': {
                                                    bgcolor: 'rgba(0, 0, 0, 0.08)',
                                                }
                                            }}
                                        >
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["section"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row.Jononumero}</TableCell>
                                            <TableCell sx={{fontWeight: 'bolder', padding: '6px 10 px', fontSize: '0.875rem'}}>{row["Item number"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["Hygienialuokka"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["SOnumber"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem', color: "#115399" }} >{row["Deliver remainder"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["Quantity"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["total_madeHygienia"]}</TableCell>
                                            <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["StatusHygienia"]}</TableCell>
                                            <TableCell>
                                                <Button onClick={(event) => {
                                                    event.stopPropagation();
                                                    handleHistory(row);
                                                }}>
                                                    <InfoIcon />
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
            )
        }
             {/* Modal to display history data */}
             <Modal
                open={openModal}
                onClose={() => {
                    setOpenModal(false);
                    setIsProductReady(false); // Reset product ready clicked state when modal is closed
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
                </Box>
            </Modal>
        </Container>
    );
};

export default Hygienia;
