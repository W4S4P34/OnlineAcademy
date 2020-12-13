const mysql = require('mysql2');
const mysql_opts = require('../config/default.json').mysql_config;

const pool = mysql.createPool(mysql_opts);
const promisePool = pool.promise();

module.exports = {
    load(sql, condition) {
        console.log(condition);
        return promisePool.query(sql,condition);
    },
    add(entity, tableName) {
        const sql = `insert into ${tableName} set ?`;
        return promisePool.query(sql, entity);
    }
};