const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Listen on port 3000
const PORT = 3000;

// Generate a random secret token and two random numbers between 1 and 100
function generateChallenge() {
  const token = Math.random().toString(36).substring(7);
  const num1 = Math.floor(Math.random() * 100) + 1;
  const num2 = Math.floor(Math.random() * 100) + 1;
  return {
    token: token,
    num1: num1,
    num2: num2
  };
}

// Keep track of the current challenge and answer
let challenge = generateChallenge();
let answer = challenge.num1 + challenge.num2;

// In-memory storage for tokens
const tokens = {};

// Handle GET requests to /challenge
app.get('/challenge', (req, res) => {
  // Generate a new challenge and answer
  challenge = generateChallenge();
  answer = challenge.num1 + challenge.num2;

  // Generate a new token and store it in the in-memory storage
  const token = Math.random().toString(36).substring(7);
  tokens[token] = {
    answer: answer,
    expires: Date.now() + 5 * 60 * 1000 // expire in 5 minutes
  };

  // Send the challenge and token to the client
  res.send({
    token: token,
    num1: challenge.num1,
    num2: challenge.num2
  });
});

// Handle POST requests to /deploy
app.post('/deploy', (req, res) => {
  // Parse the request body to get the submitted token and answer
  const { token, answer: submittedAnswer } = req.body;
  // Look up the token in the in-memory storage
  const storedToken = tokens[token];

  // Check if the token is valid and not expired
  if (storedToken && storedToken.expires > Date.now()) {
    // Check if the submitted answer is correct
    if (parseInt(submittedAnswer) === storedToken.answer) {
      // If the answer is correct, send a success message
      res.send('OK');
    } else {
      // If the answer is incorrect, send an error message
      res.status(400).send('Incorrect answer');
    }
  } else {
    // If the token is invalid or expired, send an error message
    res.status(400).send('Invalid or expired token');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

