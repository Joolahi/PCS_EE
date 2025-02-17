import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { Box, Typography, Button, Modal} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { useTranslation } from 'react-i18next';
import image from '../assets/varit2.png'

const InfoModal = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('section1');
  const { t } = useTranslation();
  const sections = {
    section1: {
        title: t('Jononumeron käyttö'),
        content: t('jononumeron käyttö ohje'),
        content2: t("jononumeron käyttö ohje 2"),
        list1: t("jono1"),
        list2: t("jono2"),
        list3: t("jono3"),
        list4: t("jono4"),
        list5: t("jono5"),
        list6: t("jono6"),
        list7: t("jono7"),
        list8: t("jono8"),
        list9: t("jono9"),
        kuva: t("kuva"),
        picture: image,

    },
    section2: {
      title: 'Info Section 2',
      content: 'This is the content for Info Section 2.',
    },
    section3: {
      title: 'Info Section 3',
      content: 'This is the content for Info Section 3.',
    },
    section4: {
      title: 'Info Section 4',
      content: 'This is the content for Info Section 4.',
    },
  };

  const currentSection = sections[activeSection];

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 800,
    maxHeight: '90vh',
    overflowY: 'auto',
    bgcolor: 'background.paper',
    border: '2px solid',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
};

  return ReactDOM.createPortal(
    <Modal open={isOpen} onClose={onClose}>
      <Box sx={style}>
      <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="contained"
            color="info"
            onClick={() => setActiveSection('section1')}
          >
            {t('Jononumeron käyttö')}
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => setActiveSection('section2')}
          >
            Section 2
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => setActiveSection('section3')}
          >
            Section 3
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => setActiveSection('section4')}
          >
            Section 4
          </Button>
        </Box>
        <Box sx={{ position: 'absolute', right: 4, top: 4 }}>
          <IconButton color="error" onClick={onClose}>
            x
          </IconButton>
        </Box>
        <Typography variant="h6" component="h2" sx={{ mt: 5, color: "#071952"}}>
          {currentSection.title}
        </Typography>
        <Typography sx={{ mt: 2, color: "#071952" }}>
          {currentSection.content}
        </Typography>
        <Typography sx={{ mt: 2, color: "#071952" }}>
            {currentSection.content2}
        </Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list1}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list2}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list3}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list4}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list5}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list6}</Typography>
        <Typography sx={{ color: "#071952"}}> {currentSection.list7}</Typography>
        <Typography variant="h6" component="h2" sx={{ color: "#071952", mt: 5}}> {currentSection.kuva}</Typography>
        <img src={currentSection.picture} alt="Color-Codes" style={{maxHeight: 500, maxWidth: 750}}/>
      </Box>
    </Modal>,
    document.getElementById('modal-root') // Ensure modal-root exists
  );
};

export default InfoModal;
