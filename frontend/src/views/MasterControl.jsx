import React, { useEffect, useState, useCallback } from 'react'; 
import { 
        Container, 
        Typography, 
        Paper, 
        Box, 
        TableContainer, 
        Table, 
        TableHead, 
        TableRow, 
        TableCell, 
        TableBody, 
        Button, 
        TextField, 
        Dialog, 
        DialogActions, 
        DialogContent, 
        DialogTitle, 
        DialogContentText, 
        Snackbar, 
        CircularProgress, 
        Alert, 
        FormGroup, 
        FormControlLabel, 
        Checkbox 
    } from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../api/config.js';
import InfoModal from './InfoModal.jsx';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const formatDateToDDMMYYYY = (dateString) => {
    if (!dateString) return ""; // Handle empty or invalid dates

    try {
        // Check if the date format is DD/MM/YYYY
        const [day, month, year] = dateString.split('/');
        if (day && month && year) {
            const date = new Date(`${year}-${month}-${day}`); // Convert to YYYY-MM-DD
            if (!isNaN(date)) {
                return `${day}.${month}.${year}`; // Return in DD.MM.YYYY format
            }
        }

        // If parsing fails, return the original string
        return "";
    } catch (error) {
        console.error("Error formatting date:", error, dateString);
        return ""; // Return empty string for invalid dates
    }
};

