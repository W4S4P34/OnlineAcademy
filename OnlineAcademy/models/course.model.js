const db = require('../utils/database');


module.exports = {
    async GetAllCourses(limit,offset, isAdmin) {
        var sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status,course.available from subField join course on course.subFieldId = subField.id and course.available = true left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id group by course.id order by course.date desc limit ? offset ?';
        const condition = [parseInt(limit), offset];
        if (!isAdmin) {
            sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status,course.available from subField join course on course.subFieldId = subField.id and course.available = true left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id and course.available = true group by course.id order by course.date desc limit ? offset ?';
        }
        const [rows, fields] = await db.load(sql,condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async CountAllCourses() {
        const sql = 'select id from course where available = true';
        const [rows, fields] = await db.load(sql);
        return rows.length;
    },
    async GetTopNewCourses(limit) {
        const sql = 'select (@cnt := @cnt + 1) as rowNumber, course.*,subField.fieldName as fieldName,lecturer.name as lecturerName,count(enroll.studentId) as numOfStudent from course  cross join (SELECT @cnt := -1) AS dummy join subField on subField.id = course.subFieldId join lecturer on course.lecturerId = lecturer.id and course.available = true left join enroll on enroll.courseId = course.id group by course.id order by date desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetMostViewCourses(limit) {
        const sql = 'select (@cnt := @cnt + 1) as rowNumber, course.*,subField.fieldName as fieldName,lecturer.name as lecturerName,count(enroll.studentId) as numOfStudent from course  cross join (SELECT @cnt := -1) AS dummy join subField on subField.id = course.subFieldId join lecturer on course.lecturerId = lecturer.id left join enroll on enroll.courseId = course.id group by course.id order by view desc limit ?';
        const condition = [limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetTopHighlightsCourses(limit) {
        const sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status from subField join course on course.subFieldId = subField.id and course.available = true left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id group by course.id order by count(studentId) desc limit ?';
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
        const sql = 'select `fields`.name as fieldName,count(course.id) as courseNumber from fields left join subField on subField.fieldName = `fields`.name left join course on subField.id = course.subFieldId and course.available = true group by `fields`.name';
        const [rows, fields] = await db.load(sql);
        if (rows.length === 0)
            return null;
        var listFields = [];
        for (var i = 0; i < rows.length; i++) {
            const listTheme = await this.GetThemeByField(rows[i].fieldName);
            listFields.push({
                name: rows[i].fieldName,
                empty: listTheme === null,
                listTheme: listTheme,
                courseNumber: rows[i].courseNumber,
                isActive: fieldName === rows[i].fieldName
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
        return rows[0].fieldName;
    },
    async GetCourseByField(fieldName, limit, offset,isAdmin = true) {
        var sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status,course.available from subField join course on course.subFieldId = subField.id and subField.fieldName = ? left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id group by course.id order by course.view desc limit ? offset ?';
        const condition = [fieldName, parseInt(limit), offset];
        if (!isAdmin) {
            sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status,course.available from subField join course on course.subFieldId = subField.id and subField.fieldName = ? left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id and course.available = true group by course.id order by course.view desc limit ? offset ?';
        }
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetCourseByTheme(theme, limit, offset, isAdmin = true) {
        var sql = 'select course.id,course.title,subField.fieldName as fieldName,lecturer.name as lecturerName,course.likes,course.imagePath,course.price,count(studentId) as numOfStudent,course.status,course.available from subField join course on course.subFieldId = subField.id and subField.name = ? left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id group by course.id order by course.view desc limit ? offset ?';
        const condition = [theme, parseInt(limit), offset];
        if (!isAdmin) {
            sql = 'select course.id, course.title, subField.fieldName as fieldName, lecturer.name as lecturerName, course.likes, course.imagePath, course.price, count(studentId) as numOfStudent, course.status, course.available from subField join course on course.subFieldId = subField.id and subField.name = ? left join enroll on enroll.courseId = course.id join lecturer on course.lecturerId = lecturer.Id and course.available = true group by course.id order by course.view desc limit ? offset ?';
        }
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
        const sql = 'select course.view,course.id,course.title,subField.fieldName as fieldName,course.imagePath,course.price,course.briefDescription,course.likes,count(enroll.studentId) as enrollNumber,lecturer.name as lecturerName from course join lecturer on lecturerId = lecturer.id join subField on subField.id = course.subFieldId left join enroll on enroll.courseId = course.id where `subField`.fieldName = ? and course.id != ? group by course.id order by enrollNumber limit ?';
        const condition = [fieldName.fieldName,courseId,limit];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetDetailCourseById(courseId) {
        const sql = 'select course.view,course.id,course.title,subField.fieldName as fieldName,course.imagePath,course.price,DATE_FORMAT(course.date, "%m/%d/%Y") as lastUpdate,course.description,course.briefDescription,course.likes,count(enroll.studentId) as enrollNumber,course.totalHours,course.status from course join subField on subField.id = course.subFieldId left join enroll on enroll.courseId = course.id left join feedback on enroll.studentId = feedback.studentId and feedback.courseId = enroll.courseId where course.id = ?';
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
        const sql = 'select feedback.comment,DATE_FORMAT(feedback.date, "%H:%i %m/%d/%Y") as date,student.name from feedback join student on studentId = id and courseId = ? order by feedback.date desc';
        const condition = [courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async CountCourseByField(fieldName, isAdmin) {
        var sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.fieldName = ? group by subField.fieldName';
        const condition = [fieldName];
        if (!isAdmin) {
            sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.fieldName = ? and course.available = true group by subField.fieldName';
        }
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    },
    async CountCourseByTheme(theme, isAdmin) {
        var sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.name = ? group by subField.name';
        const condition = [theme];
        if (!isAdmin) {
            sql = 'select count(course.id) as countTotal from course join subField on course.subFieldId = subField.id and subField.name = ? and course.available = true group by subField.name';
        }
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return 0;
        return rows[0].countTotal;
    },
    async CountCourse() {
        const sql = 'select count(id) as count from course';
        const [rows, fields] = await db.load(sql);
        return rows[0].count;
    },
    async UpdateNumberOfView(productId) {
        try {
            const sql = 'update course set view = view + 1 where id = ?';
            const condition = [productId];
            const [rows, fields] = await db.load(sql, condition);
        } catch (ignore) {}
    },
    async UpdateNumberOfLike(productId) {
        try {
            const sql = 'update course set likes = likes + 1 where id = ?';
            const condition = [productId];
            const [rows, fields] = await db.load(sql, condition);
        } catch (e) { return e; }
        return null;
    },
    async SearchByName(searchString, list) {
        const sql = "select c.*,sf.fieldName as fieldName,lecturer.name as lecturerName,count(studentId) as numOfStudent from course as c join subField as sf on sf.id = c.subFieldId join `fields` on `fields`.name = sf.fieldName join lecturer on lecturer.id = c.lecturerId left join enroll on enroll.courseId = c.id where match(c.`title`,c.`description`) against (?) and c.available = true group by c.id";
        const condition = [searchString];
        const [rows, fields] = await db.load(sql, condition);
        for (var i = 0; i < rows.length; i++) {
            list.push(rows[i]);
        }
        return list;
    },
    async SearchByField(searchString, list) {
        var sql = "select f.`name` from `fields` as f where match(f.`name`) against (?)";
        var condition = [searchString];
        const [rows, fields] = await db.load(sql, condition);
        for (var i = 0; i < rows.length; i++) {
            const course = await this.GetCourseByField(rows[i].name, 100, 0, false);
            for (var j = 0; j < course.length; j++) {
                if (list.find((value) => value.id === course[j].id) === undefined && course[j].available === true)
                    list.push(course[j]);
            }
        }
        return list;
    },
    async SearchBySubField(searchString, list) {
        var sql = "select sf.name from subField as sf where match(sf.`name`) against (?)";
        var condition = [searchString];
        const [rows, fields] = await db.load(sql, condition);
        for (var i = 0; i < rows.length; i++) {
            const course = await this.GetCourseByTheme(rows[i].name, 100, 0, false);
            if (course != null) {
                for (var j = 0; j < course.length; j++) {
                    if (list.find((value) => value.id === course[j].id) === undefined && course[j].available === true)
                        list.push(course[j]);
                }
            }
        }
        return list;
    }
};