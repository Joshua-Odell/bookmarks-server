const express = require('express')
const { v4: uuid} = require('uuid')
const logger = require('../logger')
const { list } = require('../store')

const bookmarkRouter = express.Router()
const bodyParser = express.json()

bookmarkRouter
    .route('/bookmarks')
    .get((req, res) => {
        res
            .json(list);
    })
    .post((req, res) => { // req.body returning undefined 
        console.log(req.body)
        const { title, url, rating, description } = req.body;
        

        if(!title || !url || !rating || !description){
            logger.error(`A title is required`);
            return res
                .send(400)
                .send('Invalid data: title, url and rating required');
        }

        const id = uuid();

        const bookmark = {
            id,
            title,
            url,
            rating,
            description
        }

        list.push(bookmark);

        logger.info(`Card with id ${id} created`);

        res 
            .status(201)
            .location(`http://localhost:8000/bookmark/${id}`)
            .json(bookmark);

    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res) => { 
        const { id } = req.params;
        
        const newList = list.find(li => li.id == id);

        if(!newList){
            logger.error(`List with id ${id} not found.`);
            return res
                .status(404)
                .send('List not found')
        }
        res.json(newList);
    })
    .delete((req, res) => {
        const { id } = req.params;
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