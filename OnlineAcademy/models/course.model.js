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
        }
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
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from fields join course on course.fieldsId = fields.Id and fields.name = ? join lecturer on course.lecturerId = lecturer.Id join feedback on feedback.courseId = course.Id group by course.title';
        const condition = [field];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetCourseByTheme(theme) {
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from fields join course on course.fieldsId = fields.Id and fields.theme = ? join lecturer on course.lecturerId = lecturer.Id join feedback on feedback.courseId = course.Id group by course.title';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows;
    },
    async GetDetailCourseById(id) {
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from course join fields on fields.id = course.fieldsId join feedback on feedback.courseId = course.id join lecturer on lecturer.id = course.lecturerId where course.id = ? group by course.id';
        const condition = [id];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length == 0)
            return null;
        return rows[0];
    }
};