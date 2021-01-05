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
    async GetEnrolledCourses(studentId) {
        const sql = 'select course.* from enroll join course on enroll.courseId = course.id and enroll.studentId = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
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
            courseId: courseId
        }
        return db.add(item, 'watchList');
    },
    async RemoveFromWatchList(studentId, courseId) {
        const condition = {
            studentId: studentId,
            courseId: courseId
        };
        return db.delete(condition,'watchList');
    },
    async GetWatchList(studentId) {
        const sql = 'select course.* from watchList join course on watchList.courseId = course.id and watchList.studentId = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetInfo(studentId) {
        const sql = 'select * from student where id = ?';
        const condition = [studentId];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows[0];
    }
};