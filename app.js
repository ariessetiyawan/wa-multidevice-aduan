import 'dotenv/config'
import express from 'express'
import nodeCleanup from 'node-cleanup'
import routes from './routes.js'
import { init, cleanup,bacaAllUser,bacaAllAReply,kirimpesanTL,bacaGroupUser } from './whatsapp.js'
import cors from 'cors'
import axios from 'axios'
const app = express()
const host = process.env.HOST ?? '0.0.0.0'
const port = parseInt(process.env.PORT ?? 8000)

global.historycat=[]
global.isiautores=[]
global.settingall=[]
global.params={}
global.autoreply=0
global.autoinfo=0
global.unreadwa=process.env.UNREAD ?? false
app.use(cors())
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/', routes)

settingall=await bacaGroupUser('HEROKU')
console.log(settingall.data.rows)
const hss =await bacaAllAReply()

const listenerCallback = () => {
    init()
    console.log(`Server is listening on http://${host ? host : 'localhost'}:${port}`)
	//successlog.info(`Server is listening on http://${host ? host : 'localhost'}:${port}`);
}

if (host) {
    app.listen(port, host, listenerCallback)
} else {
    app.listen(port, listenerCallback)
}

nodeCleanup(cleanup)

export default app
