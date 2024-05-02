const { findUserById,findUserByAccount,findUsers,insertUser } = require('../models/user');
const { createToken,
    vertifyToken,
    getUser} = require('../utils');
const { admin,roles } = require('./config');
exports.doLogin = async (ctx,next) => {

        // Controller
        // 1. 获取
        let {account,password} = ctx.request.body;
        // 业务判断
      
        if (!account || !password) {
          return ctx.faild('必须传递用户名和密码');
        }
      
        // 查询用户的信息 Model
        const res = await findUserByAccount(account);

        if (res.length === 0) {
            return ctx.faild('用户名或者密码不存在')
        }
        
        let user = res[0];
        if (user.password != password) {
            return ctx.faild('用户名或者密码不存在');
        }
        const saveUser = {
            id:user.id,
            account:user.account,
            // 权限
            type:user.role_id
        }

        // 生成token
        const token = createToken(saveUser);
        // V:View视图   token
        ctx.success({
            token
        });
}
exports.getInfo = async ctx => {
   const user = ctx.state.user;
   if (!user) return ctx.faild('用户信息获取失败!');
   const {id} = user;
   const res = await findUserById(id);
   const dbUser = res[0];

   if (!dbUser)return ctx.faild('用户信息不存在,或者已经被删除');

   ctx.success({
       info:'获取成功！',
       roles:[{ name:dbUser.role_name}]
   });
}
exports.logout = async ctx => {
    // 如果你是session
    // ctx.session.user = null; // session退出
    ctx.blackTokenList.push(ctx.headers.token);
    return ctx.tokenExpires('退出成功');
}
exports.queryList = async ctx => {
    // 开始查询数据
    const res = await findUsers();
    return ctx.success(res);
}
exports.createUser = async ctx => {
    // 只能是admin
    const {type} = ctx.state.user;
    if (type != admin) {
        return ctx.faild('无权限创建用户')
    }

    const { account,password,role_id } = ctx.request.body;
    const role_name = roles[role_id];

    const insertRes = await insertUser([account,password,role_id,role_name]);
    // console.log(insertRes.affectedRows,'insertRes.affectedRows');
    if (insertRes.affectedRows !== 1) {
        return ctx.faild('新增数据失败');
    }

    ctx.success('新增数据成功')



}