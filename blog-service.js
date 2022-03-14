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
                posts = JSON.parse(data);
                // Read all categories
                fs.readFile('./data/categories.json', 'utf8', (err, data) => {
                    if (err) throw err;
                    else {
                        categories = JSON.parse(data);
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
    return new Promise((resolve, reject) => {
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].published) {
            publishedPosts.push(posts[i]);
        }
    }
    
        publishedPosts && publishedPosts.length > 0 ? resolve(publishedPosts) : reject('No results returned'); 
    })
};

const getPostsByCategory = (category) => {
    return new Promise((resolve,reject) => {
        let matchingPosts = posts.filter(post => post.category == category);
        if (matchingPosts.length == 0) {
            reject('no result returned');
        }
        resolve(matchingPosts);
    })
}

const getPostsByMinDate = (minDateStr) => {
    return new Promise((resolve,reject) => {
        let minDate = new Date(minDateStr);
        let matchingPosts = posts.filter(post => new Date(post.postDate) >= minDate);
        if (matchingPosts.length == 0) {
            reject('no results returned');
        }
        resolve(matchingPosts);
    })
}

const getPostsById = (id) => {
    return new Promise((resolve,reject) => {
        let postFound = posts.filter(post => post.id == id);
        if (posts.length == 0) {
            reject('no results returned');
        }
        resolve(postFound);
    })
}

const getCategories = () => {
    return new Promise((resolve, reject) => {
        categories && categories.length > 0 ? resolve(categories) : reject('No results returned'); 
    })
};

const addPost = (postData) => {
    postData.published == undefined ? postData.published = false : postData.published = true;
            postData.published = false;
    postData.id = posts.length + 1;
    postData.postDate = "2022-03-12";
    posts.push(postData);
    
    return new Promise((resolve, reject) => {
        // Check if push was successful
        for (let i = 0; i < posts.length; i++) {
            if (posts[i] == postData) {
                resolve(postData);
            }
        }
        reject('No results returned');
    })
};

const getPublishedPostsByCategory = (category) => {
    let publishedPosts = [];
    return new Promise((resolve, reject) => {
    for (let i = 0; i < posts.length; i++) {
        if (posts[i].published && posts[i].category == category) {
            publishedPosts.push(posts[i]);
        }
    }
    
        publishedPosts && publishedPosts.length > 0 ? resolve(publishedPosts) : reject('No results returned'); 
    })
}

module.exports = {
    initialize, 
    getAllPosts, 
    getPublishedPosts, 
    getCategories,
    addPost,
    getPostsByCategory,
    getPostsByMinDate,
    getPostsById,
    getPublishedPostsByCategory
}


