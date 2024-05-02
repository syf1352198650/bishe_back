
const { whiteList } = require('../conf');
const { vertifyToken,getUser } = require('../utils');


exports.checkLogin = async (ctx,next) =>{
    // 非登录、退出
    // 需要检查的
    console.log('url:',ctx.url);
    if (!whiteList.includes(ctx.url) ) {
        const { token } = ctx.headers;
        let tokenIndex = ctx.blackTokenList.indexOf(token);  
        // 验证token
        if (!vertifyToken(token)) {
            // 弹出这个元素,不允许访问，重新获取token
            ctx.blackTokenList.splice(tokenIndex,1);
            return ctx.tokenExpires('无效token,请登录再试！');
        } else {
            // 黑名单: 退出后的token
            if (tokenIndex !== -1){
                // ctx.blackTokenList.splice(tokenIndex,1);
                return ctx.tokenExpires('token已经失效');
            }
              
             // 解析token并存储到ctx的上面, ctx.state 本次请求的共享数据
            ctx.state.user = getUser(token);
        }
    }

    await next();

} 