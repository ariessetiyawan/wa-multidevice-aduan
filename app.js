'use strict';

import 'dotenv/config'
import express from 'express'
import nodeCleanup from 'node-cleanup'
import routes from './routes.js'
import { init, cleanup,isSessionExists, createSession, getSession, deleteSession,createSessionP,sendMessage } from './whatsapp.js'
import { Server } from "socket.io";
import http from 'http';
import session from 'express-session';
import cron	 from 'node-cron';
import moment from "moment-timezone";
import axios from "axios";
let IDGAS='';
let sessionA='';

const app = express()
const host = process.env.HOST ?? '127.0.0.1'
const port = parseInt(process.env.PORT ?? 8000)
const httpServer = http.createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } });
global.socketwa=io;
io.on('connection', (socket) => {
    console.log('a user connected');
	io.emit('info_setting');   
	socket.on('disconnect', () => console.log('Client disconnected'));
    socket.on('message', (message) =>     {
        console.log(message);
        io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
    });
	socket.on('setting_form', (message) =>     {
        console.log(message);
        //io.emit('message', `${socket.id.substr(0,2)} said ${message}` );   
		IDGAS=message['IDGAS']
		sessionA=message['sessionid']
    });

	/*
	socket.on("createSession", () => {
		let id='123213a';
		io.emit('log', 'wait a moment please..' );   
		try{
			createSession(id, false, null);
			console.log(hasil)
		} catch(e){
			console.log('error createSessionP ${e}')
		}
	})*/
	//setInterval(() => io.emit('time', new Date().toTimeString()), 1000);
});

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use('/', routes)

const kirimWA = cron.schedule(
	"*/1 * * * *",
	async () => {	
		try{
			var url=`https://script.google.com/macros/s/${IDGAS}/exec?aksi=0`
			//console.log(url)
		axios
			  .get(url)
			  .then(res => {
				//console.log(`statusCode: ${res.status}`)
				//console.log('isidata: ',JSON.stringify(res.data))
				if (res.data.success){
					let arr=((res.data.rows))
					if (arr.length>0){
						arr.forEach(element => {													
						  let tglk=element.Timestamp;
						  let namal=element['Nama Lengkap'];
						  let nipa=element['Nomor Induk Kependudukan'];
						  let adda=element['Alamat'];
						  let kua=element['Nama KUA'];
						  let hal=element['Layanan yang diadukan'];
						  let detail=element['Deskripsi Pengaduan'];
						  let emaia=element.Email;
						  let doca=element['Dokumen Pendukung (Tidak Wajib Diisi)'];
						  let ida=element['ID'];
						  let notelp=element['Nomor Handphone (whatsapp)'];
						  let sta=element['Status'];
						  notelp='62'+parseInt(notelp).toString();
						  let url=`https://script.google.com/macros/s/${IDGAS}/exec?aksi=2&kdkua=${kua}`;	
						  let ssid=getSession(sessionA)
						  if (sta==0){
								let message=`🙏 Bapak/Ibu/Sdr. *${namal}*,\n\nPengaduan anda telah kami terima dengan nomor resi *${ida}*, segera akan kami tidak lanjuti.\n\nTerima kasih\n\n*Biro Hukum*\n*Asosiasi Penghulu RI*`
								//sock.sendMessage(`${notelp}@s.whatsapp.net`, { text: message });
								sendMessage(ssid,`${notelp}@s.whatsapp.net`, { text: message,footer:"createby ariessda" });
								//balasan ke pengirin aduan
								axios.get(url).then(res1 => {
									if (res1.data.success){
										let arr=((res1.data.rows))
										let nokua=arr[0]['NO TELP']
										nokua='62'+parseInt(nokua).toString();
										let balasaduan=`🗣 KUA *${kua}* mendapat pengaduan dari masyarakat perihal *${hal}*, dengan detail: *${detail}*\n\nTerima kasih\n\n*Biro Hukum*\n*Asosiasi Penghulu RI*`;
										sendMessage(ssid,`${nokua}@s.whatsapp.net`, { text: balasaduan,footer:"createby ariessda" });

									}
									let urlupd =`https://script.google.com/macros/s/${IDGAS}/exec?aksi=1&id=${ida}`;
										axios.get(urlupd).then(res => {
											if (res.data.success){
												console.log(res.data)
											}
									});
								})

						  }
						  //await msg.reply(text);
						  //console.log(color("[CRON]", "yellow"), "Reset all limit");
						});
					}
				}
			  })
			  .catch(error => {
				console.error("error saat get gsheet "+error)
			  })
		}catch(e){}
	}
);
kirimWA.start();
httpServer.listen(port, host, () => {
    init()
    console.log(`Server is listening on http://${host}:${port}`)
})

nodeCleanup(cleanup)

export default app
