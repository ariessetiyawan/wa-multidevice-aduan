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
global.settingall=[]
global.params={}
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
	socket.on('setting_form', async(message) =>     {
        //console.log(message);
        //io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
		IDGAS=message['idgas']
		var dt1={}
		dt1['IDGAS']=message['idgas']
		
		let SESSIONA=message['sessionid']
		dt1['IDSHEET']=message['idsheet']
		dt1['URLADUAN']=message['urlduan']
		dt1['URLAPP']=message['urlapp']
		dt1['BACKSESSION']=message['backup']
		dt1['HEADER']=message['header']
		dt1['AUTOREPLY']=message['autoreply']
		dt1['RESPONSE']=message['response']
		dt1['HOME']=message['home']
		dt1['FOOTER']=message['footer']
		dt1['TITLE']=message['title']
		var dt={}
		dt['SESSIONA']=message['sessionid']
		dt['rows']=dt1
		let rta =  settingall.filter(it => it.SESSIONA === message['sessionid']);
		if (rta.length<1){
			params=dt1
			settingall.push(dt)
		} else {
			for( var i = 0; i < settingall.length; i++){ 
				if ( settingall[i]['SESSIONA'] === message['sessionid']) { 
					settingall.splice(i, 1); 
				}
			}
			settingall.push(dt)
		}
		//console.log(settingall)
		try{
			let dtx = await bacaautoresponse(message['idgas'])
				if (dtx){
					isiautores=dtx.data.rows
					//console.log(isiautores)
			}
		} catch(e){
			console.log('error console.log(isiautores)')
		}
		io.emit('userall', settingall ); 
		/*const envUpdate = {
						'SESSIONSNAME': BACKSESSION,
						'PHONENUMBER': SESSIONA,
						'IDGAS':IDGAS,
						'BACKSESSION':BACKSESSION,
						'URLAPP':URLAPP,
						'URLADUAN':URLADUAN,
						'IDSHEET':IDSHEET
					  }
		updateEnv(envUpdate)*/
    });
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/', routes)

httpServer.listen(port, host, async () => {
    init()
    console.log(`Server is listening on http://${host}:${port}`)
})

nodeCleanup(cleanup)

export default app
