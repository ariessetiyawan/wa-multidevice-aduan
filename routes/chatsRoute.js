import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from './../middlewares/requestValidator.js'
import sessionValidator from './../middlewares/sessionValidator.js'
import * as controller from './../controllers/chatsController.js'
import getMessages from './../controllers/getMessages.js'
import getAutoreply from './../controllers/getAutoreply.js'
import getUsersetting from './../controllers/getUserSetting.js'

const router = Router()

router.post(
    '/send',
    query('id').notEmpty(),
    body('receiver').notEmpty(),
    body('message').notEmpty(),
    requestValidator,
    sessionValidator,
    controller.send
)
router.post('/auto-reply',  body('idgas').notEmpty(), body('sessionid').notEmpty(),requestValidator, getAutoreply)
router.post('/usersetting', body('idgas').notEmpty(),body('sessionid').notEmpty(),requestValidator, getUsersetting)
router.get('/', query('id').notEmpty(), requestValidator, sessionValidator, controller.getList)

router.get('/:jid', query('id').notEmpty(), requestValidator, sessionValidator, getMessages)



router.post('/send-bulk', query('id').notEmpty(), requestValidator, sessionValidator, controller.sendBulk)

export default router
