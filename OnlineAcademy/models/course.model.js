const db = require('../utils/database');
const e = require('express');

module.exports = {
    async GetAllCourses() {
        const sql = 'select * from course';
        const [rows, fields] = await db.load(sql);
        console.log(rows);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopNewCourses(limit) {
        const sql = 'select (@cnt := @cnt + 1) as rowNumber, course.*,fields.name as fieldName,lecturer.name as lecturerName from course  cross join (SELECT @cnt := 0) AS dummy join fields on fields.id = course.fieldsId join lecturer on course.lecturerId = lecturer.id order by `date` desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopHighlightsCourses(limit) {
        const sql = 'select course.*,fields.name as fieldName,lecturer.name as lecturerName from course join fields on fields.id = course.fieldsId join lecturer on course.lecturerId = lecturer.id order by `date` desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopEnrollFields(limit) {
        const sql = 'select f.name from course join enroll on course.id = enroll.courseId join fields as f on course.fieldsId = f.Id group by f.name order by count(course.id) desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        console.log(rows);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetAllFieldsAndTheme(fieldName = "") {
        const sql = 'select distinct name,count(course.id) as courseNumber from fields join course on fields.id = course.fieldsId group by fields.name';
        const [rows, fields] = await db.load(sql);
        if (rows.length === 0)
            return null;
        var listFields = [];
        for (var i = 0; i < rows.length; i++) {
            const listTheme = await this.GetThemeByField(rows[i].name);
            listFields.push({
                name: rows[i].name,
                empty: listTheme.length === 0,
                listTheme: listTheme,
                courseNumber: rows[i].courseNumber,
                isActive: fieldName === rows[i].name
            })

        }
        return listFields;
    },
    async GetThemeByField(fieldName) {
        const sql = 'select theme from fields where name = ?';
        const condition = [fieldName];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetFieldByTheme(theme) {
        const sql = 'select name from fields where fields.theme = ?';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0].name;
    },
    async GetCourseByField(fieldName, limit, offset) {
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from fields join course on course.fieldsId = fields.Id and fields.name = ? join lecturer on course.lecturerId = lecturer.Id join feedback on feedback.courseId = course.Id group by course.title order by course.view desc limit ? offset ?';
        const condition = [fieldName, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetCourseByTheme(theme,limit,offset) {
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from fields join course on course.fieldsId = fields.Id and fields.theme = ? join lecturer on course.lecturerId = lecturer.Id join feedback on feedback.courseId = course.Id group by course.title order by course.view desc limit ? offset ?';
        const condition = [theme, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetDetailCourseById(id) {
        const sql = 'select course.id,course.title,fields.name as fieldName,lecturer.name as lecturerName,round(avg(feedback.star),1) as star,count(feedback.star) as rateNumber,course.imagePath,course.price from course join fields on fields.id = course.fieldsId join feedback on feedback.courseId = course.id join lecturer on lecturer.id = course.lecturerId where course.id = ? group by course.id';
        const condition = [id];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    async CountCourseByField(fieldName) {
        const sql = 'select count(course.id) as countTotal from course join fields on course.fieldsId = fields.id and fields.name = ? group by fields.name';
        const condition = [fieldName];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    },
    async CountCourseByTheme(theme) {
        const sql = 'select count(course.id) as countTotal from course join fields on course.fieldsId = fields.id and fields.theme = ? group by fields.theme';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    }
};