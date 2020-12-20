const db = require('../utils/database');
const e = require('express');

module.exports = {
    async GetAllCourses() {
        const sql = 'select * from course';
        const [rows, fields] = await db.load(sql);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopNewCourses(amount) {
        const sql = 'select * from course order by `date` desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopHighlightsCourses(amount) {
        const sql = 'select course.* from course join enroll on course.id = enroll.courseId group by course.title order by count(course.id) desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetTopEnrollFields(amount) {
        const sql = 'select f.name from course join enroll on course.id = enroll.courseId join fields as f on course.fieldsId = f.Id group by f.name order by count(course.id) desc limit ?';
        const condition = [amount];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetAllFields() {
        const sql = 'select distinct name from fields';
        const [rows, fields] = await db.load(sql);
        if (rows.length == 0)
            return null;
        var listCourseFields = [];
        for (var i = 0; i < rows.length; i++) {
            const tmp = await this.GetThemeByField(rows[i].name);
            listCourseFields.push({
                name: rows[i].name,
                empty: tmp == null,
                listTheme: tmp
            })
            console.log(listCourseFields[i].listTheme);
        }
        console.log(listCourseFields);
        return listCourseFields;
    },
    async GetThemeByField(name) {
        const sql = 'select theme from fields where name = ?';
        const condition = [name];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetCourseByField(field) {
        const sql = 'select course.* from fields join course on course.fieldsId = fields.Id and name = ?';
        const condition = [field];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetCourseByTheme(theme) {
        const sql = 'select course.* from fields join course on course.fieldsId = fields.Id and fields.theme = ?';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows;
    },
};