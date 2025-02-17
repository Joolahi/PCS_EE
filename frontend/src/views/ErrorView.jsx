import React, { useState } from 'react';
import {
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    TextField,
    OutlinedInput,
    Modal
} from '@mui/material';
import {useTranslation} from 'react-i18next';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';

const ErrorView = ({open, onClose}) => {
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [disruptionReason, setDisruptionReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [openCheck, setOpenCheck] = useState(false);
    const { t } = useTranslation();

    const disruptionReasons = [
        'machineBreakdown',
        'materialError',
        'lackOfMaterial',
        'incompleteInformation',
        'errorWorkInstruction',
        'lostMaterial',
        'waitingParts',
        'missingTools',
        'brokenNeedle',
        'workplaceContamination',
        'workAccident',
        'emergencyExit',
        'other'
    ]

    const handleDisruptionReasonChange = (event) => {
        setDisruptionReason(event.target.value);
    };

    const handleCustomReasonChange = (event) => {
        setCustomReason(event.target.value);
    };

    const handleHoursChange = (event) => {
        setHours(event.target.value);
    };

    const handleMinutesChange = (event) => {
        setMinutes(event.target.value);
    };
    
    const handleOpenCheck = async() => {
        setOpenCheck(true);
    }

    const handleCloseCheck = () => {
        setOpenCheck(false);
    }

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Typography variant="h5" component="div">
                <ReportProblemIcon sx={{color: 'rgba(247, 196, 4, 0.8)'}}/> {t('errorTitle')}   <ReportProblemIcon sx={{color: 'rgba(247, 196, 4, 0.8)'}}/>
                </Typography>
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    {t('disruptionReasonPrompt')}
                </Typography>
                <FormControl fullWidth margin="normal" variant="outlined">
                    <InputLabel id="disruption-reason-label">
                        {t('disruptionReasonLabel')}
                    </InputLabel>
                    <Select
                        labelId="disruption-reason-label"
                        value={disruptionReason}
                        onChange={handleDisruptionReasonChange}
                        input={<OutlinedInput label={t('disruptionReasonLabel')} />} // Ensures label behaves correctly
                    >
                        {disruptionReasons.map((reasonItem, index) => (
                            <MenuItem key={index} value={reasonItem}>
                                {t(`disruptionReasons.${reasonItem}`)}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                {disruptionReason === 'other' && (
                    <TextField
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        label={t('customReasonLabel')}
                        value={customReason}
                        onChange={handleCustomReasonChange}
                    />
                )}
            </DialogContent>
            <DialogContent sx={{ pb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                    {t('disruptionTime')}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel id="hours-label">
                                {t('disruptionHours')}
                            </InputLabel>
                            <Select
                                labelId="hours-label"
                                value={hours}
                                onChange={handleHoursChange}
                                input={<OutlinedInput label={t('disruptionHours')} />} // Ensures label behaves correctly
                            >
                                {[...Array(24).keys()].map((hour) => (
                                    <MenuItem key={hour} value={hour}>
                                        {hour}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                        <FormControl fullWidth margin="normal" variant="outlined">
                            <InputLabel id="minutes-label">
                                {t('disruptionMinutes')}
                            </InputLabel>
                            <Select
                                labelId="minutes-label"
                                value={minutes}
                                onChange={handleMinutesChange}
                                input={<OutlinedInput label={t('disruptionMinutes')} />} // Ensures label behaves correctly
                            >
                                {[...Array(60).keys()].map((minute) => (
                                    <MenuItem key={minute} value={minute}>
                                        {minute}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => handleOpenCheck()}
                >
                    {t('disruptionSubmit')}
                </Button>
                <Button variant="outlined" color="secondary" onClick={onClose}>
                    {t('disruptionCancel')}
                </Button>
            </DialogActions>
            <Modal
                open={openCheck}
                onClose={handleCloseCheck}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <div
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: 400,
                        backgroundColor: 'white',
                        border: '2px solid #000',
                        boxShadow: 24,
                        padding: '16px',
                    }}
                >
                    <Typography id="modal-modal-title" variant="h6" component="h2">
                        {t('confirmDisruption')}
                    </Typography>
                    <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                        {t('areYouSureSubmit')}
                    </Typography>
                    <DialogActions>
                        <Button onClick={handleCloseCheck}>{t('cancel')}</Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => {
                                // You can perform the submit action here
                                setOpenCheck(false);
                                onClose(); // You can also close the main dialog if needed
                            }}
                        >
                            {t('confirm')}
                        </Button>
                    </DialogActions>
                </div>
            </Modal>
        </Dialog>
    );
}

export default ErrorView;
