const { query } = require('../models/db');
const qTable = `select * from loan `, orderBy = ` order by create_time desc `, limit = ` limit ?,? `,inStr = ' status in (?,?)',
qCount = 'select count(*) as rrow from loan ';
exports.findLoanByLimitAndName = (name, start, end) => query(qTable + ` where name like ? ` + orderBy + limit, [`%${name}%`, start, end]);
exports.findLoanByLimit = (start, end) => query(qTable + orderBy + limit, [start, end]);
exports.getLoanCountByName = name => query(`select count(*) as rrows from loan where name like ? `,[`%${name}%`])
exports.getLoanCount = ()=> query(`select count(*) as rrows from loan `);
exports.insertLoan = obj => {
    let keys = Object.keys(obj);
    return query(`insert into loan (${ keys.join(',') }) values ( ${new Array(keys.length).fill('?').join(',')  })`,Object.values(obj))
}
exports.updateLoanByFields = (fileds,id) => {
    let keys = Object.keys(fileds);
    let values = Object.values(fileds);
    return query(`update loan set update_time = now(), ${ keys.join('=?,') + '=? '  } where id = ?`,[...values,id])
}
exports.deleteLoanById = id => query('delete from loan where id = ?',[id]);
exports.findLoanById = id => query(`select * from loan where id = ?`,[id])


exports.findLoanByLimitAndFields = (start,end,fields) => {
    let keys = Object.keys(fields);
    let values = Object.values(fields);
    return query(`select * from loan where ${keys.join('= ? and ') + '=? '} limit ?,?`,[...values,start,end])
}
exports.countLoanByFields = (fields) => {
    let keys = Object.keys(fields);
    let values = Object.values(fields);
    return query(`select count(*) as rrows from loan where ${keys.join('= ? and ') + '=? '}`,values)
}
exports.findLoanByLimitNameStatusIn = (start,end,name,in1,in2)=> query(`${qTable} where name like ? and ${inStr} ${limit}`,[`%${name}%`,in1,in2,start,end])
exports.countLoanByNameStatusIn = (name,in1,in2)=> query(`${qCount} where name like ? and ${inStr}`,[`%${name}%`,in1,in2])
exports.findLoanByLimitStatusIn = (start,end,in1,in2)=> query(`${qTable} where ${inStr} ${limit}`,[in1,in2,start,end])
exports.countLoanByStatusIn = (in1,in2)=> query(`${qCount} where ${inStr}`,[in1,in2])

