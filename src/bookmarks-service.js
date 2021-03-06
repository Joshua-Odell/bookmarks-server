const BookmarksService = {
    getAllBookmarks(knex){
        return knex.select('*').from('bookmarks_list')
    },
    createBookmark(knex, newBookmark){
        return knex
            .insert(newBookmark)
            .into('bookmarks_list')
            .returning('*')
            .then(rows => {
                return rows[0]
            })
    },
    getById(knex, id){
        return knex.from('bookmarks_list').select('*').where('id', id).first()
    },
    deleteBookmark(knex, id){
        return knex('bookmarks_list')
            .where({ id })
            .delete()
    },
    updateBookmark(knex, id, newBookmark){
        return knex('bookmarks_list')
            .where({id})
            .update(newBookmark)
    },
}

module.exports = BookmarksService