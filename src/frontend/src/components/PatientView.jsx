import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Box, Typography, Chip } from "@mui/material";
import { ArrowDownward } from "@mui/icons-material";
import QuizOverlay from "./QuizOverlay"; // Adjust the import path as needed

const PatientView = () => {
  // State for images, current image index, and scrolling lock
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef(null);
  const isScrolling = useRef(false);

  // Quiz state (for overlay display)
  const [quizOverlayVisible, setQuizOverlayVisible] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // New state: track quiz results and completed indices
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [quizCompletedIndices, setQuizCompletedIndices] = useState([]);

  // New: Store quiz data extracted from images
  const [quizList, setQuizList] = useState([]);

  // ---------------------------------
  // Fetch images from backend on mount
  // ---------------------------------
  useEffect(() => {
    fetch("http://localhost:6001/images")
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch((err) => console.error("Error fetching images:", err));
  }, []);

  // ---------------------------------
  // Build quiz list from images
  // ---------------------------------
  useEffect(() => {
    if (images.length > 0) {
      const list = images.map((item) => {
        // Extract people names from tags where type === "person"
        const people =
          item.tags && Array.isArray(item.tags)
            ? item.tags.filter((tag) => tag.type === "person").map((tag) => tag.name)
            : [];
        return {
          imageUrl: item.ImageUrl,
          place: item.place || "",
          time: item.time || "",
          people,
        };
      });
      setQuizList(list);
      console.log("Quiz List:", list);
    }
  }, [images]);

  // ---------------------------------
  // Scroll event handler for feed navigation
  // ---------------------------------
  useEffect(() => {
    const handleScroll = (event) => {
      // Prevent default scroll behavior and block if quiz overlay is visible
      event.preventDefault();
      if (isScrolling.current || quizOverlayVisible) return;
      isScrolling.current = true;
      const deltaY = event.deltaY;
      if (deltaY > 0 && currentIndex < images.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else if (deltaY < 0 && currentIndex > 0) {
        setCurrentIndex((prev) => prev - 1);
      }
      // Lock scrolling briefly to avoid rapid changes
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
  }, [currentIndex, images, quizOverlayVisible]);

  // ---------------------------------
  // Show quiz overlay after every 4 scrolls (if quiz for that image hasn't been completed)
  // ---------------------------------
  useEffect(() => {
    if (
      (currentIndex + 1) % 4 === 0 &&
      quizList.length > currentIndex &&
      !quizCompletedIndices.includes(currentIndex)
    ) {
      const currentQuizData = quizList[currentIndex];
      const correctAnswer = currentQuizData.place;

      // Gather places from other images
      const allOtherPlaces = quizList
        .filter((q, idx) => idx !== currentIndex)
        .map((q) => q.place);
      // Get unique values (excluding the correct answer)
      const uniqueOtherPlaces = Array.from(new Set(allOtherPlaces)).filter(
        (place) => place.trim() !== "" && place !== correctAnswer
      );

      // Helper: get N random elements from an array
      const getRandomElements = (array, count) => {
        const arr = array.slice();
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr.slice(0, count);
      };

      const wrongOptions = getRandomElements(uniqueOtherPlaces, 3);
      let options = [correctAnswer, ...wrongOptions];
      // Shuffle the options
      for (let i = options.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [options[i], options[j]] = [options[j], options[i]];
      }

      const question = {
        question: "What is the place of this image?",
        options,
        correctAnswer,
      };

      setQuizQuestion(question);
      setQuizOverlayVisible(true);
    } else {
      setQuizOverlayVisible(false);
      setQuizQuestion(null);
      setSelectedAnswer(null);
      setFeedback(null);
    }
  }, [currentIndex, quizList, quizCompletedIndices]);

  // ---------------------------------
  // Quiz handlers
  // ---------------------------------
  const handleSelectAnswer = (option) => {
    setSelectedAnswer(option);
  };

  const handleSubmitAnswer = () => {
    if (!quizQuestion) return;
    if (selectedAnswer === quizQuestion.correctAnswer) {
      setFeedback("Correct!");
      setCorrectCount((prev) => prev + 1);
    } else {
      setFeedback("Incorrect!");
      setWrongCount((prev) => prev + 1);
    }
    setTimeout(() => {
      setQuizOverlayVisible(false);
      setQuizQuestion(null);
      setSelectedAnswer(null);
      setFeedback(null);
      setQuizCompletedIndices((prev) => [...prev, currentIndex]);
    }, 2000);
  };

  if (images.length === 0) {
    return <div>Loading images...</div>;
  }

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
      {/* Scoreboard using Chip components */}
      <Box
        sx={{
          position: "fixed",
          top: 10,
          right: 10,
          display: "flex",
          gap: 1,
          zIndex: 30,
        }}
      >
        <Chip
          label={`Correct: ${correctCount}`}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            fontWeight: "bold",
          }}
        />
        <Chip
          label={`Wrong: ${wrongCount}`}
          sx={{
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            color: "white",
            fontWeight: "bold",
          }}
        />
      </Box>

      {images.map((item, index) => (
        <motion.div
          key={item.id || index}
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
          {/* Image container */}
          <Box sx={{ position: "relative", width: "100vw", height: "100vh" }}>
            <img
              src={item.ImageUrl}
              alt={`${item.place} - ${item.time}`}
              style={{
                width: "100vw",
                height: "100vh",
                objectFit: "cover",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            {/* Render tag markers on top of the image */}
            {item.tags &&
              Array.isArray(item.tags) &&
              item.tags.map((tag, idx) => (
                <div
                   key={idx}
                   style={{
                   position: "absolute",
                   left: `${tag.x}%`,
                   top: `${tag.y}%`,
                   transform: "translate(-50%, -50%)",
                   backgroundColor: "rgba(0, 0, 0, 0.9)", // Darker black background
                   color: "#fff",                        // Pure white font
                   padding: "2px 4px",
                   fontSize: "12px",
                   fontWeight: "bold",                    // Bolder text
                   borderRadius: "3px",
                  }}
>
      {tag.name}
</div>

              ))}
            {/* Display extra image details as an Instagram-like tag */}
            <Box
              sx={{
                position: "absolute",
                bottom: 40,
                left: 20,
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                color: "white",
                padding: "5px 10px",
                borderRadius: "20px",
                border: "1px solid rgba(255,255,255,0.3)",
              }}
            >
              <Typography variant="body1" sx={{ fontWeight: "bold", mr: 1 }}>
                {item.place}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: "bold", mr: 1 }}>
                {item.time}
              </Typography>
              {item.tags && (
                <Typography variant="body2" sx={{ opacity: 0.8, fontWeight: "bold" }}>
                  {item.tags
                    .filter((tag) => tag.type === "person")
                    .map((tag) => tag.name)
                    .join(", ")}
                </Typography>
              )}
            </Box>
          </Box>
        </motion.div>
      ))}

      {/* Scroll indicator */}
      {currentIndex < images.length - 1 && (
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

      {/* Quiz overlay: appears when quizOverlayVisible is true */}
      {quizOverlayVisible && quizQuestion && (
        <QuizOverlay
          quizQuestion={quizQuestion}
          selectedAnswer={selectedAnswer}
          feedback={feedback}
          handleSelectAnswer={handleSelectAnswer}
          handleSubmitAnswer={handleSubmitAnswer}
        />
      )}
    </Box>
  );
};

export default PatientView;
