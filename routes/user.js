const router = require('koa-router')()
const { doLogin,getInfo,logout,queryList } = require('../controllers/user');

router.prefix('/user')
.post('/login',doLogin)
.get('/info',getInfo)
.post('/logout',logout)
.get('/list',queryList)
module.exports = router
