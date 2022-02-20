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
const app = express();

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
        return res.json({data});
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("/posts", (req, res) => {
    if (req.query.category) {
        blogData.getPostsByCategory(req.query.category).then((data) => {
            return res.json({data});
        }).catch((err) => {
            return {"message": err.message};
        })
    } else if (req.query.minDate) {
        blogData.getPostsByMinDate(req.query.minDate).then((data) => {
            return res.json({data});
        }).catch((err) => {
            return {"message": err.message};
        })
    } else {
        blogData.getAllPosts().then((data) => {
            return res.json({data});
        }).catch((err) => {
            return {"message": err.message};
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
    res.sendFile(path.join(__dirname, "./views/addPost.html"));
})

app.get("/categories", (req, res) => {
    blogData.getCategories().then((data) => {
        return res.json({data});
    }).catch((err) => {
        return {"message": err.message};
    })
})

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "./views/error.html"));
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


// setup http server to listen on HTTP_PORT
blogData.initialize().then(() => {
    app.listen(HTTP_PORT);
}).catch((err) => {
    console.log(err);
    res.status(404).send("Error loading data");
})
