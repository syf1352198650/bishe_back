const { mkPager, fileExist } = require("../utils");
const { findLoanByLimitNameStatusIn,
    countLoanByNameStatusIn,
    findLoanByLimitStatusIn,
    countLoanByStatusIn,
    findLoanById, 
    updateLoanByFields} = require('../models/loan');
const { statusFlow } = require("./approveHelper");
const path = require('path');
const fs = require('fs');
const { genContract } = require("../utils/docHelper");
const APPROVED = 5, CONTRACT = 7;


exports.list = async ctx => {
    const { pageNo, pageSize, name } = ctx.query;
    const { start, end } = mkPager(pageNo, pageSize);

    if (name) {
        var resData = await findLoanByLimitNameStatusIn(start, end, name, APPROVED, CONTRACT);
        var resCount = await countLoanByNameStatusIn(name, APPROVED, CONTRACT);
    } else {
        var resData = await findLoanByLimitStatusIn(start, end, APPROVED, CONTRACT);
        var resCount = await countLoanByStatusIn(APPROVED, CONTRACT);
    }

    const rows = resCount[0].rrows;
    const pages = Math.ceil(rows / end);

    ctx.success({
        data: {
            data: resData
        },
        rows,
        pages
    })
}
exports.createFile = async ctx => {
    // 获取请求参数
    const { id } = ctx.request.body;
    // 查询
    const loanRes = await findLoanById(id);
    if (loanRes.length === 0) {
        return ctx.faild('申请不存在!');
    }
    const originalStatus = loanRes[0].status;

    const currentStatus = statusFlow[originalStatus];
    const nextStatus = currentStatus.pass;

    if (currentStatus.v !== 5) {
        return ctx.faild('当前申请状态无法生成合同,currentStatus', currentStatus.v);
    }


    const filePath = path.join(__dirname, '../download', `contract-${id}.docx`);
    // 判断文件是否存在
    const isExist = fileExist(filePath);
    
    let fileSuccess = true;
    const info = { ...loanRes[0] };
    // g字符串内符合的条件全局匹配, i忽略大小写
    info.create_time = new Date(info.create_time).toLocaleDateString().replace(/\//g,'-');
    info.update_time = new Date(info.create_time).toLocaleDateString().replace(/\//g,'-');

    // 不存在则创建
    if (!isExist) {
        //  创建word文件
        try {
            await genContract(info, filePath);
            fileSuccess = true;
        } catch (e) {
            fileSuccess = false;
        }
    }

    if (!fileSuccess)return ctx.faild('生成合同失败！！！');
                // 变更数据状态 nextStatus.v
    const updateRes = await updateLoanByFields({status:nextStatus.v},id);
    if(updateRes.changedRows === 0) {
        return ctx.faild('更新失败');
    }
    ctx.success('文件创建成功');

}
exports.downloadUrl = async ctx => {
    const { id } = ctx.query;
    const filePath = path.join(__dirname, '../download', `contract-${id}.docx`);
    // 判断文件是否存在
    const isExist = fileExist(filePath);
  // 不存在则创建
    if (!isExist) return ctx.faild('文件不存在!');

    // download/:contract-${id}.docx
    return ctx.success({
        info:'url获取成功',
        url: `/api/contract/download/contract-${id}.docx`
    })
    
}
exports.donwloadFile = async ctx => {
    const {filename} = ctx.params;
    console.log('filename:',filename);
    const filePath = path.join(__dirname, '../download', filename);
    // 判断文件是否存在
    const isExist = fileExist(filePath);
  // 不存在则创建
    if (!isExist) return ctx.faild('文件不存在!');
    // 向客户端写文件
    const buffer = fs.readFileSync(filePath);
    return ctx.body = buffer;
}