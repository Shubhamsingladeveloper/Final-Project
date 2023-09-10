const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userExist = users.filter((user) => {
        return (user.username === username)
    })

    if (userExist.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

const authenticatedUser = (username, password) => {
    let validateUser = users.filter((user) => {
        return (user.username === username && user.password === password)
    })
    if (validateUser.length > 0) {
        return true
    }
    else {
        return false
    }
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });

    }

    if (authenticatedUser(username, password)) {
        let accessToken = jwt.sign({
            username
        }, 'access', { expiresIn: 60 * 60 })

        req.session.authorization = {
            accessToken
        }

        return res.status(200).send("User successfully logged in");
    }
    else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const review = req.query.review




    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    books[isbn].reviews = {
        ...books[isbn].reviews,
        [req.user.username]: review,
    };

    res.status(200).json({ message: `The review for the book with isbn ${isbn} has been added/updated` });
});

// DELETE endpoint to delete a user's review for a specific book
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;

    // Check if the book exists in your data
    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Check if the user has previously reviewed this book
    const user = req.user.username;
    const userReview = books[isbn].reviews[user];

    if (!userReview) {
        return res.status(404).json({ message: "Review not found" });
    }

    // Delete the user's review for the book
    delete books[isbn].reviews[user];

    res.status(200).json({ message: `Review for the isbn ${isbn} psoted by the user ${user}  deleted` });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;