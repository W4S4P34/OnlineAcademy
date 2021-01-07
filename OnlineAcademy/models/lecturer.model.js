const db = require('../utils/database');

module.exports = {
    async IsMyLecture(lecturerId,courseId){
        const sql = 'select id from course where id = ? and lecturerId = ?';
        const condition = [courseId,lecturerId];
        const [rows, field] = await db.load(sql, condition);
        return rows.length !== 0;
    },
    async GetLectures(lecturerId, limit, offset) {
        const sql = 'select course.*,fields.name as fieldName,lecturer.name as lecturerName from course join fields on fieldsId = fields.id join lecturer on lecturer.id = lecturerId where lecturerId = ? limit ? offset ?';
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
    }
};