import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Box, Typography } from '@mui/material';
import { ArrowDownward } from '@mui/icons-material';

// Mock feed data:
const mockFeed = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&auto=format&fit=crop',
    caption: 'Family picnic at the park',
    date: '2023-06-15',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format&fit=crop',
    caption: 'Birthday celebration',
    date: '2023-07-20',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop',
    caption: 'Summer vacation at the beach',
    date: '2023-08-10',
  },
];

const PatientView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  useEffect(() => {
    const handleScroll = (event) => {
      if (isScrolling.current) return;

      event.preventDefault();
      isScrolling.current = true;

      // Detect scroll direction
      const deltaY = event.deltaY || -event.detail || event.wheelDelta;

      if (deltaY > 0 && currentIndex < mockFeed.length - 1) {
        setCurrentIndex((prev) => prev + 1); // Scroll Down
      } else if (deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1); // Scroll Up
      }

      // Lock scrolling for 800ms to prevent multiple scrolls at once
      setTimeout(() => {
        isScrolling.current = false;
      }, 1000);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleScroll, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener('wheel', handleScroll);
      }
    };
  }, [currentIndex]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {mockFeed.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{
            opacity: index === currentIndex ? 1 : 0,
            scale: index === currentIndex ? 1 : 0.9,
          }}
          transition={{ duration: 0.5 }}
          style={{
            height: '100vh',
            width: '100vw',
            position: 'absolute',
            top: 0,
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <img
            src={item.image}
            alt={item.caption}
            style={{
              width: '100vw',
              height: '100vh',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: 40,
              left: 20,
              right: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '8px',
            }}
          >
            <Typography variant="h6">{item.caption}</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {item.date}
            </Typography>
          </Box>
        </motion.div>
      ))}

      {/* Scroll Indicator */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '20px',
          display: currentIndex < mockFeed.length - 1 ? 'flex' : 'none',
          alignItems: 'center',
        }}
      >
        <Typography variant="body2">Scroll Down</Typography>
        <ArrowDownward sx={{ ml: 1, fontSize: '1rem' }} />
      </Box>
    </Box>
  );
};

export default PatientView;
