var express = require("express"); // this calls the express framework //
var app = express();
var mysql = require('mysql');
var flash = require('connect-flash');
app.set("view engine","ejs"); //set default view engine //
var fs = require('fs')
app.use(express.static("views"));
const fileUpload = require('express-fileupload');
app.use(fileUpload());
app.use(express.static("script"));
app.use(express.static("images"));
var publicDir = require('path').join(__dirname,'/public');
app.use(express.static(publicDir));
var passport = require("passport"); // pull in express session to the application
var LocalStrategy = require('passport-local').Strategy;
var localStorage = require('node-localstorage')
var session  = require('express-session');
var cookieParser = require('cookie-parser');
var bcrypt = require('bcrypt-nodejs');
app.use(cookieParser()); // read cookies (needed for auth)
app.use(session({
	secret: 'vidyapathaisalwaysrunning',
	resave: true,
	saveUninitialized: true
 } )); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("views"));
app.use(express.static("script"));
app.use(express.static("images"));
app.set("view engine", "ejs");


    
var db = mysql.createConnection ({
 host: 'den1.mysql1.gear.host',
 user: 'consoletrader',
 password: 'password#',
 database: 'consoletrader'    
})
db.connect((err) => {
    if(err){
    console.log("Uh oh MySQL Connection failed :(")
    }
    else
    {
    console.log("Connection to MySQL Database successful :)")    
    }
});
// JSON ATHLETES CODE /// ADD EDIT AND DELETE //
// Route to home page //    

app.get("/", function(req, res){
    
   // res.send("This is the best class ever");
    res.render("index");
    console.log("Home page")
    console.log('Cookies: ', req.cookies);
});

// Route to post / insert a new product //
app.get('/admin',function(req,res){
res.render('admin')
console.log("Opening administrator page")
}); 
// SQL DATA //
app.get('/rmtable',function(req,res){
    let sql = 'DROP TABLE item;'
    let query = db.query(sql,(err,res) => {
    if (err) throw err;
    });
    res.send("Item table removed successfully")
});

// Creating a database table route //
app.get('/createtable', function(req,res){
 let sql = 'CREATE TABLE item (id int NOT NULL AUTO_INCREMENT PRIMARY KEY,title varchar(255),brand varchar(255),image varchar(255),description varchar(255),price int(10));'
 let query = db.query(sql,(err,res)=>{
  if (err) throw err;
  console.log(res);
  
 });
  res.send("Item Table Created,nice")
 
});

app.get('/products',  function(req, res){  // I have this restricted for admin just for proof of concept
 let sql = 'SELECT * FROM item'
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);

    res.render('products', {res1});
  });
 
  console.log("Now you are on the products page!");
});

// Route to view available xbox products //
app.get('/xbox', isLoggedIn, function(req, res){
 let sql = 'SELECT * FROM item WHERE brand = "Xbox";'
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);
    res.render('xbox', {res1});
  });
 
  console.log("Entering the Xbox page!");
});
// Edit a product sql data //
app.get('/editsql/:id',function(req,res){
    let sql = 'SELECT * FROM item WHERE id = "'+req.params.id+'"'
    let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);
    res.render('editsql',{res1});
    });
console.log("Edit item page!");
});
// Post url to edit products //
app.post('/editsql/:id',function(req,res){
let sql = 'UPDATE item SET title = "'+req.body.title+'",Price = '+req.body.price+',Description = "'+req.body.description+'" WHERE id = "'+req.params.id+'"'
        let query = db.query(sql, (err, res1) => {
        if(err) throw err;
        console.log("Oh dear,update failed")
    });
    res.redirect("/products");
   
    
});
// Route to delete an individual product 
app.get('/deletesql/:id', function(req, res) {
    let sql = 'DELETE FROM item WHERE id = '+req.params.id+''
    let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    });
    res.redirect('/products'); 
});

// Route to post / insert a new product //
app.get('/newproduct',isLoggedIn,function(req,res){
res.render('newproduct')
    
}); 

// Route to post / insert a new product //
app.post('/newproduct',function(req,res){
    
    let sampleFile = req.files.sampleFile
    var filename = sampleFile.name;
// Use middleware to move the data from the form to the desired location //
    sampleFile.mv('./images/'+ filename, function(err){
 });
    
let sql = 'INSERT INTO item (title, brand, image,description,price) VALUES ("'+req.body.title+'", "'+req.body.brand+'", "'+filename+'","'+req.body.description+'", '+req.body.price+')'
let query = db.query(sql,(err,res) =>{
if(err) throw err;
console.log("Oh dear,sql failed to input your data")
    });
    res.redirect("/products");
    
});

