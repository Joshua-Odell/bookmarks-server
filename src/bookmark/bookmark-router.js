require('dotenv').config()
const express = require('express')
const { v4: uuid} = require('uuid')
const logger = require('../logger')
const { list } = require('../store')
const { NODE_ENV } = require('../config')
const BookmarksService = require('../bookmarks-service')
const app = express()

const bookmarkRouter = express.Router()
const bodyParser = express.json()


bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post((req, res) => { 
        const knexInstance = req.app.get('db')
        const { title, url, rating, description } = req.body;
        const newBookmark = { title, url, rating, description }
        

        if(!title || !url || !rating || !description){
            logger.error(`Missing required fields`);
            return res
                .send(400)
                .send('Invalid data: title, url and rating required');
        }

        const id = uuid();

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )

        .then(article => {
            res 
            .status(201)
            .location(`http://localhost:8000/bookmark/${id}`)
            .json(bookmark);
        })       
        .catch(next)
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => { 
        const knexInstance = req.app.get('db')
        BookmarksService.getById(knexInstance, req.params.id)
            .then(article => {
                if(!article){
                    return res.status(404).json({
                        error: {message: `Bookmark Not Found`}
                    })
                }
                res.json(article)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params;
        const knexInstance = req.app.get('db')
        console.log(id)

        const bookmarkIndex = list.findIndex(bookmark => bookmark.id == id);

        if(bookmarkIndex === -1){
            logger.error(`Bookmark with that id not found.`);
            return res
                .status(404)
                .send('Not Found')
        }

        list.splice(bookmarkIndex, 1);

        logger.info(`Card with id ${id} deleted.`);

        res
            .status(204)
            .end();
    });

module.exports = bookmarkRouter