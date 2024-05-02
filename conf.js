exports.db = {
    connectionLimit: 10,
    host: 'localhost',
    user: 'approve',
    password: 'approve123456_',
    database: 'approve'
}
exports.secret = 'jindu520';
exports.tokenExpires = 60 * 3;
exports.whiteList = [
    '/user/login','/user/logout'
];