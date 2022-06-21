'use strict';

import 'dotenv/config'
import express from 'express'
import nodeCleanup from 'node-cleanup'
import routes from './routes.js'
import { init,bacaautoresponse,updateEnv,setEnvValue, cleanup,isSessionExists, createSession, getSession, deleteSession,createSessionP,sendMessage } from './whatsapp.js'
import { Server } from "socket.io";
import http from 'http';
import session from 'express-session';
import cron	 from 'node-cron';
import moment from "moment-timezone";
import axios from "axios";

let IDGAS='';
let sessionA='';
global.historycat=[]
global.isiautores=[]
global.autoreply=process.env.AUTOREPLY ?? false;
const app = express()
const host = process.env.HOST ?? '127.0.0.1'
const port = parseInt(process.env.PORT ?? 8000)
const httpServer = http.createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } });
IDGAS=process.env.IDGAS
global.socketwa=io;
global.unreadwa=process.env.UNREAD ?? false
io.on('connection', (socket) => {
    //console.log('a user connected');
	io.emit('info_setting');   
	socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('message', (message) =>     {
        //console.log(message);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
    });
	socket.on('setting_form', (message) =>     {
        //console.log(message);
        //io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
		IDGAS=message['idgas']
		let SESSIONA=message['sessionid']
		let IDSHEET=message['idsheet']
		let URLADUAN=message['urlduan']
		let URLAPP=message['urlapp']
		let BACKSESSION=message['backup']
		const envUpdate = {
						'SESSIONSNAME': BACKSESSION,
						'PHONENUMBER': SESSIONA,
						'IDGAS':IDGAS,
						'BACKSESSION':BACKSESSION,
						'URLAPP':URLAPP,
						'URLADUAN':URLADUAN,
						'IDSHEET':IDSHEET
					  }
		updateEnv(envUpdate)
    });
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/', routes)


httpServer.listen(port, host, async () => {
    init()
	/*let dt = await bacaautoresponse()
	if (dt){
		isiautores=dt.data.rows
	}*/
	//const dt= bacaautoresponse()
	//console.log((dt.data))
    console.log(`Server is listening on http://${host}:${port}`)
})

nodeCleanup(cleanup)

export default app
