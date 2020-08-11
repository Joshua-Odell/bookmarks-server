const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarkArray } = require('./bookmarks.fixtures')
const supertest = require('supertest')

let db

const testBookmarks = makeBookmarkArray()

before('Make knex instance', () => {
    db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
})

after('disconnect from db', () => db.destroy())

before('clean the table', () => db('bookmarks_list').truncate())

afterEach('cleanup', () => db('bookmarks_list').truncate())

describe('/bookmarks', function() {
    context('content in list', () => {
        beforeEach('add content', () => {
            return db
                .into('bookmarks_list')
                .insert(testBookmarks)
        })
        it('GET /bookmarks E. 200, All Items', () => {
            return supertest(app)
                .get('/articles')
                .expect(200, testBookmarks)
        })
    })
    context('No content', () =>{
        it('E. 200, empty list', () => {
            return supertest(app)
                .get('articles')
                .expect(200, [])
        })
    })
})

describe('/bookmarks/:bookmarkId', function() {
    context('content in list', () => {
        beforeEach('add content', () => {
            return db
                .into('bookmarks_list')
                .insert(testBookmarks)
        })
        it('GET /bookmarks:bookmarkId E. 200, requested item', () => {
            const bookmarkId = 1
            const expectedBookmark = testBookmarks[bookmarkId - 1]
            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .expect(200, expectedBookmark)
        })
    })
    context('No content', () => {
        it(`E. 404`, () => {
            const bookmarkId = 123456
            return supertest(app)
                .get(`/bookmarks/${bookmarkId}`)
                .expect(404, {error: {message: `Bookmark Not Found`}})
        })
    })
})