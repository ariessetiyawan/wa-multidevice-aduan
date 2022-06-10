'use strict';

import 'dotenv/config'
import express from 'express'
import nodeCleanup from 'node-cleanup'
import routes from './routes.js'
import { init,updateEnv,setEnvValue, cleanup,isSessionExists, createSession, getSession, deleteSession,createSessionP,sendMessage } from './whatsapp.js'
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
IDGAS=process.env.IDGAS
global.socketwa=io;
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

const kirimWA = cron.schedule(
	"* */1 * * *",
	async () => {	
		try{
			IDGAS=process.env.IDGAS
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
								const templateButtons = [
									  {index: 1, urlButton: {displayText: '⭐ IKM KUA!', url: 'https://github.com/adiwajshing/Baileys'}},
									  {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
									  {index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
									]
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
										sendMessage(ssid,`${nokua}@s.whatsapp.net`, { 
											caption: balasaduan,
											footer:"createby ariessda",
											templateButtons: templateButtons,
											image: {url: './pages/assets/img/logos/visa.png'}
											
										});

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

httpServer.listen(port, host, () => {
    init()
	kirimWA.start();
    console.log(`Server is listening on http://${host}:${port}`)
})

nodeCleanup(cleanup)

export default app
