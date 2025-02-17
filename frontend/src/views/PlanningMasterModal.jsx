import React, {useState, useEffect, useCallback} from 'react';
import ReactDOM from 'react-dom';
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
        CircularProgress, 
        FormGroup, 
        FormControlLabel, 
        Checkbox,
        Modal 
    } from '@mui/material';
import { useTranslation} from 'react-i18next';
import axios from 'axios';
import API_URL from '../api/config.js';

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

const PlanningMasterModal = ({isOpen, onClose}) => {    
        const { t } = useTranslation();
        const [masterData, setMasterData] = useState([]);
        const [editRowIndex, setEditRowIndex] = useState(null);
        const [editedRow, setEditedRow] = useState({});
        const [searchOsasto, setSearchOsasto] = useState([]); // Array for multiple selections
        const [searchItemNumber, setSearchItemNumber] = useState('');
        const [loading, setLoading] = useState(false); // Loading state
        const [displayedData, setDisplayedData] = useState([]);
        const [rowLimit, setRowLimit] = useState(50);
        const [lastSortConfig, setLastSortConfig] = useState({column: null, order: 'asc'});
        const [selectedRows, setSelectedRows] = useState([]);
        const [selectedRowsModal, setSelectedRowsModal] = useState(false);
    
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
                    console.log('Master data:', sortedData);
                })
                .catch((error) => {
                    console.error('Error fetching data:', error); 
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
    
        const handleInputChange = (e, field) => {
            setEditedRow({ ...editedRow, [field]: e.target.value });
        };
    

    
        const handleOsastoCheckboxChange = (event) => {
            const value = event.target.value;
            setSearchOsasto((prev) =>
                prev.includes(value) ? prev.filter((osasto) => osasto !== value) : [...prev, value]
            );
        };
    
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

            // Ensure `getSelectedRowsData` matches consistently
    const getSelectedRowsData = (selectedIds) => {
        return masterData.filter((row) => selectedIds.includes(row._id));
    };
    
    const handleRowSelection = (rowId) => {
        setSelectedRows((prev) => {
            const updatedSelection = prev.includes(rowId)
                ? prev.filter((id) => id !== rowId) // Deselect if already selected
                : [...prev, rowId]; // Add if not selected
    
            // Log the selected rows' data using the updated selection
            const selectedData = getSelectedRowsData(updatedSelection);
            console.log("Selected rows data:", selectedData);
            console.log("Row ID clicked:", rowId);
            console.log("Current selection:", prev);
            console.log("Updated selection:", updatedSelection);
    
            return updatedSelection; // Update the state
        });
    };
    
    const handleSelectAll = () => {
        if (!displayedData || displayedData.length === 0) return; // Handle empty or undefined displayedData
    
        const updatedSelection =
            selectedRows.length === displayedData.length
                ? [] // Deselect all
                : displayedData.map((row) => row._id); // Select all visible rows
    
        setSelectedRows(updatedSelection);
    
        // Log the selected rows' data
        const selectedData = getSelectedRowsData(updatedSelection);
        console.log("Selected Tasks Data:", selectedData);
    };
    const isSelected = (rowId) => selectedRows.includes(rowId);

    const openRowAddingModal = () => {
        setSelectedRowsModal(true);
    }
    
    return ReactDOM.createPortal(
        <Modal open={isOpen} onClose={onClose}>
        <Container 
            maxWidth={false} 
            sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                justifyContent: 'center',
                height: '95vh', 
                maxWidth: 'calc(100vw - 345px)', 
                width: 'calc(100vw - 345px)', 
                px :2,
                py: 2, 
                backgroundColor: 'whitesmoke', 
                marginTop: '20px',
                overflow: 'hidden'  
                }} >
            <Typography variant="h4" component="h1" gutterBottom color="#071952">
                Select master items to planning week
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
                <Button
                    variant="contained"
                    color="primary"
                    onClick={openRowAddingModal}>
                    {t('addWeeks')}
                </Button>
            </Box>
    
            <Paper sx={{ flexGrow: 1, overflow: 'hidden', width: '100%', maxWidth: 'calc(100vw - 365px)', px: 2,py: 2,  mx: 'auto', borderRadius: 2, borderColor: '#ffffff', margin: '20px'}}>
                <TableContainer sx={{ height: '100%', overflowY: 'auto', overflowX: 'auto', width: '100%' }} onScroll={handleScroll}>
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
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('Sales order')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>{t('item number')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('reference number')}</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', py: 1, width: '5%' }}>{t('deliver remainder')}</TableCell>
                                <TableCell sx={{ py: 1, width: '5%' }}>{t('Quantity')}</TableCell>
                                <TableCell padding= "checkbox">
                                    <Checkbox indeterminate={
                                        selectedRows.length > 0 && selectedRows.length < displayedData.length
                                        }
                                        checked={
                                            selectedRows.length === displayedData.length &&
                                            displayedData.length > 0
                                        }
                                        onChange={handleSelectAll} />
                                </TableCell>
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
                                            key={row._id} >
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
                                            <TableCell sx={{ py: 1, width: '5%' }}>
                                                {row._id}
                                            </TableCell>
                                            <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={isSelected(row._id)}
                                                onChange={() => handleRowSelection(row._id)}
                                            />
                                            </TableCell>
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
            <Modal open={selectedRowsModal} onClose={() => setSelectedRowsModal(false)}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: 4,
                        maxHeight: '80vh',
                        overflowY: 'auto',
                    }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="h6" gutterBottom color="#071952">
                            {t('Selected rows')}
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary">
                            {t('Add to planning')}
                        </Button>
                        <Button
                            variant="contained"
                            color="error"
                            onClick={() => setSelectedRowsModal(false)}>
                            {t('Cancel ')}
                        </Button>
                    </Box>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('osasto')}</TableCell>
                                <TableCell>{t('jononumero')}</TableCell>
                                <TableCell>{t('vko')}</TableCell>
                                <TableCell>{t('ship date')}</TableCell>
                                <TableCell>{t('Sales order')}</TableCell>
                                <TableCell>{t('item number')}</TableCell>
                                <TableCell>{t('reference number')}</TableCell>
                                <TableCell>{t('deliver remainder')}</TableCell>
                                <TableCell>{t('Quantity')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {getSelectedRowsData(selectedRows).map((row) => (
                                <TableRow key={row._id}>
                                    <TableCell>{row.Osasto}</TableCell>
                                    <TableCell>{row.Jononumero}</TableCell>
                                    <TableCell>{row.VKO}</TableCell>
                                    <TableCell>{row['Ship date']}</TableCell>
                                    <TableCell>{row['Sales order']}</TableCell>
                                    <TableCell>{row['Item number']}</TableCell>
                                    <TableCell>{row['Reference number']}</TableCell>
                                    <TableCell>{row['Deliver remainder']}</TableCell>
                                    <TableCell>{row.Quantity}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                </Box>
            </Modal>
        </Container>
        </Modal>,
        document.getElementById('planning-modal')
    )
}

export default PlanningMasterModal;



// Materiaali "täplä" tuotanto "täplä ", info vapaa sana teksi displaying correctly