///////////////////////// USER INFORMATION //////////////////////////////////////
app.get('/createtable',function(req,res){
    let sql = 'CREATE TABLE user (id int(5) NOT NULL AUTO_INCREMENT,name varchar(255) NOT NULL,username varchar(20) NOT NULL,email varchar(255) NOT NULL,password varchar(255));'
    let query = db.query(sql,(err,res) => {
    if (err) throw err;
    });
    res.send("Sql User Table created successfully")
});

// --------------------------------------------------------- Authenthication ------------------------------------------------------------ //
	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {
		res.render('login.ejs', { message: req.flash('loginMessage') });
		console.log("On log in page!");
	});
	app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
		}),
        function(req, res) {
            console.log("Welcome");

            if (req.body.remember) {
              req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
              req.session.cookie.expires = false;
            }
        res.redirect('/');
    });
	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/register', function(req, res) {
		// render the page and pass in any flash data if it exists
		res.render('register.ejs', { message: req.flash('signupMessage') });
		console.log("You are on the registration page!");
	});
	app.post('/register', passport.authenticate('local-signup', {
		successRedirect : '/profile', // redirect to the secure profile section
		failureRedirect : '/register', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));
	// =====================================
	// PROFILE SECTION =========================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile', {
			user : req.user // get the user out of session and pass to template
		});
	});

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/');
	});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next();
	res.redirect('/');
}
function isAdmin(req, res, next) {
	if (req.user.admin)
		return next();
	res.redirect('/');
}
    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id); // Very important to ensure the case if the Id from your database table is the same as it is here
    });
    passport.deserializeUser(function(id, done) {    // LOCAL SIGNUP ============================================================

       db.query("SELECT * FROM user WHERE id = ?",[id], function(err, rows){
            done(err, rows[0]);
        });
    });
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
  passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) {
            db.query("SELECT * FROM user WHERE username = ?",[username], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    var newUserMysql = {
                        username: username,
                        name: req.body.name,
                        email: req.body.email,
                        password: bcrypt.hashSync(password, null, null)  // use the generateHash function in our user model
                    };

                    var insertQuery = "INSERT INTO user (username,name,email,password) values (?,?,?,?)";

                    db.query(insertQuery,[newUserMysql.username,newUserMysql.name,newUserMysql.email,newUserMysql.password],function(err, rows) {
                        newUserMysql.Id = rows.insertId;

                        return done(null, newUserMysql);
                    });
                }
            });
        })
    );

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'username',
            passwordField : 'password',
            passReqToCallback : true // allows us to pass back the entire request to the callback
        },
        function(req, username, password, done) { // callback with email and password from our form
            db.query("SELECT * FROM user WHERE username = ?",[username], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
                }
                if (!bcrypt.compareSync(password, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
                return done(null, rows[0]);
            });
        })
    );

////////////////////// VIEW ALL USERS ///////////////////////////////////////////
app.get('/viewusers',  function(req, res){  
 let sql = 'SELECT * FROM user;'
  let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);
    res.render('viewusers', {res1});
  });
 
  console.log("Entering page to view all Users!");
});

//////////////////////EDIT USER INFO ////////////////////////////////////////////
app.get('/editusersql/:id',function(req,res){
    let sql = 'SELECT * FROM user WHERE id = "'+req.params.id+'"'
    let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log(res1);
    res.render('editusersql',{res1});
    });

});
app.post('/editusersql/:id',function(req,res){
let sql = 'UPDATE user SET username = "'+req.body.username+'",name = "'+req.body.name+'",email = "'+req.body.email+'" WHERE id = "'+req.params.id+'"'
        let query = db.query(sql, (err, res1) => {
        if(err) throw err;
        console.log("Oh dear,update failed")
    });
    res.redirect("/viewusers");
});
////////////////////// DELETE AN INDIVIDUAL USER ///////////////////////////////// 
app.get('/deleteuser/:id', function(req, res) {
    let sql = 'DELETE FROM user WHERE id = '+req.params.id+''
    let query = db.query(sql, (err, res1) => {
    if(err) throw err;
    console.log("Oh dear,failed to delete this user")
    });
    res.redirect('/viewusers'); 
});

 // Test Query route
  passport.serializeUser(function(user, done) {
  done(null, user);
  console.log("User Serialised " + user),
  function(req){}
 
});

passport.deserializeUser(function(user_id, done) {
done(err, user_id);
});

//******** NEVER WRITE BELOW THIS LINE EVER EVER **********

app.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0",function(){

console.log("Application Started!")
    
});
