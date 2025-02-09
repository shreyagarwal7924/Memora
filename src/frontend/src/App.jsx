import React, { useState } from 'react';
import { Users, UserCog } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import FamilyView from './components/FamilyView';
import PatientView from './components/PatientView';
import ProfileView from './components/ProfileView';
import { useMode, ColorModeContext } from './theme';

function HomePage({ viewMode, onViewChange }) {
  const navigate = useNavigate();
  
  const handleViewChange = (mode) => {
    onViewChange(mode);
    navigate(mode === 'patient' ? '/patient' : '/family');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 bg-gray-100">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Select View Mode
      </h1>
      <div className="flex gap-8">
        <button
          onClick={() => handleViewChange('patient')}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all duration-300
            ${viewMode === 'patient' 
              ? 'bg-blue-500 text-white' 
              : 'bg-white text-gray-800 border-2 border-blue-500'
            }`}
        >
          <UserCog size={24} />
          Patient View
        </button>
        <button
          onClick={() => handleViewChange('family')}
          className={`flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all duration-300
            ${viewMode === 'family' 
              ? 'bg-green-500 text-white' 
              : 'bg-white text-gray-800 border-2 border-green-500'
            }`}
        >
          <Users size={24} />
          Family View
        </button>
      </div>
    </div>
  );
}

function App() {
  const [viewMode, setViewMode] = useState('patient');
  const [theme, colorMode] = useMode();

  const AppRoutes = () => (
    <Routes>
      <Route path="/" element={<HomePage viewMode={viewMode} onViewChange={setViewMode} />} />
      <Route path="/patient" element={<PatientView />} />
      <Route path="/family" element={<FamilyView />} />
      <Route path="/profile" element={<ProfileView />} />
    </Routes>
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;