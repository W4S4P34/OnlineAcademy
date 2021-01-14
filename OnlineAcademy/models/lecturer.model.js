const db = require('../utils/database');
const fs = require('fs');

module.exports = {
    async IsMyLecture(lecturerId,courseId){
        const sql = 'select id from course where id = ? and lecturerId = ?';
        const condition = [courseId,lecturerId];
        const [rows, field] = await db.load(sql, condition);
        return rows.length !== 0;
    },
    async GetLectures(lecturerId, limit, offset) {
        const sql = 'select course.*,subField.fieldName as fieldName,lecturer.name as lecturerName from course join subField on subFieldId = subField.id join lecturer on lecturer.id = lecturerId where lecturerId = ? limit ? offset ?';
        const condition = [lecturerId, parseInt(limit), offset];
        const [rows, field] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetLecturesSize(lecturerId) {
        const sql = 'select id from course where lecturerId = ?';
        const condition = [lecturerId];
        const [rows, field] = await db.load(sql, condition);
        return rows.length;
    },
    async IsExist(email,lecturerId) {
        const sql = 'select * from lecturer where email = ? and id != ?';
        const condition = [email,lecturerId];
        const [rows, field] = await db.load(sql, condition);
        return rows.length !== 0;
    },
    async UpdateProfile(newProfile,lecturerId) {
        try {
            const newData = {
                name: newProfile.name,
                phone_number: newProfile.phoneNumber,
                email: newProfile.email,
                university: newProfile.university
            }
            const condition = {
                id: lecturerId
            }
            await db.update(newData, condition, 'lecturer');
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdatePassword(newPassword, lecturerId) {
        try {
            const newData = {
                password: newPassword
            }
            const condition = {
                id: lecturerId
            }
            await db.update(newData, condition, 'lecturer');
        } catch (e) {
            return e;
        }
        return null;
    },
    async AddCourse(newCourse,lecturerId,courseId,date) {
        try {
            const subFieldId = await this.GetFieldId(newCourse.field, newCourse.subField);
            const newData = {
                subFieldId: subFieldId,
                title: newCourse.courseName,
                lecturerId: lecturerId,
                description: newCourse.description,
                briefDescription: newCourse.shortDescription,
                price: newCourse.price,
                status: newCourse.status,
                imagePath: `/resource/public/course/${courseId}/photo.png`,
                date: date
            }
            await db.add(newData, 'course');
            
        } catch (e) {
            return e;
        }
        return null;
    },
    async GetFieldId(fieldName,subFieldName) {
        const sql = 'select id from subField where fieldName = ? and name = ?';
        const condition = [fieldName,subFieldName];
        const [rows, field] = await db.load(sql, condition);
        return rows[0].id;
    },
    async AddSections(courseId, lectureName) {
        if (courseId && lectureName === undefined)
            return null;
        try {
            for (var i = 0; i < lectureName.length; i++) {
                const path = `/resource/public/course/${courseId}/preview/${i + 1}.mp4`;
                const preview = fs.existsSync(path) === true ? path : null;
                const newData = {
                    id: (i + 1),
                    title: lectureName[i],
                    videoPath: `/resource/private/course/${courseId}/${i + 1}.mp4`,
                    courseId: courseId,
                    preview: preview
                }
                await db.add(newData, 'section');
            }
        } catch (e) {
            return e;
        }
        return null;
    },
    async InsertAndUpdateSection(courseId, sectionId, lectureName, preview, videoPath) {
        console.log("Insert and Update section: " + courseId + " " + sectionId + " " + lectureName + " " + preview + " " + videoPath);
        try {
            const sql = `insert into section (id,title,videoPath,courseId,preview) values(?,?,?,?,?) on duplicate key update title = ?,videoPath = ?,preview = ?`;
            const condition = [parseInt(sectionId), lectureName, videoPath, parseInt(courseId), preview, lectureName, videoPath, preview];
            await db.load(sql,condition);
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdateDetail(detail,courseId,date) {
        try {
            const subFieldId = await this.GetFieldId(detail.field, detail.subField);
            const newData = {
                title: detail.courseName,
                subFieldId: subFieldId,
                description: detail.description,
                briefDescription: detail.shortDescription,
                price: detail.price,
                status: detail.status,
                date: date
            }
            const condition = {
                id: courseId
            }
            await db.update(newData, condition, 'course');
        } catch (e) {
            return e;
        }
        return null;
    }
};