const db = require('../utils/database');

module.exports = {
    async GetAll() {
        const sql = 'select * from course';
        const [rows, fields] = await db.load(sql);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopNewCourse(amount) {
        const sql = 'select * from course order by `date` desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopHighlightsCourse(amount) {
        const sql = 'select course.* from course join enroll on course.id = enroll.courseId group by course.title order by count(course.id) desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopEnrollFields(amount) {
        const sql = 'select course.title,count(course.id) from course join enroll on course.id = enroll.courseId group by course.title order by count(course.id) desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    }
};