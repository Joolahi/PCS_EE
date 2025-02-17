import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Paper,
    Box,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
} from '@mui/material';
import axios from 'axios';
import API_URL from '../api/config.js';

const WorkHours = () => {
    const [data, setData] = useState([]);
    const [sections] = useState([
        "Leikkaus", "Remmit", "Painatus", "Esivalmistelu", "Hygienia", "Erikoispuoli", "Pakkaus"
    ]);
    const [selectedSection, setSelectedSection] = useState('');
    const [filters, setFilters] = useState({
        salesOrder: '',
        referenceNumber: '',
        itemNumber: ''
    });
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [viewOption, setViewOption] = useState('all');

    // Fetch data based on the selected section
    const fetchDataBySection = (section) => {
        axios.post(`${API_URL}/api/work_hours`, { section })
            .then(response => {
                const result = response.data.data || [];
                console.log("Data fetched successfully:", result);
                setData(result);
            })
            .catch(err => {
                console.error("Error fetching data:", err);
                setData([]);
            });
    };

    const handleSectionChange = (e) => {
        const value = e.target.value;
        setSelectedSection(value);
        fetchDataBySection(value);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters({ ...filters, [name]: value });
    };

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setDialogOpen(true);
        console.log("Item clicked:", item);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setSelectedItem(null);
    };

    // Filter data dynamically
    const filteredData = data.filter(item =>
        (item["Sales order"] || '').toLowerCase().includes(filters.salesOrder.toLowerCase()) &&
        (item["Reference number"] || '').toLowerCase().includes(filters.referenceNumber.toLowerCase()) &&
        (item["Item number"] || '').toLowerCase().includes(filters.itemNumber.toLowerCase())
    );

    const calculateTotalTimeByPhase = (tasks) => {
        const phaseTotals = {};
    
        tasks.forEach((task) => {
            if (task.phase) {
                const [hours, minutes] = (task.total_time || "0:0").split(":").map(Number);
                const totalMinutes = hours * 60 + minutes;
    
                if (!phaseTotals[task.phase]) {
                    phaseTotals[task.phase] = { totalMinutes: 0, totalKPL: 0 };
                }
    
                phaseTotals[task.phase].totalMinutes += totalMinutes;
                phaseTotals[task.phase].totalKPL += task.kpl_done || 0;
            }
        });
    
        return Object.entries(phaseTotals).map(([phase, values]) => {
            const hours = Math.floor(values.totalMinutes / 60);
            const minutes = values.totalMinutes % 60;
            return {
                phase,
                total_time: `${hours}h ${minutes}min`,
                total_kpl: values.totalKPL,
            };
        });
    };
    
    // Aggregated data for phases
    const aggregatedPhases = selectedItem?.Task
        ? calculateTotalTimeByPhase(
            selectedItem.Task.filter((task) => task.section === selectedSection)
        )
        : [];

        const calculateTotalTimeByWorkerAndPhase = (tasks) => {
            const workerPhaseTotals = {};
        
            tasks.forEach((task) => {
                const { workerName, phase, comment } = task;
                if (workerName && phase) {
                    const [hours, minutes] = (task.total_time || "0:0").split(":").map(Number);
                    const totalMinutes = hours * 60 + minutes;
        
                    if (!workerPhaseTotals[workerName]) {
                        workerPhaseTotals[workerName] = {};
                    }
        
                    if (!workerPhaseTotals[workerName][phase]) {
                        workerPhaseTotals[workerName][phase] = { totalMinutes: 0, totalKPL: 0, comments: [] };
                    }
        
                    workerPhaseTotals[workerName][phase].totalMinutes += totalMinutes;
                    workerPhaseTotals[workerName][phase].totalKPL += task.kpl_done || 0;
        
                    // Store comments for each phase
                    if (comment) {
                        workerPhaseTotals[workerName][phase].comments.push(comment);
                    }
                }
            });
        
            // Format the data for rendering
            return Object.entries(workerPhaseTotals).map(([worker, phases]) => ({
                worker,
                phases: Object.entries(phases).map(([phase, values]) => {
                    const hours = Math.floor(values.totalMinutes / 60);
                    const minutes = values.totalMinutes % 60;
        
                    return {
                        phase,
                        total_time: `${hours}h ${minutes}min`,
                        total_kpl: values.totalKPL,
                        comments: values.comments, // Include comments
                    };
                }),
            }));
        };
        
        // Aggregated data for workers and phases
        const aggregatedWorkersWithPhases = selectedItem?.Task
            ? calculateTotalTimeByWorkerAndPhase(
                selectedItem.Task.filter((task) => task.section === selectedSection)
            )
            : [];

            const getAllDetailsWithTime = (tasks) => {
                const workerDetails = {};
            
                tasks.forEach((task) => {
                    const { workerName, phase, start, end_time } = task;
            
                    if (workerName && phase) {
                        const [hours, minutes] = (task.total_time || "0:0").split(":").map(Number);
                        const totalMinutes = hours * 60 + minutes;
            
                        if (!workerDetails[workerName]) {
                            workerDetails[workerName] = {};
                        }
            
                        if (!workerDetails[workerName][phase]) {
                            workerDetails[workerName][phase] = { totalMinutes: 0, totalKPL: 0, tasks: [] };
                        }
            
                        workerDetails[workerName][phase].totalMinutes += totalMinutes;
                        workerDetails[workerName][phase].totalKPL += task.kpl_done || 0;
                        workerDetails[workerName][phase].tasks.push({
                            start,
                            end_time,
                            kpl_done: task.kpl_done || 0,
                        });
                    }
                });
            
                // Format the data for rendering
                return Object.entries(workerDetails).map(([worker, phases]) => ({
                    worker,
                    phases: Object.entries(phases).map(([phase, values]) => {
                        const hours = Math.floor(values.totalMinutes / 60);
                        const minutes = values.totalMinutes % 60;
            
                        return {
                            phase,
                            total_time: `${hours}h ${minutes}min`,
                            total_kpl: values.totalKPL,
                            tasks: values.tasks,
                        };
                    }),
                }));
            };
            
            // Aggregated data for all details
            const allDetailsWithTime = selectedItem?.Task
                ? getAllDetailsWithTime(
                    selectedItem.Task.filter((task) => task.section === selectedSection)
                )
                : [];
        
    return (
        <Container maxWidth="lg" sx={{ py: 3 }}>
            <Typography variant="h3" component="h3" gutterBottom color="#071952">
                Work Hours by Section
            </Typography>

            {/* Section Dropdown */}
            <Box sx={{ mb: 1, p: 1, borderRadius: 2 }}>
                <FormControl fullWidth variant="outlined">
                    <InputLabel>Select Section</InputLabel>
                    <Select
                        value={selectedSection}
                        onChange={handleSectionChange}
                        label="Select Section"
                        sx={{ backgroundColor: 'white', borderRadius: 1 }}
                    >
                        {sections.map((section, index) => (
                            <MenuItem key={index} value={section}>{section}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Filter Inputs */}
            <Box sx={{ mb: 1, display: 'flex', gap: 2, p: 1, borderRadius: 2 }}>
                <TextField
                    label="Filter by Sales Order"
                    variant="outlined"
                    name="salesOrder"
                    value={filters.salesOrder}
                    onChange={handleFilterChange}
                    fullWidth
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}   
                />
                <TextField
                    label="Filter by Reference Number"
                    variant="outlined"
                    name="referenceNumber"
                    value={filters.referenceNumber}
                    onChange={handleFilterChange}
                    fullWidth
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}   
                />
                <TextField
                    label="Filter by Item Number"
                    variant="outlined"
                    name="itemNumber"
                    value={filters.itemNumber}
                    onChange={handleFilterChange}
                    fullWidth
                    sx={{ backgroundColor: 'white', borderRadius: 1 }}   
                />
            </Box>

            {/* Table for Data */}
            <TableContainer component={Paper} sx={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Sales Order</strong></TableCell>
                            <TableCell><strong>Reference Number</strong></TableCell>
                            <TableCell><strong>Item Number</strong></TableCell>
                            <TableCell><strong>Total Work Hours</strong></TableCell>
                            <TableCell><strong>Current field</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredData.length > 0 ? (
                            filteredData.map((item, index) => (
                                <TableRow key={index} hover onClick={() => handleItemClick(item)} sx={{ cursor: 'pointer' }}>
                                    <TableCell>{item["Sales order"] || 'N/A'}</TableCell>
                                    <TableCell>{item["Reference number"] || 'N/A'}</TableCell>
                                    <TableCell sx={{fontWeight: 'bolder'}}>{item["Item number"] || 'N/A'}</TableCell>
                                    <TableCell sx={{ color: 'green', fontWeight: 'bold' }}>
                                        {item.total_work_hours || '0h 0m'}
                                    </TableCell>
                                    <TableCell>{item["Osasto" || 'N/A']}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} align="center">No data available.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Dialog for Item Details */}
            <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
    <DialogTitle>Item Details</DialogTitle>
    <DialogContent>
        {selectedItem ? (
            <>
                <Typography><strong>Sales Order:</strong> {selectedItem["Sales order"] || 'N/A'}</Typography>
                <Typography><strong>Reference Number:</strong> {selectedItem["Reference number"] || 'N/A'}</Typography>
                <Typography><strong>Item Number:</strong> {selectedItem["Item number"] || 'N/A'}</Typography>
                <Typography><strong>Total Work Hours:</strong> {selectedItem.total_work_hours || '0h 0m'}</Typography>
                <Typography><strong>KPL made: </strong>{selectedItem["total_made"]}</Typography>
                <Typography><strong>Osasto: </strong>{selectedItem["Osasto"]}</Typography>

                {/* View Selection Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, mb: 2 }}>
                    <Button
                        variant={viewOption === 'all' ? 'contained' : 'outlined'}
                        onClick={() => setViewOption('all')}
                    >
                        All Details
                    </Button>
                    <Button
                        variant={viewOption === 'worker' ? 'contained' : 'outlined'}
                        onClick={() => setViewOption('worker')}
                    >
                        Worker
                    </Button>
                    <Button
                        variant={viewOption === 'phases' ? 'contained' : 'outlined'}
                        onClick={() => setViewOption('phases')}
                    >
                        Phases
                    </Button>
                </Box>
                {viewOption === 'all' && (
                     <>
                        <Typography variant="h6" sx={{ mt: 2 }}>All Details</Typography>
                        {allDetailsWithTime.map(({ worker, phases }, index) => (
                            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                                <Typography variant="h6"><strong>Worker:</strong> {worker}</Typography>
                                {phases.map(({ phase, total_time, total_kpl, tasks }, phaseIndex) => (
                                    <Box key={phaseIndex} sx={{ ml: 2, mt: 1, p: 1, border: '1px dashed #aaa', borderRadius: 2 }}>
                                        <Typography><strong>Phase:</strong> {phase}</Typography>
                                        <Typography><strong>Total Time:</strong> {total_time}</Typography>
                                        <Typography><strong>Total KPL:</strong> {total_kpl}</Typography>
                                        <Typography variant="subtitle1" sx={{ mt: 1 }}>Task Details:</Typography>
                                        {tasks.map((task, taskIndex) => (
                                            <Box key={taskIndex} sx={{ ml: 3, mt: 1 }}>
                                                <Typography><strong>Start Time:</strong> {new Date(task.start).toLocaleString()}</Typography>
                                                <Typography><strong>End Time:</strong> {new Date(task.end_time).toLocaleString()}</Typography>
                                                <Typography><strong>KPL Done:</strong> {task.kpl_done}</Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </>
                    )}

{viewOption === 'worker' && (
    <>
        <Typography variant="h6" sx={{ mt: 2 }}>Worker Details</Typography>
        {aggregatedWorkersWithPhases.map(({ worker, phases }, index) => (
            <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #ccc', borderRadius: 2 }}>
                <Typography variant="h6"><strong>Worker:</strong> {worker}</Typography>
                {phases.map(({ phase, total_time, total_kpl, comments }, phaseIndex) => (
                    <Box key={phaseIndex} sx={{ ml: 2, mt: 1, p: 1, border: '1px dashed #aaa', borderRadius: 2 }}>
                        <Typography><strong>Phase:</strong> {phase}</Typography>
                        <Typography><strong>Total Time:</strong> {total_time}</Typography>
                        <Typography><strong>Total KPL:</strong> {total_kpl}</Typography>
                        {comments.length > 0 && (
                            <>
                                <Typography variant="subtitle1" sx={{ mt: 1 }}>Comments:</Typography>
                                <ul>
                                    {comments.map((comment, commentIndex) => (
                                        <li key={commentIndex}>{comment}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </Box>
                ))}
            </Box>
        ))}
    </>
)}

                {viewOption === 'phases' && (
                    <>
                        <Typography variant="h6" sx={{ mt: 2 }}>Total Time by Phase</Typography>
                        {aggregatedPhases.map(({ phase, total_time, total_kpl }, index) => (
                            <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid #ccc', borderRadius: 2 }}>
                                <Typography><strong>Phase:</strong> {phase}</Typography>
                                <Typography><strong>Total Time:</strong> {total_time}</Typography>
                                <Typography><strong>Total KPL:</strong> {total_kpl}</Typography>
                            </Box>
                        ))}
                    </>
                )}
            </>
        ) : (
            <Typography>No details available.</Typography>
        )}
    </DialogContent>
    <DialogActions>
        <Button onClick={handleDialogClose} color="primary">Close</Button>
    </DialogActions>
</Dialog>
        </Container>
    );
};

export default WorkHours;
