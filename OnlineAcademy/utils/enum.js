const ROLE = {
    GUEST: 'guest',
    STUDENT: 'student',
    LECTURER: 'lecturer'
};

class Enum {
    static get ROLES() {
        return ROLE;
    }
}
module.exports = Enum;