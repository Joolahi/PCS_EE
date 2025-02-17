import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../api/config';
import { Container,Snackbar,Alert, Typography, Paper, Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Button, Modal, Box, TextField, CircularProgress, FormControl, InputLabel, Select, MenuItem, } from '@mui/material';

const Press = () => {
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
    const [modalInput, setModalInput] = useState('');   

    const [totalMadeInput, setTotalMadeInput] = useState();
    const [selectedKey, setSelectedKey] = useState('');
    const [isProductReady, setIsProductReady] = useState(false);

    const [loading, setLoading] = useState(false);
    const [updating, setUpdating] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message state
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // Snackbar severity ("success", "error", etc.)

    const navigate = useNavigate();
    const { t } = useTranslation(); // Initialize the t function for translations


    const fetchData = (osasto) => {
        setLoading(true);
        axios.get(`${API_URL}/api/getOsasto${osasto}`)
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
                        "Hygienialuokka": row["Hygienialuokka"] ?? 'N/A',
                        "StatusLeikkaus": row["StatusPress"] ?? 'Ei aloitettu',
                        "total_made": row["total_made"] ?? '-',
                        "section": osasto,
                        "SOnumber": row["Sales order"] ?? 'Ei ole',
                        "Deliver remainder": row["Deliver remainder"] ?? 'Ei ole',
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


    const handleFieldChange = (event) => {
        const selected = event.target.value;
        setSelectedField(selected);
        fetchData(selected); // Dynamically fetch new osasto data
    };

    const handleRowClick = (row) => {
        setOpenModal(true);
        setSelectedKey(row.object_id);
    };

    const handleModalClose = () => {
        setOpenModal(false);
        setModalInput(""); // Reset the input when the modal closes
    };

    const handleSubmit = () => {
        console.log("Submitted value:", modalInput);
        if (selectedKey && modalInput) {
            axios.post(`${API_URL}/api/updatePress`, {
                id: selectedKey,
                total_made: parseInt(modalInput, 10)
            })
            .then(response => {
                console.log("Successfully updated total_made:", response.data);
                fetchData(selectedField); // Refresh data after update
            })
            .catch(error => {
                console.error("Error updating total_made:", error.response?.data?.error || error.message);
            });
        }
        setOpenModal(false);
    };
    


    const getColor = (total_made, quantity) => {
        if (total_made === quantity) {
            return 'rgba(0, 255, 0, 0.3)'; // Green
            
        }   
        if (total_made < quantity && total_made > 0){
            return 'rgba(255, 255, 0, 0.3)'; // Yellow
        }
        if (total_made > quantity){
            return 'rgba(255, 0, 0, 0.3)'; // Red
        }
        return 'transparent';
    };
 

    return (
        <Container sx={{ display: 'flex', flexDirection: 'column', height: '90vh' }}>
            <Typography variant="h2" component="h1" gutterBottom color="#071952">
                {t('prassi')}
            </Typography>

            <FormControl sx={{ marginBottom: 2, minWidth: 120 }}>
                <InputLabel>{t("Select osasto")}</InputLabel>
                <Select value={selectedField} onChange={handleFieldChange} label={t("Selected osasto")}>
                    <MenuItem value={100}>100</MenuItem>
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
                                            bgcolor: getColor(row["total_made"], row["Quantity"]),
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
                                        <TableCell sx={{ padding: '6px 10px', fontSize: '0.875rem' }} >{row["total_made"]}</TableCell>
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
                onClose={handleModalClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        width: '400px',
                        borderRadius: '8px'
                    }}
                >
                    <Typography id="modal-title" variant="h6" component="h2">
                        {t('Enter Number')}
                    </Typography>
                    <TextField
                        fullWidth
                        variant="outlined"
                        margin="normal"
                        label={t('Number')}
                        value={modalInput}
                        onChange={(e) => setModalInput(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                    >
                        {t('Submit')}
                    </Button>
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

export default Press;