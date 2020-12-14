const db = require('../utils/database');

module.exports = {
    async GetAll() {
        const sql = "select * from course";
        const [rows, fields] = await db.load(sql);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async Add(user) {
        
    },
};