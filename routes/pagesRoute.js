import { Router } from 'express'
import { body, query } from 'express-validator'
import requestValidator from './../middlewares/requestValidator.js'
import sessionValidator from './../middlewares/sessionValidator.js'
import * as controller from './../controllers/chatsController.js'
import getMessages from './../controllers/getMessages.js'
import * as url from 'url';
import path  from 'path'

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(import.meta.url)


console.log(__filename);
console.log(__dirname);

const router = Router()

router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../pages/index.html'))
  //res.sendFile( './../pages/index.html')
})


export default router
