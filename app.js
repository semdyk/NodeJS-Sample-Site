const express = require('express');
const handlebars = require('express-handlebars');
const helmet = require("helmet");

const session = require('express-session');

const http = require('http');
const https = require('https');

const path = require('path');
const mysql = require('mysql');

require('dotenv').config();

const connection = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASS,
    database: process.env.MYSQLDB
});

const hbs = handlebars.create();

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.engine('hbs', hbs.engine);
app.set('views', __dirname + '/App');
app.use(express.static(__dirname + '/App'));
app.set('view engine', 'hbs');

app.locals.layout = false;

app.get('/', (req, res) => {
    res.render('main', {});
});

app.get('/logout', function(req, res) {
    hook.send("Logged Out: " + req.session.user)
    req.session.user = "";
    req.session.email = "";
    res.redirect('https://localhost/')
});

app.get('/dashboard', (req, res) => {
    res.render('dash', {
        user: req.session.user,
        email: req.session.email,
    });
    connection.query('SELECT * FROM accounts WHERE username = ?', [req.session.user], function(error, results, fields) {

        // If there is an issue with the query, output the error
        if (error) throw error;
        // If the account exists
        if (results.length > 0) {
            res.render('dash', {
                user: req.session.user,
                email: req.session.email,
            });

        } else {
            res.redirect(301, "localhost")
        }
    });
});

app.get('/login', (req, res) => {
    res.sendFile('/App/login.html', { root: '.' });
});

app.get('/register', (req, res) => {
    res.sendFile('/App/register.html', { root: '.' });
});



app.post('/registeracc', function(request, response) {
    // Capture the input fields
    let username = request.body.username;
    let passwordinp = request.body.password;
    let email = request.body.email;

    // Ensure the input fields exists and are not empty
    if (username && passwordinp && email && validator.isEmail(email)) {

        console.log("Connected!");

        var password = passwordHash.generate(passwordinp)

        var sql = "INSERT INTO accounts (username, password, email) VALUES ('" + username + "', '" + password + "', '" + email + "')";
        connection.query(sql, function(err, result) {

            if (err) {
                if (err.code == "ER_DUP_ENTRY") {
                    response.send("Not allowed")
                    return false;
                } else {
                    throw err;
                }
            }



            console.log("1 record inserted");
            request.session.user = username;
            request.session.email = email;
            response.redirect(301, '/')
        });
    } else {
        response.send("Something went wrong!");
        response.end();
    }
});

app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));

app.disable('x-powered-by');

const httpServer = http.createServer(app);
const httpsServer = https.createServer(app);

httpServer.listen(80, () => {
    console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
    console.log('HTTPS Server running on port 443');
});