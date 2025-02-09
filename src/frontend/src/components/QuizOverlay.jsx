import React from 'react';
import { Box, Button, Typography, Paper } from "@mui/material";

const QuizOverlay = ({
  quizQuestion,
  selectedAnswer,
  feedback,
  handleSelectAnswer,
  handleSubmitAnswer
}) => {
  if (!quizQuestion) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
        width: "90%",
        maxWidth: 350,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          p: 3,
          background: 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          borderRadius: '15px',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        }}
      >
        <Typography variant="h6" gutterBottom sx={{ color: 'rgba(0, 0, 0, 0.87)', textAlign: 'center' }}>
          {quizQuestion.question}
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            mb: 2,
          }}
        >
          {quizQuestion.options.map((option) => (
            <Button
              key={option}
              variant={selectedAnswer === option ? "contained" : "outlined"}
              onClick={() => handleSelectAnswer(option)}
              sx={{
                backgroundColor: selectedAnswer === option 
                  ? 'rgba(25, 118, 210, 0.7)' 
                  : 'rgba(255, 255, 255, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                color: selectedAnswer === option ? '#fff' : 'rgba(0, 0, 0, 0.87)',
                '&:hover': {
                  backgroundColor: selectedAnswer === option 
                    ? 'rgba(25, 118, 210, 0.8)' 
                    : 'rgba(255, 255, 255, 0.6)',
                },
                backdropFilter: 'blur(4px)',
                height: '44px',
                padding: '6px',
                fontSize: '0.9rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {option}
            </Button>
          ))}
        </Box>
        {feedback && (
          <Typography
            variant="body2"
            color={feedback === "Correct!" ? "green" : "red"}
            sx={{ mb: 2, textAlign: 'center' }}
          >
            {feedback}
          </Typography>
        )}
        <Button
          variant="contained"
          onClick={handleSubmitAnswer}
          disabled={selectedAnswer === null}
          fullWidth
          sx={{
            backgroundColor: 'rgba(25, 118, 210, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.8)',
            },
            backdropFilter: 'blur(4px)',
          }}
        >
          Submit Answer
        </Button>
      </Paper>
    </Box>
  );
};

export default QuizOverlay;