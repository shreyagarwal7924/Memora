import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { Users, UserCog } from "lucide-react";
import homeImage from "../assets/home-image.png";

const HomePage = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "linear-gradient(180deg, #fde2e4 0%, #fad2e1 100%)",
        px: 3,
      }}
    >
      <Typography variant="h4" fontWeight={600} color={theme.palette.text.primary} textAlign="center" mb={2}>
        Choose Your View
      </Typography>
      <img src={homeImage} alt="Home Illustration" style={{ width: "60%", maxWidth: 400, marginBottom: 20 }} />
      <Typography variant="h6" color={theme.palette.text.primary} textAlign="center" mb={3}>
        Select your preferred experience
      </Typography>
      <Box sx={{ display: "flex", gap: 4 }}>
        <IconButton onClick={() => navigate("/patient")} color="secondary" sx={{ height: "auto", maxWidth: "100px", fontSize: 40 }}>
          <UserCog size={50}/>
        </IconButton>
        <IconButton onClick={() => navigate("/family")} color="primary" sx={{ height: "auto", maxWidth: "100px",fontSize: 40 }}>
          <Users size={50}/>
        </IconButton>
      </Box>
    </Box>
  );
};

export default HomePage;
