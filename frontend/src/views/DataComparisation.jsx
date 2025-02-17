import React, { useState, useEffect, useRef } from 'react';
import {
    Container,
    Typography,
    Paper,
    Select,
    MenuItem,
    Checkbox,
    ListItemText,
    Button,
    Grid,
    OutlinedInput,
} from '@mui/material';
import axios from 'axios';
import Chart from 'chart.js/auto';
import API_URL from '../api/config.js';
import { useTranslation } from 'react-i18next';

const DataComparisation = () => {
    const { t } = useTranslation();

    const [selectedWeeks, setSelectedWeeks] = useState([]);
    const [selectedYears, setSelectedYears] = useState([]);
    const [efficiencyData, setEfficiencyData] = useState([]);
    const [error, setError] = useState(null);

    const chartRef = useRef(null);
    const chartInstance = useRef(null); // Keep track of the Chart.js instance

    const weeks = Array.from({ length: 52 }, (_, i) => i + 1); // Weeks 1-52
    const years = [2022, 2023, 2024, 2025];

    // Fetch data from API
    const handleFetchData = async () => {
        try {
            setError(null); // Reset error
            const response = await axios.post(`${API_URL}/api/efficiencyHistory`, {
                weeks: selectedWeeks,
                years: selectedYears,
            });

            // Process the fetched data
            const fetchedData = response.data.map((entry) => ({
                week: parseInt(entry.summary_name.match(/KokkolaEfficiency_(\d+)/)?.[1] || 0, 10),
                year: new Date(entry.updated_at).getFullYear(),
                efficiencyNow: parseFloat(entry['EFFICIENCY NOW'] || 0),
                efficiencyTarget: parseFloat(entry['EFFICIENCY TARGET'] || 0),
                viikonTyotunnit: parseFloat(entry['viikon_tyotunnit'] || 0),
            }));

            setEfficiencyData(fetchedData);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred');
        }
    };

    // Generate Chart.js-compatible data
    const generateChartData = () => {
        if (!efficiencyData.length) return null;

        const labels = efficiencyData.map(
            (row) => `${t('Week')} ${row.week}, ${row.year}`
        );
        const efficiencyNowData = efficiencyData.map((row) => row.efficiencyNow);
        const efficiencyTargetData = efficiencyData.map((row) => row.efficiencyTarget);

        return {
            labels,
            datasets: [
                {
                    label: t('EFFICIENCY NOW'),
                    data: efficiencyNowData,
                    backgroundColor: 'rgba(7, 100, 221, 0.6)',
                    borderColor: 'rgb(5, 121, 121)',
                    borderWidth: 1,
                },
                {
                    label: t('EFFICIENCY TARGET'),
                    data: efficiencyTargetData,
                    backgroundColor: 'rgba(255, 99, 132, 0.6)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    type: 'line',
                    borderWidth: 2,
                },
            ],
        };
    };

    useEffect(() => {
        if (!chartRef.current) return;
    
        const chartData = generateChartData();
        if (!chartData) return;
    
        // Destroy the old chart instance if it exists
        if (chartInstance.current) {
            chartInstance.current.destroy();
        }
    
        // Create a new Chart.js instance
        const ctx = chartRef.current.getContext('2d');
        chartInstance.current = new Chart(ctx, {
            type: 'bar',
            data: chartData,
            options: {
                responsive: true,
                maintainAspectRatio: false, // Disable fixed aspect ratio
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: t('tehokkuus_vertailu'),
                    },
                    tooltip: {
                        enabled: true, // Keep tooltips enabled
                    },
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Weeks/Year',
                        },
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Values',
                        },
                        beginAtZero: true,
                    },
                },
            },
            plugins: [
                {
                    id: 'customLabels',
                    afterDraw: (chart) => {
                        const viikonTyotunnitData = efficiencyData.map((row) => row.viikonTyotunnit);
                        const efficiencyNowData = efficiencyData.map((row) => row.efficiencyNow);
                        const ctx = chart.ctx;
    
                        // Draw text for each bar in the first dataset
                        chart.data.datasets[0].data.forEach((value, index) => {
                            const bar = chart.getDatasetMeta(0).data[index];
                            const viikonTyotunnitValue = viikonTyotunnitData[index];
                            const efficiencyNowValue = efficiencyNowData[index];
    
                            ctx.save();
                            ctx.fillStyle = 'Black'; // Text color
                            ctx.font = 'bold 12px Arial'; // Font style
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
    
                            // Position the text inside the bar
                            const x = bar.x;
                            const y = bar.y + bar.height / 2;
    
                            // Draw the custom text
                            ctx.fillText(`${viikonTyotunnitValue} h`, x, y - 10); // Line 1
                            ctx.fillText(`T: ${efficiencyNowValue}`, x, y + 10); // Line 2
                            ctx.restore();
                        });
                    },
                },
            ],
        });
    }, [efficiencyData, t]);
    

    return (
        <Container maxWidth={false} style={{ padding: 0 }}>
            <Typography variant="h2" gutterBottom color={'primary'} sx={{ ml: 5 }}>
                {t('tehokkuus_vertailu')}
            </Typography>
            <Paper sx={{ padding: 2, ml: 5 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Typography>{t('selectWeeks')}</Typography>
                        <Select
                            multiple
                            value={selectedWeeks}
                            onChange={(e) => setSelectedWeeks(e.target.value)}
                            input={<OutlinedInput />}
                            renderValue={(selected) => selected.join(', ')}
                            fullWidth
                        >
                            {weeks.map((week) => (
                                <MenuItem key={week} value={week}>
                                    <Checkbox checked={selectedWeeks.indexOf(week) > -1} />
                                    <ListItemText primary={`${t('Week')} ${week}`} />
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography>{t('selectYears')}</Typography>
                        <Select
                            multiple
                            value={selectedYears}
                            onChange={(e) => setSelectedYears(e.target.value)}
                            input={<OutlinedInput />}
                            renderValue={(selected) => selected.join(', ')}
                            fullWidth
                        >
                            {years.map((year) => (
                                <MenuItem key={year} value={year}>
                                    <Checkbox checked={selectedYears.indexOf(year) > -1} />
                                    <ListItemText primary={`${t('Year')} ${year}`} />
                                </MenuItem>
                            ))}
                        </Select>
                    </Grid>
                </Grid>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFetchData}
                    sx={{ mt: 2 }}
                    disabled={selectedWeeks.length === 0 || selectedYears.length === 0}
                >
                    {t('FetchEfficiencyData')}
                </Button>
                {error && (
                    <Typography color="error" sx={{ mt: 2 }}>
                        {error}
                    </Typography>
                )}
            </Paper>
            <div
                style={{
                    backgroundColor: 'white',
                    border: '1px solid', // Debugging border
                    borderRadius: '5px',
                    boxShadow: '0 0 10px rgba(0, 0, 0, 0.7)',
                    padding: '15px',
                    margin: '15px auto',
                    marginLeft: '40px',
                    width: '100%',
                    maxWidth: '1550px',
                    height: '600px',
                    overflow: 'hidden',
                    }}
                >
                <canvas
                    ref={chartRef}
                    style={{
                        border: '1px solid', // Debugging border
                        width: '100%',
                        height: '100%',
                    }}
                />
            </div>
        </Container>
    );
};

export default DataComparisation;

// KATSO OTSIKOT!!