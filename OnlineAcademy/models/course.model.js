const db = require('../utils/database');

module.exports = {
    async GetAllCourses() {
        const sql = 'select * from course';
        const [rows, fields] = await db.load(sql);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopNewCourses(limit) {
        const sql = 'select (@cnt := @cnt + 1) as rowNumber, course.*,subField.fieldName as fieldName,lecturer.name as lecturerName from course  cross join (SELECT @cnt := -1) AS dummy join subField on subField.id = course.subFieldId join lecturer on course.lecturerId = lecturer.id order by date desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopHighlightsCourses(limit) {
        const sql = 'select course.*,subField.fieldName as fieldName,lecturer.name as lecturerName from course join subField on subField.id = course.subFieldId join lecturer on course.lecturerId = lecturer.id order by `date` desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopEnrollFields(limit) {
        const sql = 'select distinct f.fieldName from course join enroll on course.id = enroll.courseId join subField as f on course.subFieldId = f.id group by f.name order by count(course.id) desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetAllFieldsAndTheme(fieldName = "") {
        const sql = 'select distinct subField.fieldName,count(course.id) as courseNumber from subField join course on subField.id = course.subFieldId group by subField.fieldName';
        const [rows, fields] = await db.load(sql);
        if (rows.length === 0)
            return null;
        var listFields = [];
        for (var i = 0; i < rows.length; i++) {
            
            const listTheme = await this.GetThemeByField(rows[i].fieldName);
            listFields.push({
                name: rows[i].fieldName,
                empty: listTheme.length === 0,
                listTheme: listTheme,
                courseNumber: rows[i].courseNumber,
                isActive: fieldName === rows[i].name
            })

        }
        return listFields;
    },
    async GetThemeByField(fieldName) {
        const sql = 'select name from subField where fieldName = ?';
        const condition = [fieldName];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetFieldByTheme(theme) {
        const sql = 'select fieldName from subField where subField.name = ?';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0].name;
    },
    async GetCourseByField(fieldName, limit, offset) {
        const sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price from subField join course on course.subFieldId = subField.id and subField.fieldName = ? join lecturer on course.lecturerId = lecturer.Id group by course.title order by course.view desc limit ? offset ?';
        const condition = [fieldName, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetCourseByTheme(theme,limit,offset) {
        const sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price from subField join course on course.subFieldId = subField.id and subField.name = ? join lecturer on course.lecturerId = lecturer.Id group by course.title order by course.view desc limit ? offset ?';
        const condition = [theme, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetFieldByCourse(courseId) {
        const sql = 'select `subField`.* from `subField` join course on `subField`.id = subFieldId and course.id = ?';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    async GetRelatedCourses(courseId, limit) {
        const fieldName = await this.GetFieldByCourse(courseId);
        const sql = 'select course.view,course.id,course.title,subField.fieldName as fieldName,course.imagePath,course.price,course.briefDescription,course.likes,count(enroll.studentId) as enrollNumber,lecturer.name as lecturerName from course join lecturer on lecturerId = lecturer.id join subField on subField.id = course.subFieldId join enroll on enroll.courseId = course.id where `subField`.fieldName = ? and course.id != ? group by course.id order by enrollNumber limit ?';
        const condition = [fieldName.fieldName,courseId,limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetDetailCourseById(courseId) {
        const sql = 'select course.view,course.id,course.title,subField.fieldName as fieldName,course.imagePath,course.price,DATE_FORMAT(course.date, "%m/%d/%Y") as lastUpdate,course.description,course.briefDescription,course.likes,count(enroll.studentId) as enrollNumber,course.totalHours from course join subField on subField.id = course.subFieldId join enroll on enroll.courseId = course.id left join feedback on enroll.studentId = feedback.studentId and feedback.courseId = enroll.courseId where course.id = ?';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    async GetLecturer(courseId) {
        const sql = 'select lecturer.* from lecturer join course on lecturerId = lecturer.id and course.id = ?';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    async GetSections(courseId) {
        const sql = 'select * from section where section.courseId = ?';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetFeedbacks(courseId) {
        const sql = 'select feedback.comment,DATE_FORMAT(feedback.date, "%H:%i %m/%d/%Y") as date,student.name from feedback join student on studentId = id and courseId = ?';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async CountCourseByField(fieldName) {
        const sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.fieldName = ? group by subField.fieldName';
        const condition = [fieldName];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    },
    async CountCourseByTheme(theme) {
        const sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.name = ? group by subField.name';
        const condition = [theme];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    },
    async CountCourse() {
        const sql = 'select count(id) as count from course';
        const [rows, fields] = await db.load(sql);
        return rows[0].count;
    }
};