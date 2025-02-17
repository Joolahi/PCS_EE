import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Welcome from './views/Welcome';
import Leikkaus from './views/Leikkaus';
import Painatus from './views/Painatus';
import Layout from './components/layout';
import Login from './views/Login';
import StartWork from './views/StartWork';
import Register from './views/Register';
import { AuthProvider } from './contexts/AuthContext';
import EndWork from './views/EndWork';
import WorkerDetails from './views/WorkerDetails';
import MasterControl from './views/MasterControl';
import ImportExcel from './views/ImportExcel';
import Esivalmistelu from './views/Esivalmistelu';
import Hygienia from './views/Hygienia';
import Erkoispuoli from './views/Erikoispuoli';
import Pakkaus from './views/Pakkaus';
import WorkHours from './views/WorkHours';
import ErrorView from './views/ErrorView';
import Efficiency from './views/Efficiency';
import Remmit from './views/Remmit';
import Aloite from './views/ReportViews/Aloite';
import Lomakkeet from './views/ReportViews/Lomakkeet'; 
import SafetyObservationForm from './views/ReportViews/Turvallisuushavainto';
import Poikkeama from './views/ReportViews/Poikkeama';
import DataComparisation from './views/DataComparisation';
import AllForms from './views/ReportViews/AllForms';
import FormDetails from './views/ReportViews/FormDetails';
import Press from './views/Press';
import Planning from './views/Planning';
import PlanningMasterModal from './views/PlanningMasterModal';


function App() {
  return (
    <AuthProvider>
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="leikkaus" element={<Leikkaus />} />
        <Route path="painatus" element={<Painatus />} />
        <Route path="preparation" element={<Esivalmistelu />} />
        <Route path="hygiene" element={<Hygienia />} />
        <Route path="special_side" element={<Erkoispuoli />} />
        <Route path="packaging" element={<Pakkaus />} />
        <Route path="startwork" element={<StartWork />} />
        <Route path="endwork" element={<EndWork />} />
        <Route path="workerdetails" element={<WorkerDetails />} />
        <Route path="mastercontrol" element={<MasterControl/>} />
        <Route path="importexcel" element={<ImportExcel/>} />
        <Route path="workhours" element={<WorkHours/>} />
        <Route path="error" element={<ErrorView/>} />
        <Route path="efficiency" element={<Efficiency/>} />
        <Route path="remmit" element={<Remmit/>} />
        <Route path="aloite" element={<Aloite/>} />
        <Route path="lomakkeet" element={<Lomakkeet/>} />
        <Route path="safetyobservation" element={<SafetyObservationForm/>} />
        <Route path="poikkeama" element={<Poikkeama/>}/>
        <Route path="allforms" element={<AllForms/>}/>
        <Route path="formDetails/:formType/:id" element={<FormDetails />} />
        <Route path="datacomparisation" element={<DataComparisation/>}/>
        <Route path="press" element={<Press/>}/>
        <Route path="planning" element={<Planning/> } />
      </Route>
    </Routes>
    </AuthProvider>
  );
}


export default App;
