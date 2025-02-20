import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Navigation from '../components/navigation'; // Fix the casing of the file name
import Paper from '@mui/material/Paper';
import { keyframes } from '@emotion/react';
import axios from 'axios';
import API_URL from '../api/config.js';
import { useTranslation } from 'react-i18next';

const dropDownAnimation = keyframes`
  0% {
    transform: translateY(-100px);
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    transform: translateY(100px);
    opacity: 0;
  }
`;

const Welcome = () => {
    const [showMessage, setShowMessage] = useState(false);
    const [moodCounts, setMoodCounts] = useState({bad: 0, neutral: 0, good: 0});
    const { t } = useTranslation();

    const handleClick = async (mood) => {
        try{
            const response = await axios.post(`${API_URL}/mood`, {mood});
            setMoodCounts(response.data);
            console.log(response.data);
        }
        catch(error){
            console.error(error);
        }
        setShowMessage(true);
        setTimeout(() => {
            setShowMessage(false);
        }, 5000); // Match with animation duration
    };

    // Calculate total votes and percentage for each mood
    const totalVotes = moodCounts.bad + moodCounts.neutral + moodCounts.good;
    const badPercentage = totalVotes ? (moodCounts.bad / totalVotes) * 100 : 0;
    const neutralPercentage = totalVotes ? (moodCounts.neutral / totalVotes) * 100 : 0;
    const goodPercentage = totalVotes ? (moodCounts.good / totalVotes) * 100 : 0;

    return (
        <Box sx={{height: '100vh', display: 'flex', flexDirection: 'column'}}>
            <Box>
                <Typography variant="h3" component="h4" sx={{ color: '#116b9d', textAlign: 'center', fontFamily:'calibri'}}>
                    We can handle it!
                </Typography>
            </Box>
        <Container sx={{ display: 'flex', flexDirection: 'column', overflow: 'auto', maxHeight: '100vh' }}>
            <Paper sx={{
                margin: "5%",
                marginTop: "5%",
                backgroundColor: "rgba(255, 255, 255, 0.8)", // Slightly transparent white background
                padding: "2rem",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)", // Add shadow for depth
                borderRadius: "8px",
                flexGrow: 1,
                overflow: 'hidden',
            }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="h2" component="h1" gutterBottom sx={{ color: '#071952', flexGrow: 1 }}>
                        {t('production control')}
                    </Typography>

                    {/* Mood Buttons 
                    <Box display="flex" flexDirection="column" alignItems="flex-end">
                        <Typography mb={1} variant="h6">{t('mood')}</Typography>
                        <Box display="flex" alignItems="center" gap={2}>
                            <Button variant="contained" onClick={() => handleClick('bad')} sx={{ backgroundColor: "rgba(188, 93, 93, 0.8)", fontSize: '2rem' }}>
                                🤬
                            </Button>
                            <Button variant="contained" onClick={() => handleClick('neutral')} sx={{ backgroundColor: "rgba(229, 232, 105, 0.8)", fontSize: '2rem' }}>
                                🤨
                            </Button>
                            <Button variant="contained" onClick={() => handleClick('good')} sx={{ backgroundColor: "rgba(64, 238, 90, 0.8)", fontSize: '2rem' }}>
                                🤩
                            </Button>
                        </Box>
                    </Box>
                    */}
                </Box>

                {/* Mood Meter 
                <Box mt={2}>
                    <Box sx={{ display: 'flex', width: '100%', height: '20px', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#e0e0e0' }}>
                        <Box sx={{ width: `${badPercentage}%`, backgroundColor: 'rgba(188, 93, 93, 0.8)' }} />
                        <Box sx={{ width: `${neutralPercentage}%`, backgroundColor: 'rgba(229, 232, 105, 0.8)' }} />
                        <Box sx={{ width: `${goodPercentage}%`, backgroundColor: 'rgba(64, 238, 90, 0.8)' }} />
                    </Box>
                    <Typography variant="body2" mt={1}>Total Votes: {totalVotes}</Typography>
                </Box>
                */}

                <Navigation />

                {/* Animation */}
                {showMessage && (
                    <Box
                        sx={{
                            animation: `${dropDownAnimation} 5s ease`,
                            position: 'absolute',
                            top: '0',
                            left: '50%', // Center it
                            transform: 'translateX(-50%)',
                            zIndex: 1000,
                        }}
                    >
                        <Typography variant='h4' sx={{ color: '#071952' }}>
                            KEEP IT GOING! 💪😇🫵
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Container>
        </Box>
    );
};

export default Welcome;
