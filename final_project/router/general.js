const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const axios = require('axios');
const public_users = express.Router();

// Check if a user with the given username already exists
const doesExist = (username) => {
  // Filter the users array for any user with the same username
  let userswithsamename = users.filter((users) => {
      return users.username === username;
  });
  // Return true if any user with the same username is found, otherwise false
  if (userswithsamename.length > 0) {
      return true;
  } else {
      return false;
  }
}

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check if both username and password are provided
  if (username && password) {
      // Check if the user does not already exist
      if (!doesExist(username)) {
          // Add the new user to the users array
          users.push({"username": username, "password": password});
          return res.status(200).json({message: "User successfully registered. Now you can login"});
      } else {
          return res.status(404).json({message: "User already exists!"});
      }
  }
  // Return error if username or password is missing
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  // Convert the books object to a neatly formatted JSON string and return it
  const booksList = JSON.stringify(books, null, 2);

  // Send the response with a status of 200 and the formatted list of books
  return res.status(200).json({ message: "List of books available in the shop:", books: books });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  // Extract the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the ISBN exists in the books object
  const book = books[isbn];

  // If the book is found, return its details
  if (book) {
    return res.status(200).json({ message: "Book details found:", book });
  } else {
    // If not found, return a 404 error
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  // Extract the author name from the request parameters
  const authorName = req.params.author.toLowerCase();

  // Initialize an array to hold books by the given author
  let booksByAuthor = [];

  // Iterate through the books object
  Object.keys(books).forEach(key => {
    // Check if the author matches the one in the request, ignoring case
    if (books[key].author.toLowerCase() === authorName) {
      booksByAuthor.push(books[key]);
    }
  });

  // If any books are found by the author, return them
  if (booksByAuthor.length > 0) {
    return res.status(200).json({ message: `Books by ${req.params.author} found:`, books: booksByAuthor });
  } else {
    // If no books are found, return a 404 response
    return res.status(404).json({ message: "No books found by the given author" });
  }
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  // Extract the title from the request parameters
  const titleName = req.params.title.toLowerCase();

  // Initialize an array to hold books with the given title
  let booksWithTitle = [];

  // Iterate through the books object
  Object.keys(books).forEach(key => {
    // Check if the title matches the one in the request, ignoring case
    if (books[key].title.toLowerCase() === titleName) {
      booksWithTitle.push(books[key]);
    }
  });

  // If any books are found with the title, return them
  if (booksWithTitle.length > 0) {
    return res.status(200).json({ message: `Books with title "${req.params.title}" found:`, books: booksWithTitle });
  } else {
    // If no books are found, return a 404 response
    return res.status(404).json({ message: "No books found with the given title" });
  }
});

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  // Extract the ISBN from the request parameters
  const isbn = req.params.isbn;

  // Check if the ISBN exists in the books object
  const book = books[isbn];

  // If the book is found, return its reviews
  if (book) {
    return res.status(200).json({ message: `Reviews for book with ISBN ${isbn}:`, reviews: book.reviews });
  } else {
    // If the book is not found, return a 404 response
    return res.status(404).json({ message: "Book not found with the given ISBN" });
  }
});

public_users.get('/books_axios', async (req, res) => {
  try {
    const response = await axios.get('http://localhost:5000/');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

public_users.get('/books/isbn_axios/:isbn', async (req, res) => {
  const { isbn } = req.params;
  
  try {

    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    
    // Send the book details as response
    res.json(response.data);
  } catch (error) {
    // Handle any errors that occur during the request
    res.status(500).json({ message: 'Error fetching book details' });
  }
});

public_users.get('/books/author_axios/:author', async (req, res) => {
  const { author } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by author' });
  }
});


public_users.get('/books/title_axios/:title', async (req, res) => {
  const { title } = req.params;
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by title' });
  }
});


module.exports.general = public_users;
