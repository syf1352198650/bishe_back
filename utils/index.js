var jwt = require('jsonwebtoken');
const { secret, tokenExpires } = require('../conf')

exports.createToken = user => {
    return jwt.sign(user, secret, {
        expiresIn: tokenExpires
    });
}

exports.vertifyToken = token => {
    try {
        var decoed = jwt.verify(token, secret);
    } catch (e) { }
    finally {
        return decoed;
    }
}
exports.getUser = token => {
    return jwt.decode(token, secret);
}
exports.mkPager = (pageNo, pageSize) => {
    // pageNo当前页:1   pageSize显示多少:5
    // select * from loan limit 0,5
    // 1 => 0  5的零倍   （当前页1 - 1）= 0
    // 2 => 5  5的一倍   （当前页2 - 1）= 1
    // 3 => 10 5的二倍   （当前页3 - 1）= 2
    pageSize = parseInt(pageSize);
    return {
        start: (pageNo - 1) * pageSize,
        end: pageSize
    }



}

exports.checkNullVuale = (obj, checkList) => {
    // checkList.every(field=>{
    //     // 检查obj的字段
    //     if(obj[field] === undefined || obj[field] === null || obj[field] === '')return false;
    //     return true;
    // })

    for (let field of checkList) {
        // 检查obj的字段
        if (obj[field] === undefined || obj[field] === null || obj[field] === '') {
            return {
                result: false,
                field,
                value: obj[field]

            }
        }
    }
    return {
        result: true
    }

}
const fs = require('fs');
const path = require('path');
exports.fileExist = filePath => {
    try {
        fs.accessSync(filePath);
        console.log('文件不存在');
        return true;
    } catch(e) {
        console.log('文件不存在');
        return false;
    }
}
// exports.getContent=(name)=>{
//     return new Promise((resolve, reject) => {
//         // console.log(`../public/chunks/${name}`);
       
//         const filePath=path.join(__dirname,'../public/chunks',name)
//         console.log('文件路径',filePath);
//         try {
//             if(fs.existsSync(filePath)){
//                 console.log('文件存在');
//             }
//         } catch (error) {
//            console.log('文件不存在'); 
//         }
//         // fs.readFile(filePath, function (err, data) {
//         //     // const dataStr = data.toString();
//         //     // console.log('二进制数据',data);
//         //     resolve(data);
//         //     if (err) reject(err);
//         // });
//        const data= fs.readFileSync(filePath)
//        resolve(data)
//     });
// }
exports.getContent=(name)=>{
   
        // console.log(`../public/chunks/${name}`);
       
        const filePath=path.join(__dirname,'../public/chunks',name)
        console.log('文件路径',filePath);
        try {
            if(fs.existsSync(filePath)){
                console.log('文件存在');
            }
        } catch (error) {
           console.log('文件不存在'); 
        }
        // fs.readFile(filePath, function (err, data) {
        //     // const dataStr = data.toString();
        //     // console.log('二进制数据',data);
        //     resolve(data);
        //     if (err) reject(err);
        // });
       const data= fs.readFileSync(filePath)
       return data
   
}