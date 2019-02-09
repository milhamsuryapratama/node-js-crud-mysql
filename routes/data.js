const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

router.get('/', function (req, res) {
    req.con.query('SELECT * FROM node_crud', function (err, rows) {
        console.log(rows)
        res.render('data/index', { data: rows })
    })
})

router.get('/create', function (req, res) {
    res.render('data/create')
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

router.post('/create', function (req, res) {
    upload(req, res, err => {
        if (err) throw err

        const data = req.body

        if (data.jk == "L") {
            jk = "L"
        } else {
            jk = "P"
        }

        req.con.query(`INSERT INTO node_crud SET nama = '${data.nama}', alamat = '${data.alamat}', telepon = '${data.telepon}', jk = '${jk}', foto = '${req.file.filename}' `, function (err) {
            res.redirect('/')
        })
    });
})

router.get('/edit/:id', function (req, res) {
    req.con.query(`SELECT * FROM node_crud WHERE id = ${req.params.id} `, function (err, rows) {
        res.render('data/edit', { data: rows[0] })
    })
})

router.post('/edit/:id', function (req, res) {

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
                res.redirect('/')
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
                                res.redirect('/')
                            })
                        }
                    });
                })

            })
        }

    });
})

router.get('/hapus/:id', function (req, res) {
    req.con.query(`SELECT foto FROM node_crud WHERE id = ${req.params.id} `, function (err, result, fields) {
        const namaFoto = result[0].foto
        // console.log(namaFoto)
        req.con.query(`DELETE FROM node_crud WHERE id = ${req.params.id} `, function (err) {
            fs.unlink("./public/images/" + namaFoto, (err) => {
                if (err) {
                    console.log("failed to delete local image:" + err);
                } else {
                    res.redirect('/')
                }
            });
        })

    })
})

module.exports = router