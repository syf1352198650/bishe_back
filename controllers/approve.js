const { findLoanByLimitAndName, findLoanById, updateLoanByFields } = require("../models/loan");
const { mkPager } = require("../utils");
const { findLoanByLimitAndFields,
    countLoanByFields } = require('../models/loan');
const { f_approve,s_approve, admin } = require("./config");
const { statusFlow } = require("./approveHelper");


exports.list = function (isFirst) {
    return async ctx => {
        // 1. 获取路由参数 pageNo,pageSize,name?
        const { pageNo, pageSize, name } = ctx.query;
        const { start, end } = mkPager(pageNo, pageSize)
        // 2. 查询数据 初审:1 终审:4 status
        const status = isFirst ? 1 : 4;
        if (name) {
            var res = await findLoanByLimitAndFields(start, end, { name, status });
            var countRes = await countLoanByFields({ name, status });
        } else {
            var res = await findLoanByLimitAndFields(start, end, { status });
            var countRes = await countLoanByFields({ status });
        }
        // 3. 返回数据
        const rows = countRes[0].rrows; //  共多少条
        const pages = Math.ceil(rows / end); //  共多少页
        ctx.success({
            data: {
                data: res
            },
            pages,
            rows
        })


    }
}


exports.doApprove = function(isPassed) {
    return async ctx => {
        // 更新状态之前 检查当前角色是否可以审批
        const { type } = ctx.state.user;
        if (!(type == f_approve || type == admin) || type ==s_approve) {
            return ctx.faild('当前登录用户无权审批！');
        }

        // 获取路由参数
        const params = ctx.request.body;
        const loanId = params.appId || params.loanId;

        // 查询申请状态
        const loanRes = await findLoanById(loanId);
        if (loanRes.length === 0) return ctx.faild('申请不存在!');

        const loan = loanRes[0];
        const originalStatus = loan.status;

        // 走流程
        let currentStatus = statusFlow[originalStatus];
        // 下一步        
        let nextStatus = currentStatus[isPassed?'pass':'reject'];
        // 对比
        if ((currentStatus && currentStatus.v) === (nextStatus && nextStatus.v)) {
            return ctx.faild('申请状态未发生改变')
        }
        // 更新数据库状态
        const updateRes = await updateLoanByFields({ status:nextStatus.v},loanId);
        if (updateRes.changedRows === 0) {
            return ctx.faild('状态未发生改变')
        }

        ctx.success({
            info:'更新审批状态成功',
            from:originalStatus,
            to:nextStatus.v
        });


    }
}

exports.approve = {
    first:{},
    end:{}
}
exports.approve.first.pass = exports.approve.end.pass = exports.doApprove(true);
exports.approve.first.reject =exports.approve.end.reject = exports.doApprove(false);

exports.list.first = exports.list(true);
exports.list.end = exports.list(false);
