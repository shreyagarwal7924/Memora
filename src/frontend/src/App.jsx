import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import FamilyView from "./components/FamilyView";
import PatientView from "./components/PatientView";
import ProfileView from "./components/ProfileView";
import { useMode, ColorModeContext } from "./theme";
import OnboardingScreens from "./components/OnboardingScreens";
import HomePage from "./components/HomePage";

const App = () => {
  const [theme, colorMode] = useMode();
  
  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/" element={<OnboardingScreens />} />
            <Route path='/HomePage' element={<HomePage />} />
            <Route path="/patient" element={<PatientView />} />
            <Route path="/family" element={<FamilyView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export default App;
