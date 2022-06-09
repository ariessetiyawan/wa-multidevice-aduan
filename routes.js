import { Router} from 'express'
import sessionsRoute from './routes/sessionsRoute.js'
import chatsRoute from './routes/chatsRoute.js'
import groupsRoute from './routes/groupsRoute.js'
import pagesRoute from './routes/pagesRoute.js'
import response from './response.js'
import * as url from 'url';
import path  from 'path'
import express from 'express';
import multer from 'multer';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
const __filename = url.fileURLToPath(import.meta.url)
const upload = multer({dest: __dirname + '/pages/uploads'});
const router = Router()


router.use(express.static(path.join(__dirname, '/pages')));
router.use('/',pagesRoute)
router.post('/upload', upload.single('photo'), (req, res) => {
    if(req.file) {
        res.json(req.file);
    }
    else throw 'error';
});
router.use('/sessions', sessionsRoute)
router.use('/chats', chatsRoute)
router.use('/groups', groupsRoute)

router.all('*', (req, res) => {
    response(res, 404, false, 'The requested url cannot be found.')
})

export default router
