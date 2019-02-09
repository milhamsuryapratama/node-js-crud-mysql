const express = require('express')
const app = express()
const mysql = require('mysql')
const path = require('path')

require('dotenv').config()

const dataRouter = require('./routes/data')

const con = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
})

con.connect(function (err) {
    if (err) {
        console.log("database connection error")
    } else {
        console.log('database connection success')
    }
})

// Using pug template engine
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug')

// connecting route to database
app.use(function (req, res, next) {
    req.con = con
    next()
})
// parsing post data
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// routing
app.use('/', dataRouter)
app.use(express.static('public'))

app.listen(2000, function () {
    console.log('server listening on port 2000')
})