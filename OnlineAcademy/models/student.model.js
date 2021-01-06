const db = require('../utils/database');
module.exports = {
    async IsEnrolled(studentId, courseId) {
        const sql = 'select * from enroll where studentId = ? and courseId = ?';
        const condition = [studentId, courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return false;
        return true;
    },
    async GetEnrolledCourses(studentId, limit, offset) {
        const sql = 'select course.*,`fields`.name as fieldName,lecturer.name as lecturerName from enroll join course on enroll.courseId = course.id and enroll.studentId = ? join `fields` on `fields`.id = fieldsId join lecturer on lecturer.id = lecturerId limit ? offset ?';
        const condition = [studentId, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetEnrolledCoursesSize(studentId){
        const sql = 'select * from enroll where studentId = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        return rows.length;
    },
    async BuyNow(studentId, courseId, date) {
        const entity = {
            studentId: studentId,
            courseId: courseId,
            date: date
        }
        try {
            await db.add(entity, 'enroll');
        } catch (e) {
            return e;
        }
        return null;
    },
    AddToCart(cart, item) {
        cart.push(item);
    },
    RemoveFromCart(cart, id) {
        return cart.filter((value) => {
            return value.id.toString() !== id;
        })
    },
    IsInCart(cart, id) {
        console.log(cart, id);
        return cart.findIndex(value => value.id.toString() === id) !== -1;
    },
    async IsInWatchList(studentId, courseId) {
        const sql = 'select * from watchList where studentId = ? and courseId = ?';
        const condition = [studentId, courseId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return false;
        return true;
    },
    async AddToWatchList(studentId, courseId) {
        if (await this.IsInWatchList(studentId, courseId))
            return;
        const item = {
            studentId: studentId,
            courseId: parseInt(courseId)
        }
        return db.add(item, 'watchList');
    },
    async RemoveFromWatchList(studentId, courseId) {
        const sql = 'delete from watchList where studentId = ? and courseId = ?';
        const condition = [studentId, parseInt(courseId)];
        const result = db.load(sql, condition);
        console.log(result);
    },
    async GetWatchList(studentId, limit, offset) {
        const sql = 'select course.*,`fields`.name as fieldName,lecturer.name as lecturerName from watchList join course on watchList.courseId = course.id and watchList.studentId = ? join `fields` on `fields`.id = fieldsId join lecturer on lecturer.id = lecturerId limit ? offset ?';
        const condition = [studentId, parseInt(limit), offset];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetWatchListSize(studentId) {
        const sql = 'select * from watchList where studentId = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        return rows.length;
    },
    async GetInfo(studentId) {
        const sql = 'select * from student where id = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    },
    async UpdateProfile(studentId,name,phoneNumber,email) {
        try {
            const newData = {
                name: name,
                phone_number: phoneNumber,
                email: email
            }
            const condition = {
                id: studentId
            }
            await db.update(newData, condition, 'student');
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdatePassword(studentId, newPassword) {
        try {
            const newData = {
                password: newPassword
            }
            const condition = {
                id: studentId
            }
            const result = await db.update(newData, condition, 'student');
            console.log(result);
        } catch (e) {
            return e;
        }
        return null;
    }
};