const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios')


public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (username && password) {
        if (!isValid(username)) {
            users.push({ "username": username, "password": password })
            return res.status(200).json({ messsage: "User successfully registered.Now you can login" })
        }
        else {
            return res.status(404).json({ message: "User already exists!" });
        }
    }

    return res.status(404).json({ message: "unable to register" })
});




// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
        setTimeout(() => {
            res.status(200).json({ books: books })
        }, 1000)
    } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
})

// Get book details based on isbn

public_users.get("/isbn/:isbn", function (req, res) {
    const { isbn } = req.params;

    // Create a function that returns a Promise to search for a book by ISBN
    const searchByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
            // Simulate a delay 
            setTimeout(() => {
                const book = books[isbn];
                if (book) {
                    resolve(book);
                } else {
                    reject({ message: "Book not found" });
                }
            }, 1000); // Simulated delay of 1 second
        });
    };

    // Use the Promise to search for the book by ISBN
    searchByISBN(isbn)
        .then((book) => {
            res.json(book);
        })
        .catch((error) => {
            res.status(404).json(error);
        });
});



// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
    try {
        let index;
        const author = req.params.author;

        // Simulate an asynchronous operation 
        // You can use setTimeout to simulate the delay in fetching data
        const searchByAuthor = new Promise((resolve, reject) => {
            setTimeout(() => {
                const authorBooks = Object.values(books).filter((book) => book.author === author);
                for (const key in books) {
                    if (books[key].author == authorBooks[0].author) {
                        index = key;
                        break;
                    }
                }

                if (authorBooks.length > 0) {
                    resolve(authorBooks); // Resolve the Promise with the found books
                } else {
                    reject({ message: 'No books found by this author' }); // Reject the Promise if no books are found
                }
            }, 1000); // Simulate a 1-second delay (adjust as needed)
        });

        // Handle the Promise result using async/await
        const result = await searchByAuthor;


        res.status(200).json({ booksbyauthor: { isbn: index, title: result[0].title, reviews: result[0].reviews } }); // Respond with the found books by the author
    } catch (error) {
        res.status(404).json(error); // Respond with an error message if no books are found
    }
});


// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
    try {
        const title = req.params.title;
        let index;

        const searchByTitle = new Promise((resolve, reject) => {
            setTimeout(() => {

                const titleBooks = Object.values(books).filter((book) =>
                    book.title.toLowerCase().includes(title.toLowerCase())
                );
                for (const key in books) {
                    if (books[key].title == titleBooks[0].title) {
                        index = key;
                        break;
                    }
                }

                if (titleBooks.length > 0) {
                    resolve(titleBooks); // Resolve the Promise with the found books
                } else {
                    reject({ message: 'No books found with this title' }); // Reject the Promise if no books are found
                }
            }, 1000); // Simulate a 1-second delay (adjust as needed)
        });

        // Handle the Promise result using async/await
        const result = await searchByTitle;

        res.status(200).json({ booksbytitle: { isbn: index, author: result[0].author, reviews: result[0].reviews } }); // Respond with the found books by title
    } catch (error) {
        res.status(404).json(error); // Respond with an error message if no books are found
    }
});

// Get book review
public_users.get('/review/:isbn', function (req, res) {
    const { isbn } = req.params;

    // Retrieve book reviews from your books data
    const book = books[isbn];

    if (book && book.reviews) {
        res.json(book.reviews);
    } else {
        res.status(404).json({ message: "Reviews not found" });
    }
});


module.exports.general = public_users;