const { query } = require('../models/db');
exports.findUserById = id => query('select * from user where id = ?',[id]);
exports.findUserByAccount = account => query('select * from user where account = ?',[account]);
exports.findUsers = () => query('select account,creator,password,reg_time,role_name from user order by reg_time desc');
exports.insertUser = params => query(`insert into user (creator,account,password,role_id,role_name) values ('admin',?,?,?,?)`,params)
