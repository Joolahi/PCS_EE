import React from 'react';
import { Button, Box, ButtonGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <Box sx={{ zIndex: 1100, display: 'flex', alignItems: 'center' }}>
            <ButtonGroup
                variant="text"
                size="small"
                aria-label="Basic button group"
                sx={{
                    '& .MuiButtonGroup-grouped': {
                        borderColor: '#071952', // This ensures the border color is white
                    },
                    '& .MuiButtonGroup-grouped:not(:last-of-type)': {
                        borderRight: '1px solid #071952', // This ensures the right border is white except for the last button
                    },
                }}
            >
                <Button sx={{ color: '#071952' }} onClick={() => changeLanguage('en')}>EN</Button>
                <Button sx={{ color: '#071952' }} onClick={() => changeLanguage('fi')}>FI</Button>
                <Button sx={{ color: '#071952' }} onClick={() => changeLanguage('et')}>EE</Button>
            </ButtonGroup>
        </Box>
    );
};

export default LanguageSwitcher;
