const express = require('express');
const fs = require('fs');
const router = express.Router();
const {ensureAuthenticated} = require('../middleware/authenticate');
const {getHolidays} = require('../controllers/holidays');
const {renderTutorialsPage, renderDictionariesPage, renderDialectsPage,
       getDictionaries, getDialects, getTutorials,
       downloadTutorial, downloadDictionary, downloadDialect, uploadBook, deleteBook} = require('../controllers/books');
const mongodb = require('mongodb'); 
const multer = require('../middleware/multer-storage');

// render books lists pages 
router.get('/tutorials', getHolidays, getTutorials, renderTutorialsPage, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/dictionaries', getHolidays, getDictionaries, renderDictionariesPage, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/dialects', getHolidays, getDialects, renderDialectsPage, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

// download books
router.get('/tutorials/:name',  ensureAuthenticated, getHolidays, downloadTutorial, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/dictionaries/:name',  ensureAuthenticated, getHolidays,  downloadDictionary, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

router.get('/dialects/:name',  ensureAuthenticated, getHolidays, downloadDialect, (err) => {
    res.render('error.hbs', {
        message: err.message
    });
})

// upload books
router.post('/upload-book', ensureAuthenticated, (req, res) => {
    multer(req, res, function (err) {
        if (err) {
            res.status(400).send({ err: err.message });
        }    
        uploadBook(req, res);
    })
})

//delete a book 
router.delete('/delete/:booktype/:id', ensureAuthenticated, deleteBook);
 
module.exports = router;
