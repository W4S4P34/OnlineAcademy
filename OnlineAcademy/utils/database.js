const mysql = require('mysql2');
const mysql_opts = require('../config/default.json').mysql_config;

const pool = mysql.createPool(mysql_opts);
const promisePool = pool.promise();

module.exports = {
    load(sql, condition) {
        console.log("load condition: " + condition);
        return promisePool.query(sql,condition);
    },
    add(entity, tableName) {
        console.log("add item: " + entity);
        const sql = `insert into ${tableName} set ?`;
        return promisePool.query(sql, entity);
    },
    delete(condition, tableName) {
        console.log("delete condition: " + condition);
        const sql = `delete from ${tableName} where ?`;
        return promisePool.execute(sql, condition);
    },
    update(newData, condition, tableName) {
        const sql = `update ${tableName} set ? where ?`;
        return promisePool.query(sql, [newData, condition]);
    }
};