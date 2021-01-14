const db = require('../utils/database');

module.exports = {
    async RemoveField(fieldName) {
        try {
            var sql = 'delete from fields where name = ?';
            const condition = [fieldName];
            await db.load(sql, condition);
            var sql = 'delete from subField where fieldName = ?';
            await db.load(sql, condition);
        } catch (e) {
            return e;
        }
        return null;
    },
    async RemoveSubField(subFieldName) {
        try {
            const sql = 'delete from subField where name = ?';
            const condition = [subFieldName];
            await db.load(sql, condition);
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdateSubField(preSubFieldName,subFieldName) {
        try {
            const newData = {
                name: subFieldName
            }
            const condition = {
                name: preSubFieldName
            }
            await db.update(newData, condition, 'subField');
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdateField(preFieldName,fieldName) {
        try {
            var newData1 = {
                name: fieldName
            }
            var condition1 = {
                name: preFieldName
            }
            await db.update(newData1, condition1, 'fields');
            var newData2 = {
                fieldName: fieldName
            }
            var condition2 = {
                fieldName: preFieldName
            }
            await db.update(newData2, condition2, 'subField');
        } catch (e) {
            return e;
        }
        return null;
    },
    async AddNewField(fieldName) {
        try {
            const newData = {
                name: fieldName
            }
            await db.add(newData, 'fields');
        } catch (e) {
            return e;
        }
        return null;
    },
    async AddNewSubField(subFieldName,fieldName) {
        try {
            for (var str of subFieldName) {
                const newData = {
                    fieldName: fieldName,
                    name: str
                }
                await db.add(newData, 'subField');
            }
        } catch (e) {
            return e;
        }
        return null;
    },
    async GetAllStudentSize() {
        const sql = 'select id from student';
        const [rows, field] = await db.load(sql);
        return rows.length;
    },
    async GetAllStudent(limit,offset) {
        const sql = 'select * from student limit ? offset ?';
        const condition = [parseInt(limit), offset];
        const [rows, field] = await db.load(sql, condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async GetAllLecturerSize() {
        const sql = 'select id from lecturer';
        const [rows, field] = await db.load(sql);
        return rows.length;
    },
    async GetAllLecturer(limit, offset) {
        const sql = 'select * from lecturer limit ? offset ?';
        const condition = [parseInt(limit), offset];
        const [rows, field] = await db.load(sql,condition);
        if (rows.length === 0)
            return null;
        return rows;
    },
    async UpdateStudentAccount(id,block) {
        try {
            var newData = {
                block: block
            }
            var condition = {
                id: id
            }
            await db.update(newData, condition, 'student');
        } catch (e) {
            return e;
        }
        return null;
    },
    async UpdateLecturerAccount(id, block) {
        console.log(typeof (block));
        console.log(block);
        try {
            var newData = {
                block: block
            }
            var condition = {
                id: id
            }
            await db.update(newData, condition, 'lecturer');
        } catch (e) {
            return e;
        }
        return null;
    }
};