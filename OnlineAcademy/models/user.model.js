var ROLE = {
    GUEST: 'guest',
    STUDENT: 'student',
    LECTURER: 'lecturer'
}

const db = require('../utils/database');


module.exports = {

    async GetAll() {
        const sql = "select * from student";
        const [rows, fields] = await db.load(sql);
        console.log(rows);
        
    },

    async Add(user) {
        console.log("ADD USER");
        console.log("ID: " + user.username);
        console.log("Password: " + user.password);
        console.log("Email: " + user.email);
        const student = {
            id: user.username,
            password: user.password,
            email: user.email,
            name: "Student"
        }
        const result = await db.add(student, 'student');
        console.log(result);
    },

    async GetByID(account) {
        console.log(account.username);
        const sql = `select * from student where id = ?`;
        const condition = [account.username];
        const [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return {
            username: rows[0].id,
            password: rows[0].password,
            email: rows[0].email,
            name: rows[0].name,
            phoneNumber: rows[0].phone_number,
            gender: rows[0].gender
        };
    },

    async IsExist(account) {
        const sql = `select * from student where id = ? or email = ?`;
        const condition = [account.username,account.email];
        const [rows, fields] = await db.load(sql, condition);
        return rows.length != 0;
    },
};