const MasterControl = () => {
    const { t } = useTranslation();
    const [masterData, setMasterData] = useState([]);
    const [editRowIndex, setEditRowIndex] = useState(null);
    const [editedRow, setEditedRow] = useState({});
    const [searchOsasto, setSearchOsasto] = useState([]); // Array for multiple selections
    const [searchItemNumber, setSearchItemNumber] = useState('');
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [loading, setLoading] = useState(false); // Loading state
    const [snackbarMessage, setSnackbarMessage] = useState(null); // Snackbar message
    const [snackbarSeverity, setSnackbarSeverity] = useState('success'); // Snackbar severity
    const [deleteId, setDeleteId] = useState(null);
    const [displayedData, setDisplayedData] = useState([]);
    const [rowLimit, setRowLimit] = useState(50);
    const [lastSortConfig, setLastSortConfig] = useState({column: null, order: 'asc'});
    const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
    const [handleEmptyDataDialog, setHandleEmptyDataDialog] = useState(false);
    const [emptyId, setEmptyId] = useState(null);

    axios.defaults.withCredentials = true;

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        setLoading(true);
        axios
            .get(`${API_URL}/api/getData`)
            .then((response) => {
                const cleanedData = response.data.filter((row) => row.Osasto);
                const  sortedData = sortData(cleanedData, lastSortConfig, lastSortConfig);
                setMasterData(sortedData);
                setRowLimit(50);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
                setSnackbarMessage('Error fetching data');
                setSnackbarSeverity('error');
            })
            .finally(() => setLoading(false));
    };

    const filterAndPaginateData = useCallback(() => {
        const filtered = masterData.filter((row) => {
            const osastoValue = row.Osasto ? String(row.Osasto).toLowerCase() : '';
            const itemNumberValue = row['Item number'] ? String(row['Item number']).toLowerCase() : '';

            const osastoMatch = searchOsasto.length === 0 || searchOsasto.includes(osastoValue);
            const itemNumberMatch = itemNumberValue.includes(searchItemNumber.toLowerCase());

            return osastoMatch && itemNumberMatch;
        });

        setDisplayedData(filtered.slice(0, rowLimit));
    }, [masterData, searchOsasto, searchItemNumber, rowLimit]);

    useEffect(() => {
        filterAndPaginateData();
    }, [filterAndPaginateData]);

    const handleScroll = useCallback((e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        if (scrollTop + clientHeight >= scrollHeight - 50) {
            setRowLimit((prev) => prev + 50);
        }
    }, []);

    const handleEditClick = (index, row) => {
        setEditRowIndex(index);
        setEditedRow(row);
    };

    const handleInputChange = (e, field) => {
        setEditedRow({ ...editedRow, [field]: e.target.value });
    };

    const handleSaveClick = (id) => {
        setLoading(true);
        axios
            .post(`${API_URL}/api/update_osasto`, {
                id,
                new_osasto_value: editedRow['Osasto'],
                new_jononumero_value: parseInt(editedRow['Jononumero'], 10),
                new_quantity_value: parseInt(editedRow['Quantity'], 10),
            })
            .then(() => {
                setEditRowIndex(null);
                setSnackbarMessage('Row updated successfully');
                setSnackbarSeverity('success');
                fetchData();
            })
            .catch((error) => {
                console.error('Error saving row:', error);
                setSnackbarMessage('Error saving row');
                setSnackbarSeverity('error');
            })
            .finally(() => setLoading(false));
    };

    const handleDuplicateRow = (id) => {
        setLoading(true);
        axios.post(`${API_URL}/api/add_row`, { id })
            .then(() => {
                setSnackbarMessage('Row duplicated successfully');
                setSnackbarSeverity('success');
                fetchData();
            }).catch(error => {
                console.error('Duplicate error:', error);
                setSnackbarMessage('Error duplicating row');
                setSnackbarSeverity('error');
            }).finally(() => setLoading(false));
    };


    const handleDeleteClick = (id) => {
        setDeleteId(id);
        setOpenDeleteDialog(true);
    };


    const handleEmptyDataClose = () => {
        setEmptyId(null);
        setHandleEmptyDataDialog(false);
    }

    const handleEmptyDataClick = (id) => {
        setEmptyId(id);
        setHandleEmptyDataDialog(true);
    }

    const handleEmptyData = () => {
        console.log(emptyId);
        setLoading(true);
        axios.post(`${API_URL}/api/empty_data`, { id: emptyId})
            .then(() => {
                setSnackbarMessage('Data emptied successfully');
                setSnackbarSeverity('success');
                fetchData();
            })
            .catch(error => {
                console.log('Empty error:', error);
                setSnackbarMessage('Error emptying data');
                setSnackbarSeverity('error');
            })
            .finally(() => {
                setHandleEmptyDataDialog(false);
                setLoading(false);
            });
    };

    const handleDeleteConfirm = () => {
        setLoading(true);
        axios.post(`${API_URL}/api/delete_row`, { id: deleteId })
            .then(() => {
                setSnackbarMessage('Row deleted successfully');
                setSnackbarSeverity('success');
                fetchData();
            }).catch(error => {
                console.error('Delete error:', error);
                setSnackbarMessage('Error deleting row');
                setSnackbarSeverity('error');
            }).finally(() => {
                setOpenDeleteDialog(false);
                setLoading(false);
            });
    };
    
    const handleDeleteCancel = () => {
        setOpenDeleteDialog(false);
    };

    const handleOsastoCheckboxChange = (event) => {
        const value = event.target.value;
        setSearchOsasto((prev) =>
            prev.includes(value) ? prev.filter((osasto) => osasto !== value) : [...prev, value]
        );
    };

    const filteredData = masterData.filter(row => {
        const osastoValue = row.Osasto ? String(row.Osasto).toLowerCase() : '';
        const itemNumberValue = row['Item number'] ? String(row['Item number']).toLowerCase() : '';

        const osastoMatch = searchOsasto.length === 0 || searchOsasto.includes(osastoValue);
        const itemNumberMatch = itemNumberValue.includes(searchItemNumber.toLowerCase());

        return osastoMatch && itemNumberMatch;
    });

    const getColor = (status) => {
        if (status === "Valmis") {
            return 'rgba(0, 255, 0, 0.4)';
        }
        if (status === "Aloitettu") {
            return 'rgba(247, 223, 7, 0.6)';
        }
        if (status === "Yli") {
            return 'rgba(203, 12, 241, 0.4)';
        }
        return 'inherit';
    }

    const handleSnackBarClose = () => {
        setSnackbarMessage(null);
    }
    const sortData = (data, sortConfig) => {
        if (!sortConfig || !sortConfig.column) return data; // Return as-is if no column is specified.
    
        return [...data].sort((a, b) => {
            const valueA = a[sortConfig.column] || 0;
            const valueB = b[sortConfig.column] || 0;
    
            if (sortConfig.order === 'asc') {
                return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
            } else {
                return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
            }
        });
    };

    const handleSort = (column) => {
        setLastSortConfig((prevConfig) => {
            const newOrder = prevConfig.column === column && prevConfig.order === 'asc' ? 'desc' : 'asc';
            return { column, order: newOrder };
        });

        // Sort data immediately after updating the sorting configuration
        setMasterData((prevData) => sortData(prevData, { column, order: lastSortConfig.order === 'asc' ? 'desc' : 'asc' }));
    };
    
    const toggleSortOrder = () => handleSort('VKO');
    const toggleOsastoSortOrder = () => handleSort('Jononumero');

    const osastoOptions = [...new Set(masterData.map((row) => row.Osasto))];
    console.log('Osasto options:',searchOsasto);

    const getJononumero = (jononumero) => {
        if (jononumero === 0 || jononumero === null || jononumero === undefined || jononumero === '') {
            return 'rgba(251, 54, 255, 0.7)';
        }
        if (jononumero > 0 && jononumero <= 9) {
            return 'rgba(8, 252, 252, 0.7)';
        }
        if (jononumero >= 11 && jononumero <= 20) {
            return 'rgba(220, 245, 0, 0.7)';
        }
        if (jononumero >= 21 && jononumero <= 30) {
            return 'rgba(155, 135, 23, 0.7)';
        }
        if (jononumero >= 31 && jononumero <= 40) {
            return 'rgba(5, 45, 155, 0.7)';
        }
        if (jononumero === 99){
            return 'rgba(0, 245, 51, 0.7)';
        }
        if (jononumero === 10){
            return 'rgba(253, 148, 62, 0.7)';
        }
    }

    const openModal = () => setIsInfoModalOpen(true);

    return (
        <Container maxWidth={false} sx={{ display: 'flex', flexDirection: 'column', height: '95vh', maxWidth: '100%', width: '100%', px :1  }} onClick = {handleSnackBarClose}>
            <Typography variant="h4" component="h1" gutterBottom color="#071952">
                {t('Master Control')}
            </Typography>
    
            {/* Search bar */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <FormGroup row>
                    {osastoOptions
                        .filter((osasto) => osasto)
                        .sort((a, b) => a - b)
                        .map((osasto) => (
                            <FormControlLabel
                            sx={{color: 'black'}}
                                key={osasto}
                                control={
                                    <Checkbox
                                        checked={searchOsasto.includes(String(osasto))}
                                        onChange={handleOsastoCheckboxChange}
                                        value={osasto}
                                    />
                                }
                                label={osasto || 'Unknown'}
                            />
                        ))}
                </FormGroup>
                <TextField
                    label="Search by Item number"
                    variant="outlined"
                    value={searchItemNumber}
                    onChange={(e) => setSearchItemNumber(e.target.value)}
                />
                <Button onClick={openModal} variant="contained" color="primary" sx={{ml: 25}}>
                    {t('Info')}
                </Button>
            </Box>
    
            <Paper sx={{ flexGrow: 1, overflow: 'hidden', width: 'calc(100vw - 345px)', px: 1, mx: 'auto' }}>
                <TableContainer sx={{ height: '100%', overflowY: 'auto' }} onScroll={handleScroll}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('osasto')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>
                                    <Box onClick={toggleOsastoSortOrder} sx={{ display: 'flex', alignItems: 'center', cursor: 'crosshair', backgroundColor: 'rgba(223, 245, 39, 0.4) ', ':hover': {backgroundColor:'rgba(0,0,0,0.08)'}}} disabled={loading}>
                                        {t('jononumero')} {lastSortConfig.column === 'Jononumero' ? (lastSortConfig.order === 'asc' ? '▲' : '▼') : null}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>
                                    <Box onClick={toggleSortOrder} sx={{ display: 'flex', alignItems: 'center', cursor: 'crosshair', backgroundColor: 'rgba(223, 245, 39, 0.4) ', ':hover': {backgroundColor:'rgba(0,0,0,0.08)'}}} disabled={loading}>
                                        {t('vko')} {lastSortConfig.column === 'VKO' ? (lastSortConfig.order === 'asc' ? '▲' : '▼') : null}
                                    </Box>
                                </TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('ship date')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5' }}>{t('Sales order')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>{t('item number')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('reference number')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>{t('deliver remainder')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('Quantity')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('total made')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('actions')}</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Leik.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Rem.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Pain.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Esiv.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Hyg.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Erik.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Präs.</TableCell>
                                <TableCell sx={{py: 1, width: '5%'}}>Pak.</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center">
                                        <CircularProgress />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                masterData.length > 0 ? (
                                    displayedData.map((row, index) => (
                                        <TableRow 
                                            key={index} 
                                            sx={{
                                                backgroundColor : row['total_made'] === row['Quantity']
                                                ? 'rgba(0, 255, 0, 0.2)' : 'inherit',
                                                '&:hover': {
                                                    backgroundColor: 'rgba(0, 0, 0, 0.08)',
                                                }
                                            }}>
                                            <TableCell sx={{ py: 1, width: '5%' }}>
                                                {editRowIndex === index ? (
                                                    <TextField
                                                        value={editedRow['Osasto']}
                                                        onChange={(e) => handleInputChange(e, 'Osasto')}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                ) : (
                                                    row['Osasto']
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 1, width: '5%' , backgroundColor: getJononumero(row['Jononumero']), color:'black'}}>
                                                {editRowIndex === index ? (
                                                    <TextField
                                                        value={editedRow['Jononumero']}
                                                        onChange={(e) => handleInputChange(e, 'Jononumero')}
                                                        fullWidth
                                                        size="small"
                                                    />
                                                ) : (
                                                    row['Jononumero']
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>{row['VKO']}</TableCell>
                                            <TableCell sx={{ py: 1 }}>
                                                {formatDateToDDMMYYYY(row['Ship date'])}
                                            </TableCell>
                                            <TableCell sx={{ py: 1 }}>{row['Sales order']}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>
                                                {row['Item number']}
                                            </TableCell>
                                            <TableCell sx={{ py: 1, width: '5%' }}>{row['Reference number']}</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>
                                                {row['Deliver remainder']}
                                            </TableCell>
                                            <TableCell sx={{ py: 1, width: '5%' }}>
                                                {editRowIndex === index ? (
                                                    <TextField
                                                        value={editedRow['Quantity']}
                                                        onChange={(e) => handleInputChange(e, 'Quantity')}
                                                        fullWidth
                                                        size="small"
                                                        sx={{ minWidth: '55px' }}
                                                    />
                                                ) : (
                                                    row['Quantity']
                                                )}
                                            </TableCell>
                                            <TableCell sx={{ fontWeight: 'bold', color: 'rgba(7, 87, 144, 1)', py: 1 }}>
                                                {row['total_made']}
                                            </TableCell>
                                            <TableCell sx={{ py: 1, width: '5%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.1}}>
                                                    {editRowIndex === index ? (
                                                        <>
                                                            <Button onClick={() => handleSaveClick(row._id)} disabled={loading}>{t('Save')}</Button>
                                                        </>
                                                    ) : (
                                                        <>
                                                    <Button onClick={() => handleEditClick(index, row)} disabled={loading}  sx={{
                                                            minWidth: 'auto',
                                                            padding: '1px 2px', // Smaller padding
                                                            fontSize: '0.8rem', // Smaller font size
                                                        }}>{t('Edit')}</Button>
                                                    <Button onClick={() => handleDuplicateRow(row._id)} disabled={loading} sx={{
                                                            minWidth: 'auto',
                                                            padding: '1px 2px', // Smaller padding
                                                            fontSize: '0.8rem', // Smaller font size
                                                        }}>{t('Mult')}</Button>
                                                    <Button color="error" onClick={() => handleDeleteClick(row._id)} sx={{
                                                            minWidth: 'auto',
                                                            padding: '1px 2px', // Smaller padding
                                                            fontSize: '0.8rem', // Smaller font size
                                                        }}>
                                                        {t('Del')}
                                                    </Button>
                                                        </>
                                                    )}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusLeikkaus']) }}
                                                        >
                                                            {row['total_madeLeikkaus']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusRemmit'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madeRemmit']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusPainatus'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madePainatus']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusEsivalmistelu'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madeEsivalmistelu']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusHygienia'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madeHygienia']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['Statusrikoispuoli'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madeErikoispuoli']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['total_made'], row["Quantity"]) }}
                                                        >
                                                            {row['total_made']}
                                            </TableCell>
                                            <TableCell sx={{ 
                                                            py: 1, 
                                                            width: '5%', 
                                                            backgroundColor: getColor(row['StatusPakkaus'], row["Quantity"]) }}
                                                        >
                                                            {row['total_madePakkaus']}
                                            </TableCell>
                                            {/* 
                                            <TableCell sx={{py: 1, width: '5%'}}>
                                                <Button
                                                    sx= {{color: 'red'}}
                                                    onClick={() => handleEmptyDataClick(row._id)}
                                                    >
                                                    <DeleteForeverIcon/>
                                                </Button>
                                            </TableCell>
                                            */}
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={11} align="center">
                                            {t('No data available')}
                                        </TableCell>
                                    </TableRow>
                                )
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
           {/* 
            <Dialog open={handleEmptyDataDialog} onClose={handleEmptyDataClose}>
                <DialogTitle>{t('Empty data')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Are you sure you want to empty the data?')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button color="error" disabled={loading} onClick={handleEmptyData}>{t('Yes, Empty all the data')}</Button>
                    <Button onClick={handleEmptyDataClose}>{t('Cancel')}</Button>
                </DialogActions>

            </Dialog>
            */}
            {/* Delete dialog */}
            <Dialog open={openDeleteDialog} onClose={handleDeleteCancel}>
                <DialogTitle>{t('Delete row')}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {t('Are you sure you want to delete this row from master?')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDeleteCancel}>{t('Cancel')}</Button>
                    <Button onClick={handleDeleteConfirm} color="error" disabled={loading}>{t('Delete')}</Button>
                </DialogActions>
            </Dialog>
    
            {/* Snackbar for success/error messages */}
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
            <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)}></InfoModal>
        </Container>
    );
    
};

export default MasterControl;
