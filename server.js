/*********************************************************************************
*  WEB322 – Assignment 03
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Mitchell Rose Student ID: 018733147 Date: Feb.18, 2022
*
*  Heroku App URL: https://morning-citadel-59888.herokuapp.com/
* 
*  GitHub Repository URL: https://github.com/MitchRose976/web322-app.git
*
********************************************************************************/ 


const HTTP_PORT = process.env.PORT || 8080;
const express = require("express");
const path = require("path");
const blogData = require("./blog-service");
const multer = require("multer");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');
const app = express();

// Handlebars
app.engine('.hbs', exphbs.engine({ 
    extname: '.hbs', 
    defaultLayout: 'main',
    helpers: {
        navLink: function(url, options){
            return '<li' + 
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + 
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
                return options.inverse(this);
            } else {
                return options.fn(this);
            }
        },
        safeHTML: function(context){
            return stripJs(context);
        }
    }
}));
app.set('view engine', '.hbs');

// Cloudinary config
cloudinary.config({
    cloud_name: 'dn9eray9r',
    api_key: '557756833297565',
    api_secret: '2Epg-MEvjG7rmghtGDfsHgZtcHg',
    secure: true
});

// multer variables 
const upload = multer(); 


// Add middleware
app.use(express.static('public')); 

// Nav bar fix
app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = (route == "/") ? "/" : "/" + route.replace(/\/(.*)/, "");
    app.locals.viewingCategory = req.query.category;
    next();
});

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    //res.send(`Express http server listening on ${HTTP_PORT}`);
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    
    var info = {
        name: "Graduation", 
        year: "2015",
        artist: "Kanye West",
        visible: true
    }
    
    res.render('about', {
        data: info,
        layout: 'main.hbs'
    });
});

app.get('/blog', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // get the latest post from the front of the list (element 0)
        let post = posts[0]; 
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
        viewData.post = post;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category).then((data) => {
            res.render("posts", {posts:data});
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else if (req.query.minDate) {
        blogData.getPostsByMinDate(req.query.minDate).then((data) => {
            res.render("posts", {posts:data});
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else {
        blogData.getAllPosts().then((data) => {
            res.render("posts", {posts:data});
        }).catch((err) => {
            res.render("posts", {message: "no results"});
        })
    }  
});

app.get("/posts/:value", (req, res) => {
    blogData.getPostsById(req.params.value).then((data) => {
        return res.json({data});
    }).catch((err) => {
        return {"message": err.message};
    }) 
});

app.get("/posts/:category", (req, res) => {
    blogData.getAllPosts().then((data) => {
        return res.json({data});
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("/posts/add", (req, res) => {
    var info = {
        name: "Graduation", 
        year: "2015",
        artist: "Kanye West",
        visible: true
    }
    
    res.render('addPost', {
        data: info,
        layout: false
    });
})

app.get("/categories", (req, res) => {
    blogData.getCategories().then((data) => {
        res.render("categories", {categories:data});
    }).catch((err) => {
        res.render("categories", {message: "no results"})
    })
})

app.get("*", (req, res) => {
    //res.sendFile(path.join(__dirname, "./views/error.html"));
    res.render("error");
})

app.post("/posts/add", upload.single("featureImage"), (req, res) => {
    let streamUpload = (req) => {
        return new Promise((resolve, reject) => {
            let stream = cloudinary.uploader.upload_stream(
                (error, result) => {
                if (result) {
                    resolve(result);
                } else {
                    reject(error);
                }
                }
            );
    
            streamifier.createReadStream(req.file.buffer).pipe(stream);
        });
    };
    
    async function upload(req) {
        let result = await streamUpload(req);
        console.log(result);
        return result;
    }
    
    upload(req).then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogData.addPost(req.body).then(() => {
            res.redirect('/posts');
        });
        
    });
        
})

app.get('/blog/:id', async (req, res) => {

    // Declare an object to store properties for the view
    let viewData = {};
    try{
        // declare empty array to hold "post" objects
        let posts = [];
        // if there's a "category" query, filter the returned posts by category
        if(req.query.category){
            // Obtain the published "posts" by category
            posts = await blogData.getPublishedPostsByCategory(req.query.category);
        }else{
            // Obtain the published "posts"
            posts = await blogData.getPublishedPosts();
        }
        // sort the published posts by postDate
        posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));
        // store the "posts" and "post" data in the viewData object (to be passed to the view)
        viewData.posts = posts;
    }catch(err){
        viewData.message = "no results";
    }
    try{
        // Obtain the post by "id"
        viewData.post = await blogData.getPostById(req.params.id);
    }catch(err){
        viewData.message = "no results"; 
    }
    try{
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    }catch(err){
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});


// setup http server to listen on HTTP_PORT
blogData.initialize().then(() => {
    app.listen(HTTP_PORT);
}).catch((err) => {
    console.log(err);
    res.status(404).send("Error loading data");
})
