import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import memoraLogo from "../assets/memora-logo.png";
import onboardingImage from "../assets/onboarding.png";

const OnboardingScreens = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        width: "100vw",
        height: "100vh",
        scrollbarWidth: "none",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "100vw",
          height: "100vh",
          background: "linear-gradient(180deg, #fde2e4 0%, #fad2e1 100%)",
          scrollSnapAlign: "start",
        }}
      >
        <img src={memoraLogo} alt="Memora Logo" style={{ width: "70%", maxWidth: 300, marginBottom: 20 }} />
        <Typography variant="h3" fontWeight={700} color={theme.palette.primary.main} textAlign="center">
          MEMORA
        </Typography>
        <Typography variant="h5" color={theme.palette.text.primary} textAlign="center" mt={1}>
          Because Every Memory Is Worth Holding Onto
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minWidth: "100vw",
          height: "100vh",
          background: "linear-gradient(180deg, #fde2e4 0%, #fad2e1 100%)",
          scrollSnapAlign: "start",
        }}
      >
        <img src={onboardingImage} alt="Onboarding Clipart" style={{ width: "90%", maxWidth: 450, marginBottom: 20 }} />
        <Typography variant="h5" color={theme.palette.text.primary} textAlign="center">
          Memora helps Alzheimer’s patients and their families store and revisit precious memories.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 4, borderRadius: 8 }}
          onClick={() => navigate("/HomePage")}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default OnboardingScreens;
