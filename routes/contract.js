

const router = require('koa-router')()
const { list,createFile,downloadUrl,donwloadFile } = require('../controllers/contract');

router.prefix('/contract')
.get('/list',list)
.post('/createFile',createFile)
.get('/download',downloadUrl)// 获取文件的url地址
.get('/download/:filename',donwloadFile)
module.exports = router
