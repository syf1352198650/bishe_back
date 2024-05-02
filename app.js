const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const router = require('koa-router')()
// const index = require('./routes/index')
const user = require('./routes/user')
const permission = require('./routes/permission')
const loan = require('./routes/loan')
const approve = require('./routes/approve')
const contract = require('./routes/contract')
const session = require('koa-session');
const multer = require('@koa/multer')
const path = require('path')
const { responseHandler, checkLogin } = require('./middlewares')

// 退出后的token
app.context.blackTokenList = [];

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const store = {
  storage: {},
  set(key, session) {
    // 生成sssion内置的key
    this.storage[key] = session;
    // 也可以存储到数据库
  },
  get(key) {
    // 也可以从数据库获取
    return this.storage[key];
  },
  destroy(key) {
    delete this.storage[key];
    // 也可以数据库删除该session释放空间
  }
}
// // 102 失败 20000 成功 603:权限有问题，需要重定向
// // success   faild     tokenExpires
// exports.responseHandler = async (ctx,next) => {
//     ctx.

// 响应处理
app.context.success = function (data) {
   this.body = {
    code: 20000,
    data
  }
}
app.context.faild = function (data) {
   this.body = {
    code: 102,
    data
  }
}
app.context.tokenExpires = function(data) {
   this.body = {
    code: 603,
    data
  }
}

// 登录验证
app.use(checkLogin);

// 处理session
app.use(session({ store }, app))

// routes
// app.use(index.routes(), index.allowedMethods())

//上传文件存放路径、及文件命名
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      cb(null, path.join(__dirname ,'/public/chunks'))
  },
  filename: function (req, file, cb) {
   
      let type = file.originalname.split('.')[1]
      let filename=Buffer.from(file.originalname.split('.')[0], "latin1").toString(
        "utf8"
      );
      console.log('filename', file);
      // cb(null, `${filename}-${Date.now().toString(16)}.${type}`)
      cb(null, `${filename}.${type}`)
  }
})
//文件上传限制
const limits = {
  fields: 10,//非文件字段的数量
  fileSize: 500 * 1024,//文件大小 单位 b
  files: 1//文件数量
}
let upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024,
  },
});

router.post('/user/file', upload.single('file'), async (ctx,next)=>{
  ctx.success({
    info:'上传成功'
})
})

app.use(router.routes()).use(router.allowedMethods())
app.use(user.routes(), user.allowedMethods())
app.use(permission.routes(), permission.allowedMethods())
app.use(loan.routes(), loan.allowedMethods())
app.use(approve.routes(), approve.allowedMethods())
app.use(contract.routes(), contract.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
