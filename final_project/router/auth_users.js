const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "testuser", password: "password123" }
];

// Function to check if the username is valid (exists in the users array)
const isValid = (username) => {
  return users.some(user => user.username === username);
};

// Function to check if the username and password match the records
const authenticatedUser = (username, password) => {
  // Find the user by username
  const user = users.find(user => user.username === username);
  
  // If user is found and the password matches
  return user && user.password === password;
};

const JWT_SECRET = "your_jwt_secret_key"; 

// Login route
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if the username is valid
  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username." });
  }

  // Check if the username and password match
  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid username or password." });
  }

  // Generate JWT token
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });

  // Store token in session
  req.session.authorization = { accessToken: token };

  // Send response with the token
  res.status(200).json({ message: "Login successful", token });
});

// Add or modify a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const username = req.session.username; // Retrieve username from session

  // Check if the user is authenticated
  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if review and ISBN are provided
  if (!review || !isbn) {
    return res.status(400).json({ message: "Review and ISBN are required" });
  }

  // Check if ISBN exists in books database
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review
  book.reviews[username] = review;

  // Respond with success message
  res.status(200).json({ message: "Review added/updated successfully", reviews: book.reviews });
});

regd_users.delete("/auth/delete_review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const username = req.session.username;

  if (!username) {
    return res.status(403).json({ message: "User not logged in" });
  }

  // Check if ISBN exists in books database
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for this book
  if (!book.reviews[username]) {
    return res.status(404).json({ message: "Review not found for this user" });
  }

  // Delete the user's review
  delete book.reviews[username];

  // Respond with success message
  res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
