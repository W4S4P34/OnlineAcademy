﻿const { ROLES } = require('../utils/enum');
const db = require('../utils/database');


module.exports = {

    async GetAll() {
        const sql = "select * from student";
        const [rows, fields] = await db.load(sql);
    },

    async Add(user) {
        console.log("ADD USER");
        console.log(user);
        const student = {
            id: user.username,
            password: user.password,
            email: user.email,
            name: user.name,
            phone_number: user.phoneNumber
        }
        const result = await db.add(student, 'student');
        console.log(result);
    },

    async GetByID(account) {
        console.log(account.username);
        var sql = `select * from student where id = ?`;
        const condition = [account.username];
        var [rows, fields] = await db.load(sql, condition);
        if (rows.length !== 0)
            return {
                username: rows[0].id,
                password: rows[0].password,
                email: rows[0].email,
                name: rows[0].name,
                phoneNumber: rows[0].phone_number,
                role: ROLES.STUDENT
            };
        sql = `select * from lecturer where id = ?`;
        [rows, fields] = await db.load(sql, condition);
        if (rows.length === 0) {
            return null;
        }
        return {
            username: rows[0].id,
            password: rows[0].password,
            email: rows[0].email,
            name: rows[0].name,
            phoneNumber: rows[0].phone_number,
            university: rows[0].university,
            gender: rows[0].gender,
            role: ROLES.LECTURER
        }
    },

    async IsExist(account) {
        const sql = `select * from student where id = ? or email = ?`;
        const condition = [account.username,account.email];
        const [rows, fields] = await db.load(sql, condition);
        return rows.length !== 0;
    },
};
