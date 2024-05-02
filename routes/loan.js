const router = require('koa-router')()
const { loanList,createloan,updateLoan,deleteLoan,submitToApprove,query,mergeFiles } = require('../controllers/loan');

router.prefix('/loan')
.get('/list',loanList)
.post('/create',createloan)
.put('/update',updateLoan)
.delete('/delete/:delId',deleteLoan)
.post('/submitToApprove',submitToApprove)
.get('/query',query)
.post('/mergeFiles',mergeFiles)
module.exports = router
