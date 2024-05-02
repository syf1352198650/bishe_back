var mysql = require('mysql');
const { db } = require('../conf');
var pool = mysql.createPool(db);


exports.query = function(sql,params=[]) {
 
 if (!params) {
     console.log('当前查询参数没有值，请查看db.js:14',params);
 }

 return new Promise((resolve,reject)=>{
    pool.getConnection(function (err, connection) {
        if (err) throw err; // not connected!
    
        // Use the connection
        connection.query(sql,params, function (error, results, fields) {
            // 调试log
            // console.log(`${sql}==>${params}=数据=>${results}`);
            connection.release();
            // Handle error after the release.
            if (error) {
                console.log('db出现异常:',error)
                return reject(error)
            }
            resolve(results);
    
            // Don't use the connection here, it has been returned to the pool.
        });
    });


 });



}