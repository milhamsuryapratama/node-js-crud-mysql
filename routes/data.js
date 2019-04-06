const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

router.get('/', (req, res) => {
    res.render('data/login');
})

router.post('/login', (req, res) => {
    const data = req.body;

    if (data) {
        req.con.query(`SELECT * FROM login WHERE username = '${data.username}' AND password = '${data.password}'`, (error, results) => {
            if (results.length > 0) {
                req.session.loggedin = true;
                req.session.username = data.username;
                res.redirect('/data');
            } else {
                res.send('Incorrect Username and/or Password!');
            }
        })
    } else {
        res.send('Please enter Username and Password!');
        res.end();
    }
})

router.get('/logout', (req, res) => {
    req.session.loggedin = false;
    res.redirect('/');
})

router.get('/data', function (req, res) {
    if (req.session.loggedin) {
        req.con.query('SELECT * FROM node_crud', function (err, rows) {
            console.log(rows)
            res.render('data/index', { data: rows })
        })
    } else {
        res.redirect('/');
    }
})

router.get('/data/create', function (req, res) {
    req.session.loggedin ? res.render('data/create') : res.redirect('/');
})

//set storage engine
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
})

//init upload
let upload = multer({ storage: storage }).single('foto')

router.post('/data/create', function (req, res) {
    upload(req, res, err => {
        if (err) throw err

        const data = req.body

        if (data.jk == "L") {
            jk = "L"
        } else {
            jk = "P"
        }

        req.con.query(`INSERT INTO node_crud SET nama = '${data.nama}', alamat = '${data.alamat}', telepon = '${data.telepon}', jk = '${jk}', foto = '${req.file.filename}' `, function (err) {
            res.redirect('/data')
        })
    });
})

router.get('/data/edit/:id', function (req, res) {
    req.session.loggedin ?
        req.con.query(`SELECT * FROM node_crud WHERE id = ${req.params.id} `, function (err, rows) {
            res.render('data/edit', { data: rows[0] })
        }) : res.redirect('/');
})

router.post('/data/edit/:id', function (req, res) {

    upload(req, res, err => {
        const data = req.body

        if (data.jk == "L") {
            jk = "L"
        } else {
            jk = "P"
        }

        console.log(req.file)
        if (req.file == undefined) {
            req.con.query(`UPDATE node_crud SET nama = '${data.nama}', alamat = '${data.alamat}', telepon = '${data.telepon}', jk = '${jk}' WHERE id = ${req.params.id} `, function (err) {
                res.redirect('/data')
            })
        } else {
            req.con.query(`SELECT foto FROM node_crud WHERE id = ${req.params.id} `, function (err, result, fields) {
                const namaFoto = result[0].foto
                // console.log(namaFoto)
                req.con.query(`DELETE foto FROM node_crud WHERE id = ${req.params.id} `, function (err) {
                    fs.unlink("./public/images/" + namaFoto, (err) => {
                        if (err) {
                            console.log("failed to delete local image:" + err);
                        } else {
                            req.con.query(`UPDATE node_crud SET nama = '${data.nama}', alamat = '${data.alamat}', telepon = '${data.telepon}', jk = '${jk}', foto = '${req.file.filename}' WHERE id = ${req.params.id} `, function (err) {
                                res.redirect('/data')
                            })
                        }
                    });
                })

            })
        }

    });
})

router.get('/data/hapus/:id', function (req, res) {
    req.session.loggedin ?
        req.con.query(`SELECT foto FROM node_crud WHERE id = ${req.params.id} `, function (err, result, fields) {
            const namaFoto = result[0].foto
            // console.log(namaFoto)
            req.con.query(`DELETE FROM node_crud WHERE id = ${req.params.id} `, function (err) {
                fs.unlink("./public/images/" + namaFoto, (err) => {
                    if (err) {
                        console.log("failed to delete local image:" + err);
                    } else {
                        res.redirect('/data')
                    }
                });
            })
        }) : res.redirect('/')
})

module.exports = router