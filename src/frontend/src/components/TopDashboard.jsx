import React from "react";
import { AppBar, Toolbar, Button, Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const TopDashboard = ({ onTabChange, activeTab, userName }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode); 

  return (
    <AppBar
      position="static"
      sx={{
        background: "linear-gradient(180deg, #fde2e4 0%, #fad2e1 100%)",
        width: "100vw",
        left: 0,
        right: 0,
        '@media (max-width:430px) and (max-height:932px)': {
          width: "100vw",
        },
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "100vw", 
          px: 2,
        }}
      >
        {/* Left side: Two buttons */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            color="inherit"
            onClick={() => onTabChange("Profile")}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              mr: 2,
              minWidth: "80px",
              borderColor: activeTab === "Profile" ? colors.primary[200] : "transparent",
            }}
            variant={activeTab === "Profile" ? "outlined" : "text"}
          >
            Family
          </Button>
          <Button
            color="inherit"
            onClick={() => onTabChange("Family")}
            sx={{
              textTransform: "none",
              fontSize: "1rem",
              minWidth: "80px",
              borderColor: activeTab === "Family" ? colors.primary[200] : "transparent",
            }}
            variant={activeTab === "Family" ? "outlined" : "text"}
          >
            Pictures
          </Button>
        </Box>
        {/* Right side: Welcome message */}
        <Typography variant="h6" component="div" sx={{ color: colors.text }}>
          Welcome, {userName}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopDashboard;
