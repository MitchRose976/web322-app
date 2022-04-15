const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    "userName":{
        type: String,
        unique: true
    }, 
    "password": String,
    "email": String,
    "loginHistory":[{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User;

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb+srv://018733147:Rose1996!!@senecaweb.pdnas.mongodb.net/web322_week8?retryWrites=true&w=majority");

        db.on('error', (err)=>{
            reject(err); // reject the promise with the provided error
        });
        db.once('open', ()=>{
           User = db.model("users", userSchema);
           resolve();
        });
    });
};

module.exports.registerUser = (userData) => {
    return new Promise((resolve, reject) => {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } 
        else {
            
            bcrypt.hash(userData.password, 10)
            .then(hash => { // Hash the password using a Salt that was generated using 10 rounds
                // TODO: Store the resulting "hash" value in the DB
                userData.password = hash;
                let newUser = new User(userData);
                console.log(newUser);
                newUser.save((err) => {
                    if (err) {
                        if (err.code === 11000) {
                            reject("User Name already taken" + err);
                        } else {
                            reject("There was an error creating the user: err " + err);
                        }
                    } else {
                        resolve();
                    }
                });
            })
            .catch(err=>{
                console.log("There was an error encrypting the password" + err); // Show any errors that occurred during the process
            });

        }
    })   
};

module.exports.checkUser = (userData) => {
    return new Promise((resolve, reject) => {
        User.find({userName: userData.userName})
        .exec()
        .then((users) => {

            if (users.length === 0) {
                reject("Unable to find user: " + userData.userName + " " + err);
            }
            bcrypt.compare(userData.password, users[0].password).then((res) => {
                // result === true if it matches and result === false if it does not match
                console.log(res);
                if (res === true) {
                    console.log("success before " + users[0].loginHistory);
                    users[0].loginHistory.push({dateTime: (new Date()).toString(), userAgent: userData.userAgent});
                    console.log("success after " + users[0].loginHistory);
                    User.update(
                        {userName: users[0].userName}, 
                        {$set: {loginHistory: users[0].loginHistory}}
                    )
                    .exec()
                    .then(() => {
                        resolve(users[0]);
                    }).catch((err) => {
                        reject("There was an error verifying the user: " + err);
                    });
                }
             })
             .catch((err) => {
                 console.log("Incorrect Password for user: " + userData.userName + " " + err);
             });
        })
        .catch((err) => {
            reject("Unable to find user: " + userData.userName + " " + err);
        })
    }) 
};


