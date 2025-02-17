import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Modal,
  Input,
  FormControl,
  Box,
  Tab,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import API_URL from '../api/config.js';    
import MasterPlanningModal from './PlanningMasterModal';

const ownProductionData = [
    {
        capacity: 37.5,
        capacityW: 4690,
        category: "AA",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.008
    },
    {
        capacity: 37.5,
        capacityW: 892,
        category: "A",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.042
    },
    {
        capacity: 37.5,
        capacityW: 272,
        category: "B",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.138
    },
    {
        capacity: 37.6,
        capacityW: 167,
        category: "C",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.225
    },
    {
        capacity: 37.4,
        capacityW: 136,
        category: "D",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.275
    },
    {
        capacity: 37.6,
        capacityW: 119,
        category: "E",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.316
    },
    {
        capacity: 37.5,
        capacityW: 90,
        category: "F",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 0.417
    },
    {
        capacity: 37.5,
        capacityW: 37,
        category: "G",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 1
    },
    {
        capacity: 37.5,
        capacityW: 6,
        category: "H",
        kplTotal: 0,
        hours: 0,
        difference: 0,
        categoryTime: 6
    },
    
]
const Planning = () => {
  const [open, setOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("");
  const [weeklyData, setWeeklyData] = useState([]); // For WeeklyData
  const [productionData, setProductionData] = useState([]); 
  const [formData, setFormData] = useState({});
  const [isPlanningModalOpen, setIsPlanningModalOpen] = useState(false);
  const { t } = useTranslation();

  const handleOpenModal = () => setOpen(true);

  const handleWeekChange = async (event) => {
    const week = event.target.value;
    setSelectedWeek(week);
    await fetchPlanningData(week);
  }

  const getCurrentISOWeek = () => {
    const date = new Date();
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(
      ((date - yearStart) / (24 * 60 * 60 * 1000) + yearStart.getUTCDay() + 1) / 7
    );
    const isoWeek = `W${String(weekNumber).padStart(2, '0')}`; // Pad week to 2 digits
    return `${date.getUTCFullYear()}-${isoWeek}`;
  };
  

  const fetchPlanningData = async (selectedWeek = null) => {
    try {
      const defaultWeek = getCurrentISOWeek(); // Use the helper function
      const weekToFetch = selectedWeek || defaultWeek;
      console.log("Fetching data for:", weekToFetch);
      setSelectedWeek(weekToFetch);
  
      const response = await axios.post(`${API_URL}/api/planning`, { year: weekToFetch });
      if (response.data) {
        const {WeeklyData, ompelijat, tyopaiviaViikko} = response.data;
        setWeeklyData({data: WeeklyData || [], ompelijat: ompelijat || 0, tyopaiviaViikko: tyopaiviaViikko || 0});
      } else {
      setWeeklyData({ data: [], ompelijat: 0 });
    }
  } catch (error) {
    console.error("Error fetching planning data:", error);
    setWeeklyData({ data: [], ompelijat: 0 });
  }
  };
  
  const calculateAndUpdateCategoryCounts = (data, filteredItems) => {
    // Filter valid items with a defined Category
    const validItems = filteredItems.filter((item) => item.Category);
  
    // Calculate category counts
    const categoryCounts = validItems.reduce((acc, item) => {
      const category = item.Category; // Match `Category` from filteredData
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});
  
    // Update the original data with calculated counts
    return data.map((row) => ({
      ...row,
      categoryKPL: categoryCounts[row.category] || 0, // Match `category` from ownProductionData
    }));
  };

  const calculateUpdateCategoryTotals = (data, filteredItems) => {
    const validItems = filteredItems.filter((item) => item.Category);

    const categoryTotals = validItems.reduce((acc, item) => {
      const category = item.Category;
      acc[category] = (acc[category] || 0) + item.Quantity;
      return acc;
    }, {});
    return data.map((row) => ({
      ...row,
      kplTotal: categoryTotals[row.category] || 0,
    }));
  };

  const calculateTotalHoursToProduce = (data, filteredItems) => {
    const validItems = filteredItems.filter((item) => item.Category);
    const neededTime = validItems.reduce((acc, item) => {
      const category = item.Category;
      acc[category] = (acc[category] || 0) + item.Quantity * item.Standardiaika;
      return acc;
    }, {});
    console.log(neededTime);

    return data.map((row) => ({
      ...row,
      hours: neededTime[row.category] || 0,
    }));
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchPlanningData();
    };
    fetchData();
  }, []);

  useEffect(() => {
  const updatedWithKPLCounts = calculateAndUpdateCategoryCounts(ownProductionData, weeklyData.data || []);
  const updatedWithKPLTotals = calculateUpdateCategoryTotals(updatedWithKPLCounts, weeklyData.data || []);
  const updatedWithTotalHours = calculateTotalHoursToProduce(updatedWithKPLTotals, weeklyData.data || []);
  
  setProductionData(updatedWithTotalHours);
  }, [weeklyData]);

  const handleUpdateOmpelu = async () => {
    try {
      const updatedData = {
        VKO_year:  selectedWeek,
        ompelijat: formData.ompelijat || weeklyData.ompelijat,
        tyopaiviaViikko:formData.tyopaiviaViikko || weeklyData.tyopaiviaViikko,
        totalOmpelutunnit: formData.totalOmpelutunnit || weeklyData.totalOmpelutunnit,
      }
      console.log(updatedData);
      const response = await axios.post(`${API_URL}/api/planning/updateOmpelu`, updatedData);
      if (response.status === 200){
        alert("Tiedot päivitetty onnistuneesti");
        await fetchPlanningData(selectedWeek);
      } else {
        alert("Tietojen päivitys epäonnistui");
      }
    } catch (error) {
      console.error("Error updating ompelu data:", error);
      alert("Tietojen päivitys epäonnistui");
    }
  }

  const hoursWorker = () => {
    const hours = weeklyData.tyopaiviaViikko * 7.5;
    return hours
  }

  const totalOmpelutunnit = () => {
    const total = weeklyData.ompelijat * hoursWorker();
    return total
  }
  
  const calculatedTotalHoursWorked = () => {
    return productionData.reduce((acc, row) => acc + (row.hours || 0), 0)
  }

  const calculateRemainingCapacity = () => {
    const totalWorkedHours = calculatedTotalHoursWorked();
    const totalAvailableHours = totalOmpelutunnit();
    return ((totalAvailableHours || 0) - (totalWorkedHours || 0)).toFixed(2);
  }

  const backgroundColor = () => {
    if (calculateRemainingCapacity() > -50 && calculateRemainingCapacity() < 50) {
      return 'transparent';
    }
    if (calculateRemainingCapacity() > 50) {
      return 'rgb(9, 117, 1, 0.5)';
    }
    if (calculateRemainingCapacity() < -50) {
      return 'rgb(255, 0, 0, 0.5)';
    }
  }

  const handlePlanningModal = () => {
    setIsPlanningModalOpen(true);
  }

  return (
    <Container
      maxWidth={false}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '95vh',
        px: 1,
        py: 2,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        color="#071952"
        sx={{ fontSize: '1.25rem', fontWeight: 'bold', mb: 1 }}
      >
        {t('Planning')}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          mb: 2,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="small"
          onClick={handleOpenModal}
        >
          {t('CreateWeek')}
        </Button>
        <FormControl sx={{ flexGrow: 1, maxWidth: 200 }}>
          <Input
            type="week"
            value={selectedWeek}
            onChange={handleWeekChange}
          />
        </FormControl>
      </Box>
       <Box
            sx={{
                display: 'flex',
                flexDirection: 'row',
                gap: 2,
                justifyContent: 'flex-start',
                width: '100%',
            }}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '48%',
          flex: 1,
          mb: 3,
        }}
      >
        <Typography
          variant="subtitle1"
          component="h2"
          gutterBottom
          sx={{ fontSize: '1rem', fontWeight: 'medium', mb: 1 }}
        >
          <strong>{t('ProductionPlan')}</strong>
        </Typography>
        <TableContainer>
          <Table
            sx={{
                borderCollapse:'collapse',
                '& .MuiTableCell-root' : {
                    border: '1px solid #ddd',
                    fontSize: '0.75rem',
                    padding: '3px 9px',
                },
              '& .MuiTableHead-root .MuiTableCell-root': {
                padding: '1px 9px',
                fontSize: '0.75rem',
              },
            }}
            size="small"
            aria-label="production table"
          >
            <TableHead>
              <TableRow>
                <TableCell><strong>Kapasiteettiin tarvittavat tunnit</strong></TableCell>
                <TableCell><strong>Kapasiteetti/vko</strong></TableCell>
                <TableCell><strong>Kategoria</strong></TableCell>
                <TableCell><strong>Kategoria KPL</strong></TableCell>
                <TableCell><strong>KPL yhteensä</strong></TableCell>
                <TableCell><strong>Tunnit</strong></TableCell>
                <TableCell><strong>Erotus</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productionData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{(row.capacityW && row.categoryTime ? row.capacityW * row.categoryTime : 0).toFixed(1)}</TableCell>
                  <TableCell>{row.capacityW}</TableCell>
                  <TableCell><strong>{row.category}</strong></TableCell>
                  <TableCell>{row.categoryKPL}</TableCell>
                  <TableCell sx={{ backgroundColor: 'rgb(9,117,1, 0.3)' }}>{row.kplTotal}</TableCell>
                  <TableCell>{row.hours.toFixed(2)}</TableCell>
                  <TableCell>{(row.capacityW && row.categoryTime && row.hours ? row.capacityW * row.categoryTime - row.hours: 0).toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
        <Paper
          elevation={3}
          sx={{
            p: 1,
            maxWidth: '48%',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            mb: 3,
          }}
        >
          <Box
            sx={{
              backgroundColor: backgroundColor(),
              p: 1,
              flexDirection: 'column',
              flex: 1
              
            }}>
          <Typography
            variant="subtitle1"
            component="h2"
            gutterBottom
            sx={{ fontSize: '1rem', fontWeight: 'medium', mb: 1 }}
          >
            <strong>Viikon kaikki työtunnit</strong>
          </Typography>
        
          {/* Ompelijat Input */}
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Ompelijat:</strong>
            </Typography>
            <Input
              type="number"
              placeholder={`(current: ${weeklyData?.ompelijat || 'N/A'})`} // Dynamic and descriptive placeholder
              defaultValue={weeklyData?.ompelijat || ''} // Prepopulate input with the current value
              sx={{
                width: '50%',
                fontSize: '1rem',
                border: '1px solid #ccc',
                padding: '3px',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9'
              }}
              inputProps={{
                style: { color: 'black',
                          fontWeight: 'bold',
                          opacity: 1
                 },
              }}
              onChange={(e) => setFormData({ ...formData, ompelijat: e.target.value })} // Update state
            />
          </Box>
            
          {/* Jäljellä oleva kokonaistuntikapasiteetti */}
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Jäljellä oleva kokonaistuntikapasiteetti:</strong>
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>
              {calculateRemainingCapacity() || 0} tuntia
            </Typography>
          </Box>
            
          {/* Ompelijan ompelua/päivä */}
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Ompelijan ompelua/päivä:</strong>
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>
              7.5 h
            </Typography>
          </Box>
            
          {/* Työpäiviä/viikko Input */}
          <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Työpäiviä/viikko:</strong>
            </Typography>
            <Input
              type="number"
              placeholder={`(current: ${weeklyData?.tyopaiviaViikko || 'N/A'})`}
              defaultValue={weeklyData?.tyopaiviaViikko || ''}
              sx={{
                width: '50%',
                fontSize: '1rem',
                border: '1px solid #ccc',
                padding: '3px',
                borderRadius: '4px',
                backgroundColor: '#f9f9f9',
              }}
              inputProps={{
                style: { color: 'black',
                          fontWeight: 'bold',
                          opacity: 1
                 },
              }}
              onChange={(e) => setFormData({ ...formData, tyopaiviaViikko: e.target.value })}
            />
          </Box>
            
          {/* Tunnit/työntekijä */}
          <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Tunnit/työntekijä:</strong>
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>
              {hoursWorker() || 0}
            </Typography>
          </Box>
            
          {/* Total ompelutunnit */}
          <Box sx={{ mb: 1, display: 'flex', flexDirection: 'row', gap: 5 }}>
            <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 'medium' }}>
              <strong>Total ompelutunnit:</strong>
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#555', fontWeight: 'bold' }}>
              {totalOmpelutunnit() || 0}
            </Typography>
          </Box>
            
          {/* Update Button */}
          <Button
            variant="contained"
            color="primary"
            sx={{ alignSelf: 'flex-end', mt: 1 }}
            onClick={handleUpdateOmpelu}
          >
            Päivitä tiedot
          </Button>
          </Box>
        </Paper>
      </Box>

        <Paper
          elevation={3}
          sx={{
            p: 1,
            overflow: 'auto',
            display: 'flex',
            flexDirection: 'column',
            maxWidth: '100%',
          }}
        >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            }}>
          <Typography
            variant="subtitle1"
            component="h2"
            gutterBottom
            sx={{ fontSize: '1rem', fontWeight: 'medium', mb: 1 }}
          >
            <strong>{t(`Date ${selectedWeek}`)}</strong>
          </Typography>
          <Button variant="contained" color="primary" size="small" onClick={handlePlanningModal}>
            Select Items
            </Button>
        </Box>
          <TableContainer>
          <Table
          sx={{
              borderCollapse:'collapse',
              '& .MuiTableCell-root' : {
                  border: '1px solid #ddd',
                  fontSize: '0.75rem',
                  padding: '3px 9px',
              },
            '& .MuiTableHead-root .MuiTableCell-root': {
              padding: '1px 9px',
              fontSize: '0.75rem',
            },
          }}
          size="small"
          aria-label="production table"
            >
              <TableHead>
                <TableRow>
                    <TableCell><strong>Week</strong></TableCell>
                    <TableCell><strong>Ship Date</strong></TableCell>
                    <TableCell><strong>Sales Order</strong></TableCell>    
                    <TableCell><strong>Item Number</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Quantity</strong></TableCell>
                    <TableCell><strong>Deliver Remainder</strong></TableCell>
                    <TableCell><strong>Reference Number</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Standard Time</strong></TableCell>
                    <TableCell><strong>Tarvittavat tunnit</strong></TableCell>
                   
                </TableRow>
              </TableHead>
              <TableBody>
                {(weeklyData.data || []).map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row["VKO"]}</TableCell>
                    <TableCell>{row["Ship date"]}</TableCell>
                    <TableCell>{row["Sales order"]}</TableCell>
                    <TableCell>{row["Item number"]}</TableCell>
                    <TableCell>{row["Name"]}</TableCell>
                    <TableCell>{row["Quantity"]}</TableCell>
                    <TableCell>{row["Deliver remainder"]}</TableCell>
                    <TableCell>{row["Reference number"]}</TableCell>

                    <TableCell sx={{backgroundColor: 'rgb(117,107,1,0.4)'}}>{row["Category"]}</TableCell>
                    <TableCell sx={{backgroundColor: 'rgb(117,107,1,0.4)'}}>{row["Standardiaika"]}</TableCell>
                    <TableCell sx={{backgroundColor: 'rgb(250,236,85,0.4)'}}>
                        {((parseFloat(row["Quantity"]) || 0) * (parseFloat(row["Standardiaika"]) || 0)).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            p: 4,
            width: 400,
          }}
        >
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            color="#071952"
            sx={{ fontSize: '1.25rem', fontWeight: 'bold', mb: 1 }}
          >
            {t('CreateWeek')}
          </Typography>
          <Input type="week" />
          <Button
            variant="contained"
            color="primary"
            size="small"
            sx={{ alignSelf: 'flex-start', mt: 1 }}
          >
            {t('Create')}
          </Button>
        </Paper>
      </Modal>
      <MasterPlanningModal isOpen={isPlanningModalOpen} onClose={() => setIsPlanningModalOpen(false)}></MasterPlanningModal>
    </Container>
  );
};

export default Planning;
