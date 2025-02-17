import React, { useContext } from 'react';
import { Button, Box, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import AccountCircle from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './languageSwitcher';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import FormatColorFillIcon from '@mui/icons-material/FormatColorFill';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HomeIcon from '@mui/icons-material/Home';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import SanitizerIcon from '@mui/icons-material/Sanitizer';
import ExtensionIcon from '@mui/icons-material/Extension';
import SummarizeIcon from '@mui/icons-material/Summarize';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SwitchAccessShortcutIcon from '@mui/icons-material/SwitchAccessShortcut';
import CompressIcon from '@mui/icons-material/Compress';
import InfoIcon from '@mui/icons-material/Info';

const Navigation = () => {
    const { user, logout } = useContext(AuthContext);
    const { t } = useTranslation(); 

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '95%', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto'}}>
                <Button                         // Home button
                    component={NavLink}
                    to="/"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('home')}
                        <HomeIcon />
                    </Box>
                </Button>
                <Button                         // Leikkaus button
                    component={NavLink}
                    to="/leikkaus"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('cutting')}
                        <ContentCutIcon />
                    </Box>
                </Button>
                <Button                         // Remmit leikkaus button
                    component={NavLink}
                    to="/remmit"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('remmit')}
                        <SwitchAccessShortcutIcon />
                    </Box>
                </Button>
                <Button                     // Painatus button
                    component={NavLink}
                    to="/painatus"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('print')}
                        <FormatColorFillIcon />
                    </Box>
                </Button>
                <Button                     // Esivalmistelu button
                    component={NavLink}
                    to="/preparation"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('preparation')}
                    </Box>
                    <ExtensionIcon />
                </Button>
                <Button                     // Hygieniapuoli button 300
                    component={NavLink}
                    to="/hygiene"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('hygiene_side')}
                        <SanitizerIcon />
                    </Box>
                </Button>
                <Button                     // Erikoispuoli button 400
                    component={NavLink}
                    to="/special_side"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('special_side')}
                        
                    </Box>
                    <DeleteOutlineIcon />
                </Button>
                <Button                    
                component={NavLink}
                    to="/press"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('prassi')}
                    </Box>
                    <CompressIcon />
                </Button>
                <Button                     // Pakkaus button 300/400/500
                    component={NavLink}
                    to="/packaging"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('packaging')}
                        <LocalShippingIcon />
                    </Box>
                </Button>

                <Button                     // Worker Details
                    component={NavLink}
                    to="/workerdetails"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('details')}
                        <AssignmentIndIcon />
                    </Box>
                </Button>
                <Button
                    component={NavLink}
                    to="/efficiency"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('Kooste Total')}
                        <StarBorderIcon />
                    </Box>
                </Button>
                <Button
                    component={NavLink}
                    to="/datacomparisation"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold'}}>
                        {t('tehokkuus_vertailu')}
                    </Box>
                </Button>
                {/* 
                <Button 
                    component={NavLink}
                    to="/lomakkeet"
                    sx={{
                        color: '#071952',
                        '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                        display: 'flex',
                        justifyContent: 'space-between'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                        {t('lomakkeet')}
                    </Box>
                </Button>
                */}
               
                {user && (     // Only for users who are not logged in   !!!!!! 
                <Box>
                    <Button
                        component={NavLink}
                        to="/register"
                        sx={{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                            {t('register')}
                        </Box>
                    </Button>
                    <Button
                        component={NavLink}
                        to="/mastercontrol"
                        sx={{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                            {t('master_control')}
                        </Box>
                    </Button>
                    <Button
                        component={NavLink}
                        to="importexcel"
                        sx={{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                            {t('import_excel')}
                        </Box>
                    </Button>
                    <Button
                        component={NavLink}
                        to="workhours"
                        sx= {{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                                {t('work_hours')}
                            </Box>
                    </Button>

                    <Button 
                        component={NavLink}
                        to="planning"
                        sx= {{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' },
                            display: 'flex',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', fontWeight: 'bold' }}>
                            {t('Planning')}
                        </Box>
                    </Button>

                </Box>
                )}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
                <AccountCircle sx={{ color: '#071952', fontSize: 40 }} />
                {user ? (
                    <>
                        <Typography variant="body1" sx={{ color: '#071952' }}>
                            Logged in as {user}
                        </Typography>
                        <Button
                            onClick={logout}
                            sx={{
                                color: '#071952',
                                '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                            }}
                        >
                            {t('logout')}
                        </Button>
                    </>
                ) : (
                    <Button
                        component={NavLink}
                        to="/login"
                        sx={{
                            color: '#071952',
                            '&.active': { bgcolor: 'rgba(255, 255, 255, 0.2)' },
                            '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.1)' }
                        }}
                    >
                        {t('login')}
                    </Button>
                )}
                <LanguageSwitcher />
            </Box>
        </Box>
    );
};

export default Navigation;
