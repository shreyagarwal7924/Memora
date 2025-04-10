// ProfileView.jsx
import React, { useState, useEffect } from "react";
import { Box, Typography, Grid, Paper } from "@mui/material";
import { styled } from "@mui/system";
import TopDashboard from "./TopDashboard"; // Import the new top dashboard
import Dashboard from "./Dashboard";

// Dummy profile data
const profileInfo = {
  patientName: "Kaleb Cole",
  familyMembers: ["Shrey Agarwal", "Aditya Bisht","Yaroslav"],
};

// A styled image component for consistency.
const StyledImage = styled("img")({
  width: "100%",
  height: "200px",
  objectFit: "cover",
  display: "block",
});

const ProfileView = () => {
  const [activeTab, setActiveTab] = useState("Profile");
  const [images, setImages] = useState([]);

  // Fetch images from the backend on mount.
  useEffect(() => {
    fetch("http://localhost:6001/images")
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch((err) => console.error("Error fetching images:", err));
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        width: "100vw", // ensure the container spans the full viewport width
        overflowX: "hidden",
      }}
    >
    <Dashboard />
      {/* Top dashboard */}
      <TopDashboard
        onTabChange={setActiveTab}
        activeTab={activeTab}
        userName={profileInfo.familyMembers[0].split(" ")[0]}
      />

      {/* Main content area */}
      <Box sx={{ p: 3 }}>
        {activeTab === "Profile" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Profile Information
            </Typography>
            {/* Patient Info */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="h6">
                Patient Name: {profileInfo.patientName}
              </Typography>
            </Paper>
            {/* Family Members Info */}
            <Paper
              elevation={3}
              sx={{
                p: 2,
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <Typography variant="h6">
                Family Members ({profileInfo.familyMembers.length})
              </Typography>
              <Box sx={{ mt: 1 }}>
                {profileInfo.familyMembers.map((member, index) => (
                  <Typography key={index} variant="body1">
                    {member}
                  </Typography>
                ))}
              </Box>
            </Paper>
          </Box>
        )}

        {activeTab === "Family" && (
          <Box>
            <Typography variant="h5" gutterBottom>
              Recently Uploaded Pictures
            </Typography>
            {images.length === 0 ? (
              <Typography variant="body1">No images to display.</Typography>
            ) : (
              <Grid container spacing={2}>
                {images.map((img) => (
                  <Grid item xs={12} sm={6} md={4} key={img.id || img.ImageUrl}>
                    <Paper
                      elevation={3}
                      sx={{
                        overflow: "hidden",
                        borderRadius: 2,
                      }}
                    >
                      <StyledImage src={img.ImageUrl} alt={img.place} />
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ProfileView;
