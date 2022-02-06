/*********************************************************************************
*  WEB322 – Assignment 02
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part *  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Mitchell Rose Student ID: 018733147 Date: Feb.5,2022
*
*  Online (Heroku) URL: https://morning-citadel-59888.herokuapp.com/about
*
*  GitHub Repository URL: https://github.com/MitchRose976/web322-app
*
********************************************************************************/ 

const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const blogData = require("./blog-service");
const app = express();

// Add middleware
app.use(express.static('public')); 

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    //res.send(`Express http server listening on ${HTTP_PORT}`);
    res.redirect('/about');
});

app.get("/about", (req, res) => {
    res.sendFile(path.join(__dirname, './views/about.html'));
});

app.get("/blog", (req, res) => {
    blogData.getPublishedPosts().then((data) => {
        res.send(data);
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("/posts", (req, res) => {
    blogData.getAllPosts().then((data) => {
        res.send(data);
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("/categories", (req, res) => {
    blogData.getCategories().then((data) => {
        res.send(data);
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/error.html"));
})

// setup http server to listen on HTTP_PORT
blogData.initialize().then(() => {
    app.listen(HTTP_PORT);
}).catch((err) => {
    console.log(err);
    res.status(404).send("Error loading data");
})
