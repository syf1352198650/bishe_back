const { mkPager, checkNullVuale, getContent } = require('../utils')
const { findLoanByLimitAndName, deleteLoanById,
    findLoanByLimit, getLoanCountByName, updateLoanByFields,
    getLoanCount, insertLoan, findLoanById } = require('../models/loan');
const { checkNullValueList } = require('./loanConfig');
const { roles, admin,
    input,
    APPROVE } = require('./config');
const { statusFlow, waitingStatus,
    nonCommit } = require('./approveHelper')
    const fs=require('fs')
    const path=require('path');

/**
 * 如果返回不为false的值，说明check出了问题
 * @param {*} type 
 * @returns 
 */
exports.checkPrivilege = (type) => {
    if (type !== admin) {
        if (type !== input) {
            return '只有销售人员和管理员有权限录入,', roles[type], '无法提交';  // 空串代表false
        }
    }
    return false;
}

exports.loanList = async ctx => {
    // 获取查询字符串参数
    let { pageNo, pageSize, name } = ctx.query;

    // 生成分页的limit条件
    const { start, end } = mkPager(pageNo, pageSize);

    if (name) {
        var dataRes = await findLoanByLimitAndName(name, start, end);
        var countRes = await getLoanCountByName(name);
    } else {
        var dataRes = await findLoanByLimit(start, end);
        var countRes = await getLoanCount();
    }
    console.log('数据:', dataRes);

    const { rrows } = countRes[0];
    const pages = Math.ceil(rrows / pageSize)
    // /100 / 30 / = 4
    return ctx.success({
        data: {
            data: dataRes
        },
        pages, // 能分成多少页
        size: pageSize,
        rrows, // 数据有多少调
    });
}


exports.createloan = async ctx => {
    // 获取请求体参数
    const { id, type } = ctx.state.user;
    // 角色功能判断

    const checkRes = exports.checkPrivilege(type);
    if (checkRes)
        return ctx.faild(checkRes)

    // 验证字段是否缺失
    const res = checkNullVuale(ctx.request.body, checkNullValueList);
    if (!res.result) {
        // res.data
        return ctx.faild(`字段【${res.field}】值不正确，值为:${res.value}`)
    }



    const addLoanRes = await insertLoan({
        ...ctx.request.body,
        user_id: id,
        creator: roles[type],
    })
    if (addLoanRes.affectedRows === 0) {
        return ctx.faild(`创建申请失败`);
    }

    ctx.success('创建申请成功')


}
exports.updateLoan = async ctx => {
    const { type } = ctx.state.user;
    const checkRes = exports.checkPrivilege(type);
    if (checkRes)
        return ctx.faild(checkRes)
    let reqData = ctx.request.body;
    const id = reqData.id;
    // 删除不能被更新的字段
    delete reqData.id;
    delete reqData.create_time;
    delete reqData.update_time;

    // 后续也可以删除如下，或者让前端不要传递
    // delete reqData.creator;
    // delete reqData.user_id;
    // delete reqData.status;


    // 获取请求体更新数据
    const updateRes = updateLoanByFields(reqData, id);
    if (updateRes.changedRows === 0) {
        return ctx.faild('更新失败')
    }

    ctx.success('更新成功！');
}
exports.deleteLoan = async ctx => {
    let { delId } = ctx.params;
    const { type } = ctx.state.user;
    const checkRes = exports.checkPrivilege(type);
    if (checkRes)
        return ctx.faild(checkRes);

    const delRes = deleteLoanById(delId);
    if (delRes.affectedRows === 0) {
        return ctx.faild('删除失败')
    }
    ctx.success('删除成功');

}
exports.submitToApprove = async ctx => {
    // 获取请求体id，查询状态，从而使用链表进行获取下一个该有的状态
    const { id } = ctx.request.body;
    const loanRes = await findLoanById(id);
    if (loanRes.length === 0) {
        return ctx.faild('当前申请不存在！');
    }
    // 获取当前状态
    const { status } = loanRes[0];
    // 判断当前状态是否可以下一步   1457waiting 
    if ([...waitingStatus, ...nonCommit].includes(status)) {
        return ctx.faild('当前流程不能继续提交:', status);
    }
    // statusFlow.pass
    let currentStatus = statusFlow[status];
    currentStatus = currentStatus.pass || currentStatus;

    // 更新当前状态
    if (status == currentStatus.v) {
        return ctx.faild('状态无法改变，提交状态相同');
    }

    const updateRes = await updateLoanByFields({ status: currentStatus.v }, id);
    if (updateRes.changedRows === 0) {
        return ctx.field('更新失败!');
    }

    // 响应状态的变更
    return ctx.success({
        info: '提交成功',
        from: status,
        to: currentStatus.v
    });
}

exports.query = async ctx => {
    const { id } = ctx.query;
    const res = await findLoanById(id);
    if (res.length === 0) {
        return ctx.faild('查询数据不存在');
    }

    ctx.success({
        info: '获取成功',
        data: res[0]
    })


}
exports.mergeFiles = async ctx => {
    // console.log(ctx.request);
    const body = ctx.request.body;
    console.log('body', body);
    const dirPath=path.join(__dirname,'../public/chunks')
    // console.log(dirPath);
    fs.readdir(dirPath,(err,files)=>{
       
        files.sort((a,b)=>{
            return a.substring(a.lastIndexOf('-')+1,a.lastIndexOf('.'))-b.substring(b.lastIndexOf('-')+1,b.lastIndexOf('.'))
           })
           console.log(files);
            if(err){
                console.log(err);
                return;

            }
            // files.forEach((filename,index)=>{
            //     let filedir=path.join(dirPath,filename);
            //     fs.stat(filedir,(err,stats)=>{
            //         if(err){
            //             throw err;
            //         }
            //         if(stats.isFile()){
            //         //    getContent(filename,body.type).then((blob)=>{
            //         //     console.log('二进制数据',blob);
            //         //     let filePath=path.join(__dirname, `../public/files/${body.filename}.${body.type}`)
            //         //     fs.appendFileSync(filePath,blob)
            //         //     console.log('上传成功',index);
            //         //    })
            //         const data=getContent(filename)
            //         console.log('二进制数据',data);
            //         let filePath=path.join(__dirname, `../public/files/${body.filename}.${body.type}`)
            //         fs.appendFileSync(filePath,data)
            //         console.log('上传成功',index);
                        
            //         }

            //         else{
            //             console.log('不是文件');
            //             return false
            //         }
            //     })
            // })
            for(let i=0;i<files.length;i++){
                let filedir=path.join(dirPath,files[i]);
               const flag=fs.statSync(filedir)
               if(flag){
                const data=getContent(files[i])
                console.log('二进制数据',data);
                let filePath=path.join(__dirname, `../public/files/${body.filename}.${body.type}`)
                fs.appendFileSync(filePath,data)
                console.log('上传成功',i);
               }
               else{
                console.log('文件不存在');
               }
            }
    })
  
   
    ctx.success({
        info: '上传成功'
    })
}