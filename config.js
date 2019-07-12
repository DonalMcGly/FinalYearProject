var mysql      = require('mysql');
var db = mysql.createConnection ({
 host: 'localhost',
 user: 'dmcglynn',
 password: 'password#',
 database: 'consoletrader'    
})
db.connect(function(err){
if(!err) {
    console.log("Database is connected");
} else {
    console.log("Error while connecting with database");
}
});
module.exports = db; 