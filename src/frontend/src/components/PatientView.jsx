import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button } from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";

// Mock feed data:
const mockFeed = [
  {
    id: 1,
    image:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&auto=format&fit=crop",
    caption: "Family picnic at the park",
    date: "2023-06-15",
    tags: {
      people: ["Alice", "John", "Sarah"],
      places: ["Park"],
      events: ["Picnic"],
    },
  },
  {
    id: 2,
    image:
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format&fit=crop",
    caption: "Birthday celebration",
    date: "2023-07-20",
    tags: {
      people: ["Emily", "David"],
      places: ["Home"],
      events: ["60th Birthday"],
    },
  },
  {
    id: 3,
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop",
    caption: "Summer vacation at the beach",
    date: "2023-08-10",
    tags: {
      people: ["Alice", "Bob"],
      places: ["Beach"],
      events: ["Vacation"],
    },
  },
  {
    id: 4,
    image:
      "https://images.unsplash.com/photo-1609220136736-443140cffec6?w=800&auto=format&fit=crop",
    caption: "Family picnic at the park",
    date: "2023-06-15",
    tags: {
      people: ["Alice", "John", "Sarah"],
      places: ["Park"],
      events: ["Picnic"],
    },
  },
  {
    id: 5,
    image:
      "https://images.unsplash.com/photo-1478145046317-39f10e56b5e9?w=800&auto=format&fit=crop",
    caption: "Birthday celebration",
    date: "2023-07-20",
    tags: {
      people: ["Emily", "David"],
      places: ["Home"],
      events: ["60th Birthday"],
    },
  },
  {
    id: 6,
    image:
      "https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=800&auto=format&fit=crop",
    caption: "Summer vacation at the beach",
    date: "2023-08-10",
    tags: {
      people: ["Alice", "Bob"],
      places: ["Beach"],
      events: ["Vacation"],
    },
  },
];

const PatientView = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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
      container.addEventListener("wheel", handleScroll, { passive: false });
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleScroll);
      }
    };
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex === 3) {
      // Show quiz after scrolling to the fourth image
      const questions = generateQuiz(mockFeed[currentIndex]);
      setQuizQuestions(questions);
      setShowQuiz(true);
      setCurrentQuestionIndex(0); // Reset question index when quiz is shown
    } else {
      setShowQuiz(false);
    }
  }, [currentIndex]);

  function generateQuiz(imageData) {
    const questions = [];

    // People Questions
    imageData.tags.people.forEach((person) => {
      questions.push({
        question: `Who is this? ${person}?`,
        correctAnswer: person,
        options: shuffle([
          person,
          ...generateRandomOptions(imageData.tags.people, 2),
        ]),
      });
    });

    // Places Questions
    imageData.tags.places.forEach((place) => {
      questions.push({
        question: `Where is this place?`,
        correctAnswer: place,
        options: shuffle([
          place,
          ...generateRandomOptions(imageData.tags.places, 3),
        ]),
      });
    });

    // Events Questions
    imageData.tags.events.forEach((event) => {
      questions.push({
        question: `What event is this?`,
        correctAnswer: event,
        options: shuffle([
          event,
          ...generateRandomOptions(imageData.tags.events, 3),
        ]),
      });
    });

    return questions;
  }

  // Helper function to generate random options (avoiding duplicates)
  function generateRandomOptions(tagArray, numOptions) {
    const otherOptions = tagArray.filter((item) => !tagArray.includes(item));
    const shuffled = [...otherOptions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numOptions);
  }

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  const handleCloseQuiz = () => {
    setShowQuiz(false);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Optionally, handle end of quiz (e.g., show results)
      handleCloseQuiz();
    }
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        position: "relative",
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
            height: "100vh",
            width: "100vw",
            position: "absolute",
            top: 0,
            left: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={item.image}
            alt={item.caption}
            style={{
              width: "100vw",
              height: "100vh",
              objectFit: "cover",
              position: "absolute",
              top: 0,
              left: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: 40,
              left: 20,
              right: 20,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              color: "white",
              padding: "10px 15px",
              borderRadius: "8px",
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
          position: "fixed",
          bottom: 20,
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          color: "white",
          padding: "8px 12px",
          borderRadius: "20px",
          display: currentIndex < mockFeed.length - 1 ? "flex" : "none",
          alignItems: "center",
        }}
      >
        <Typography variant="body2">Scroll Down</Typography>
        <ArrowDownward sx={{ ml: 1, fontSize: "1rem" }} />
      </Box>

      {/* Quiz Overlay */}
      {showQuiz && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.8)", // Semi-transparent background
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 10, // Ensure it's on top
          }}
        >
          <Typography variant="h5" color="white" mb={2}>
            Quiz Time!
          </Typography>

          {/* Display current question */}
          {quizQuestions.length > 0 && (
            <Box key={currentQuestionIndex} mb={2}>
              <Typography variant="subtitle1" color="white">
                {quizQuestions[currentQuestionIndex].question}
              </Typography>
              {quizQuestions[currentQuestionIndex].options.map((option) => (
                <Button key={option} variant="contained" sx={{ mr: 1 }}>
                  {option}
                </Button>
              ))}
            </Box>
          )}

          <Box>
            <Button
              variant="contained"
              onClick={handleNextQuestion}
              disabled={quizQuestions.length === 0}
            >
              {currentQuestionIndex === quizQuestions.length - 1
                ? "Finish Quiz"
                : "Next Question"}
            </Button>
            <Button
              variant="contained"
              onClick={handleCloseQuiz}
              sx={{ ml: 2 }}
            >
              Close Quiz
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default PatientView;
