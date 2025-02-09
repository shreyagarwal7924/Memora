import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Button, Paper } from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
// (Optionally, import axios if you use it for real API calls)
// import axios from "axios";

// ---------------------------------------------------------------------
// MOCK FEED DATA
// ---------------------------------------------------------------------
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
      "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhBDMLX6I97GJI6rPoTILUs7bfMJRV1iTxFC8TvZWTUq6f3_NkGV2QdCqdr1LdtlR8YRr8oDGON2XbDA2ABKN9OJiN8fzCPTgFdKt4Jx6eMeA4o6jCBfYiICZVhelZ4eP3RzhAcPHUXI5tsdAiWFudIG51JQiDpOLAebq5CcPcmUw3sxwUahHbMUj_u3g/s1801/IMG_4748.jpeg",
    caption: "Family.",
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
      "https://www.kohphoto.com/wp-content/uploads/2019/12/U00A0103-1.jpg",
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
      "https://i.ytimg.com/vi/4PpCRsvlMiY/maxresdefault.jpg",
    caption: "Summer vacation at the beach",
    date: "2023-08-10",
    tags: {
      people: ["Alice", "Bob"],
      places: ["Beach"],
      events: ["Vacation"],
    },
  },
  {
    id: 7,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-NkcceqngBjtG0giIKl4iTgR1HQmzfn8o095xewc5NNVm6XqYKl3gsxZ5t_hKNDRUc90&usqp=CAU",
    caption: "Family dinner",
    date: "2023-08-21",
    tags: {
        people: ["Alice", "Bob"],
        places: ["Home"],
        events: ["Dinner"]
    }
  }
];

// ---------------------------------------------------------------------
// UTILITY FUNCTIONS
// ---------------------------------------------------------------------
// A simple shuffle helper (in-place)
function shuffle(array) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

/**
 * Generates a single quiz question based on the image's tags.
 * Chooses one random category (people/places/events) and selects a random correct answer.
 * Then it builds four options (one correct, three others drawn from a predefined list).
 */
function generateSingleQuiz(imageData) {
  // Choose a random tag type among those available.
  const tagTypes = Object.keys(imageData.tags).filter(
    (key) => imageData.tags[key] && imageData.tags[key].length > 0
  );
  const randomTagType =
    tagTypes[Math.floor(Math.random() * tagTypes.length)];
  const tagValues = imageData.tags[randomTagType];
  const correctAnswer =
    tagValues[Math.floor(Math.random() * tagValues.length)];

  let questionText;
  if (randomTagType === "people") {
    questionText = "Who is this person?";
  } else if (randomTagType === "places") {
    questionText = "Where is this place?";
  } else if (randomTagType === "events") {
    questionText = "What event is this?";
  }

  // Predefined sample options for each category.
  const sampleOptions = {
    people: ["Alice", "John", "Sarah", "Emily", "David", "Bob", "Michael", "Anna"],
    places: ["Park", "Home", "Beach", "Restaurant", "Museum", "Office"],
    events: ["Picnic", "60th Birthday", "Vacation", "Concert", "Festival", "Meeting"],
  };

  let options = [correctAnswer];
  const incorrectOptions = sampleOptions[randomTagType].filter(
    (opt) => opt !== correctAnswer
  );
  shuffle(incorrectOptions);
  options = options.concat(incorrectOptions.slice(0, 3));
  options = shuffle(options);
  return { question: questionText, correctAnswer, options };
}

