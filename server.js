/*********************************************************************************
*  WEB322 – Assignment 06
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  No part 
*  of this assignment has been copied manually or electronically from any other source 
*  (including 3rd party web sites) or distributed to other students.
* 
*  Name: Mitchell Rose Student ID: 018733147 Date: April.14, 2022
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
const authData = require('./auth-service');
const clientSessions = require('client-sessions');
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
        },
        formatDate: function(dateObj){
            let year = dateObj.getFullYear();
            let month = (dateObj.getMonth() + 1).toString();
            let day = dateObj.getDate().toString();
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2,'0')}`;
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


// Setup client client sessions
app.use(clientSessions({
    cookieName: "session",
    secret: "web322_assignment6example",
    duration: 2 * 60 * 1000,
    activeDuration: 1000 * 60
}))

// middleware function
app.use(function(req, res, next) {
    console.log("MIDDLEWARE" + JSON.stringify(req.session));
    res.locals.session = req.session;
    next();
  });


function ensureLogin(req, res, next) {
    console.log("ensureLogin Req: " + JSON.stringify(req.session));
    if (!req.session.user) {
        res.redirect("/login");
    } else {
        next();
    }
};


// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.redirect('/blog');
});

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/categories", ensureLogin, (req, res) => {
    blogData.getCategories()
    .then((data) => {
        if (data.length > 0) {
            res.render("categories", {categories: data});
        } else {
            res.render("categories", {message: "no results"});
        }
    })
    .catch((err) => {
        res.render("categories", {message: "no results"})
    })   
});

// POSTS
app.get("/posts", ensureLogin, (req, res) => {
    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category)
        .then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data});
            } else {
                res.render("posts", {message: "no results"});
            }
        })
        .catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else if (req.query.minDate) {
        blogData.getPostsByMinDate(req.query.minDate)
        .then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data});
            } else {
                res.render("posts", {message: "no results"});
            }
        })
        .catch((err) => {
            res.render("posts", {message: "no results"});
        })
    } else {
        blogData.getAllPosts()
        .then((data) => {
            if (data.length > 0) {
                res.render("posts", {posts: data});
            } else {
                res.render("posts", {message: "no results"});
            }
        })
        .catch((err) => {
            res.render("posts", {message: "no results"});
        })
    }  
});

app.get('/blog', ensureLogin, async (req, res) => {

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
    } catch (err) {
        viewData.message = "no results";
    } try {
        // Obtain the full list of "categories"
        let categories = await blogData.getCategories();
        // store the "categories" data in the viewData object (to be passed to the view)
        viewData.categories = categories;
    } catch (err) {
        viewData.categoriesMessage = "no results"
    }
    // render the "blog" view with all of the data (viewData)
    res.render("blog", {data: viewData})
});

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

app.get("/posts/add", ensureLogin, (req, res) => {
    blogData.getCategories().then((data) => {
        res.render(path.join(__dirname, "./views/addPost.hbs"), {categories: data});
    }).catch((err) => {
        res.render(path.join(__dirname, "./views/addPost.hbs"), {categories: []});
    })     
});

app.post("/posts/add", ensureLogin, upload.single("featureImage"), (req, res) => {

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
    
    upload(req)
    .then((uploaded)=>{
        req.body.featureImage = uploaded.url;
        // TODO: Process the req.body and add it as a new Blog Post before redirecting to /posts
        blogData.addPost(req.body)
        .then(() => {
            res.redirect('/posts');
        })
        .catch((error) => {
            res.json({ message: error })
        })   
    })
    .catch((error) => {
        blogData.addPost(req.body)
        .then(() => {
            res.redirect('/posts');
        })
        .catch((error) => {
            res.json({ message: error })
        })
    })
});

app.get("/posts/:value", ensureLogin, (req, res) => {
    blogData.getPostById(req.params.value)
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        res.render('posts', {"message": err}); 
    }) 
});

app.get("/posts/:category", ensureLogin, (req, res) => {
    blogData.getAllPosts()
    .then((data) => {
        return res.json({data});
    })
    .catch((err) => {
        return {"message": err.message};
    })
})


app.use(express.urlencoded({extended: true}));

app.get('/categories/add', ensureLogin, (req, res) => {
    res.render(path.join(__dirname, "./views/addCategory.hbs"))
});

app.post('/categories/add', ensureLogin, (req, res) => {
    blogData.addCategory(req.body)
    .then((data) => {
        res.redirect('/categories');
    })
    .catch((err) => {
        res.json({message: err});
    })   
});

app.get('/categories/delete/:id', ensureLogin, (req, res) => {
    blogData.deleteCategoryById(req.params.id)
    .then(() => {
        res.redirect('/categories');
    })
    .catch((err) => {
        res.status(500).send("Unable to Remove Category / Category not found)");
    })
});

app.get('/posts/delete/:id', ensureLogin, (req, res) => {
    blogData.deletePostById(req.params.id)
    .then(() => {
        res.redirect('/posts');
    })
    .catch((err) => {
        res.status(500).send("Unable to Remove Post / Post not found)");
    })  
});


// login for user
app.get("/login", (req, res) => {
    res.render("login");
})

// register a user
app.get("/register", (req, res) => {
    res.render('register');
})

app.post("/login", (req, res) => {
    req.body.userAgent = req.get('User-Agent');
    authData.checkUser(req.body)
    .then((user) => {
        req.session.user = {
            userName: user.userName,
            email: user.email,
            loginHistory: user.loginHistory
        }
        res.redirect('/posts');
    })
    .catch((err) => {
        res.render("login", {errorMessage: err, userName: req.body.userName});
    }) 
})

app.post("/register", (req, res) => {
    authData.registerUser(req.body)
    .then((user) => {
        res.render('register', {successMessage: "User created"});
    }).catch((err) => {
        res.render('register', {errorMessage: err, userName: req.body.userName});
    })
})


// logout
app.get('/logout', (req, res) => {
    req.session.reset();
    res.redirect("/");
})


// user history
app.get('/userHistory', ensureLogin, (req, res) => {
    // createensureLogin().then(
        res.render("userHistory")
    // ).catch((err) => {
    //     reject("User authentication failed", err);
    // }) 
})


app.get("*", (req, res) => {
    //res.sendFile(path.join(__dirname, "./views/error.html"));
    res.render("error");
})


// setup http server to listen on HTTP_PORT
blogData.initialize()
.then(authData.initialize)
.then(function(){
    app.listen(HTTP_PORT, function(){
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function(err){
    console.log("unable to start server: " + err);
});

