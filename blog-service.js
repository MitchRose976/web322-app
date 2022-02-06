const { rejects } = require("assert");
const fs = require("fs"); 
//const { resolve } = require("path/posix");

// Global arrays
let posts = [];
let categories = [];

const initialize = () => {
    return new Promise((resolve, reject) => {

        // Read all posts
        fs.readFile('./data/posts.json', 'utf8', (err, data) => {
            if (err) throw err;
            else {
                posts = data;
                // Read all categories
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) throw err;
                    else {
                        categories = data;
                        // console.log("posts: ", posts);
                        // console.log("categories: ", categories);
                        resolve("Success! Data stored in arrays");
                    }
                })
            }
        })
    })
};

const getAllPosts = () => {
    return new Promise((resolve, reject) => {
        posts && posts.length > 0 ?  resolve(posts) : reject('no results returned');   
    })
};

const getPublishedPosts = () => {
    let publishedPosts = [];
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].published) {
            publishedPosts.push(posts[i]);
        }
    }
    return new Promise((resolve, reject) => {
        publishedPosts && publishedPosts.length > 0 ? resolve(publishedPosts) : reject('No results returned'); 
    })
};

const getCategories = () => {
    return new Promise((resolve, reject) => {
        categories && categories.length > 0 ? resolve(categories) : reject('No results returned'); 
    })
}

module.exports = {
    initialize, 
    getAllPosts, 
    getPublishedPosts, 
    getCategories
}