// ---------------------------------------------------------------------
// PATIENT VIEW COMPONENT
// ---------------------------------------------------------------------
const PatientView = () => {
  // currentIndex controls which feed item is visible
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  // -----------------------
  // QUIZ STATE
  // -----------------------
  // showQuiz determines if the quiz overlay is visible
  const [showQuiz, setShowQuiz] = useState(false);
  // quizQuestion holds the current quiz (question, correct answer, options)
  const [quizQuestion, setQuizQuestion] = useState(null);
  // selectedAnswer holds the user’s current selection
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  // feedback holds a message if the answer was incorrect (or could be used to celebrate success)
  const [feedback, setFeedback] = useState("");
  // Track which quiz groups have been answered so that the same quiz is not re-triggered.
  // We group images in batches of 3. (Group 0 = images 0–2, Group 1 = images 3–5, etc.)
  const [answeredQuizGroups, setAnsweredQuizGroups] = useState([]);

  // -------------------------------------------------------------------
  // TRIGGER THE QUIZ: whenever currentIndex hits a multiple of 3 (and not 0),
  // trigger a quiz if that group hasn’t already been answered.
  // In this example, we base the quiz question on the last image of the previous group.
  // -------------------------------------------------------------------
  useEffect(() => {
    if (currentIndex > 0 && currentIndex % 3 === 0) {
      const quizGroupIndex = currentIndex / 3 - 1;
      if (!answeredQuizGroups.includes(quizGroupIndex)) {
        const imageData = mockFeed[currentIndex - 1];
        const quiz = generateSingleQuiz(imageData);
        setQuizQuestion(quiz);
        setShowQuiz(true);
        setSelectedAnswer(null);
        setFeedback("");
      }
    } else {
      setShowQuiz(false);
    }
  }, [currentIndex, answeredQuizGroups]);

  // -------------------------------------------------------------------
  // SCROLL EVENT HANDLER
  // -------------------------------------------------------------------
  useEffect(() => {
    const handleScroll = (event) => {
      // If the quiz is active, block any scrolling
      if (showQuiz) {
        event.preventDefault();
        return;
      }
      if (isScrolling.current) return;

      event.preventDefault();
      isScrolling.current = true;

      // Determine scroll direction.
      const deltaY = event.deltaY || -event.detail || event.wheelDelta;
      if (deltaY > 0 && currentIndex < mockFeed.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }

      // Lock scrolling for a moment.
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
  }, [currentIndex, showQuiz]);

  // -------------------------------------------------------------------
  // HANDLERS FOR THE QUIZ
  // -------------------------------------------------------------------
  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);
    setFeedback("");
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    if (selectedAnswer === quizQuestion.correctAnswer) {
      // Mark the quiz for this group as answered.
      const quizGroupIndex = currentIndex / 3 - 1;
      setAnsweredQuizGroups((prev) => [...prev, quizGroupIndex]);
      setShowQuiz(false);
      setQuizQuestion(null);
      setFeedback("Correct!");
    } else {
      setFeedback("Incorrect. Please try again.");
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
      {/* -----------------------------------------------------------------
          IMAGE FEED: each image is absolutely positioned; only the
          currentIndex image is visible.
      ----------------------------------------------------------------- */}
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

      {/* -----------------------------------------------------------------
          SCROLL INDICATOR (only if not at the end and no quiz is active)
      ----------------------------------------------------------------- */}
      {!showQuiz && currentIndex < mockFeed.length - 1 && (
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
            display: "flex",
            alignItems: "center",
          }}
        >
          <Typography variant="body2">Scroll Down</Typography>
          <ArrowDownward sx={{ ml: 1, fontSize: "1rem" }} />
        </Box>
      )}

      {/* -----------------------------------------------------------------
          QUIZ OVERLAY: appears when showQuiz is true.
          The overlay is a semi-transparent dark layer with a centered Paper
          card that shows the quiz question and options.
      ----------------------------------------------------------------- */}
      {showQuiz && quizQuestion && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.85)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 20,
            p: 2,
          }}
        >
          <Paper elevation={6} sx={{ p: 4, maxWidth: 400, textAlign: "center" }}>
            <Typography variant="h5" gutterBottom>
              Quiz Time!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              {quizQuestion.question}
            </Typography>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1,
                mb: 2,
              }}
            >
              {quizQuestion.options.map((option) => (
                <Button
                  key={option}
                  variant={
                    selectedAnswer === option ? "contained" : "outlined"
                  }
                  onClick={() => handleSelectAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </Box>
            {feedback && (
              <Typography
                variant="body2"
                color={feedback === "Correct!" ? "green" : "red"}
                sx={{ mb: 2 }}
              >
                {feedback}
              </Typography>
            )}
            <Button
              variant="contained"
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              fullWidth
            >
              Submit Answer
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default PatientView;
