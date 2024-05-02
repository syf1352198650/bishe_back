const router = require('koa-router')()
const { list,approve } = require('../controllers/approve');

router.prefix('/approve')
// .get('/:type/list',list) // ctx.params.type  需要过多的处理非法的type，用户url
.get('/first/list',list.first)
.get('/end/list',list.end)


.post('/first/pass',approve.first.pass)
.post('/first/reject',approve.first.reject)
.post('/end/pass',approve.end.pass)
.post('/end/reject',approve.end.reject)
module.exports = router
