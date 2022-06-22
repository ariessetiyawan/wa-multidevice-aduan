import { existsSync, unlinkSync, readdir } from 'fs'
import { join } from 'path'
import pino from 'pino'
import fs from 'fs'
import os from 'os'
import 'dotenv/config'
import axios from 'axios'
import makeWASocket, {
	BufferJSON, 
    makeWALegacySocket,
    useSingleFileAuthState,
    useSingleFileLegacyAuthState,
    makeInMemoryStore,
    Browsers,
    DisconnectReason,
    delay,
} from '@adiwajshing/baileys'
import { toDataURL } from 'qrcode'
import __dirname from './dirname.js'
import response from './response.js'
import dotenv from 'dotenv'
//import updateEnv from './updateEnv.js'

const env = fs.readFileSync('.env')
const buf = Buffer.from(env)
const currentConfig = dotenv.parse(buf)

const sessions = new Map()
const retries = new Map()

const sessionsDir = (sessionId = '') => {
    return join(__dirname, 'sessions', sessionId ? `${sessionId}.json` : '')
}

const isSessionExists = (sessionId) => {
    return sessions.has(sessionId)
}

const isSessionFileExists = (name) => {
    return existsSync(sessionsDir(name))
}
const shouldReconnect = (sessionId) => {
    let maxRetries = parseInt(process.env.MAX_RETRIES ?? 0)
    let attempts = retries.get(sessionId) ?? 0

    maxRetries = maxRetries < 1 ? 1 : maxRetries

    if (attempts < maxRetries) {
        ++attempts

        console.log('Reconnecting...', { attempts, sessionId })
        retries.set(sessionId, attempts)

        return true
    }

    return false
}
const createSessionP = async (sessionId, isLegacy = false, res = null) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId

    const logger = pino({ level: 'warn' })
    const store = makeInMemoryStore({ logger })

    const { state, saveState } = isLegacy
        ? useSingleFileLegacyAuthState(sessionsDir(sessionFile))
        : useSingleFileAuthState(sessionsDir(sessionFile))

    /**
     * @type {import('@adiwajshing/baileys').CommonSocketConfig}
     */
    const waConfig = {
        auth: state,
        printQRInTerminal: true,
        logger,
        browser: Browsers.ubuntu('Chrome'),
		msgRetryCounterMap,
		getMessage: async key => {
			return {
				conversation: 'hello'
			}
		}
    }

    /**
     * @type {import('@adiwajshing/baileys').AnyWASocket}
     */
    const wa = isLegacy ? makeWALegacySocket(waConfig) : makeWASocket.default(waConfig)

    if (!isLegacy) {
        store.readFromFile(sessionsDir(`${sessionId}_store`))
        store.bind(wa.ev)
    }

    sessions.set(sessionId, { ...wa, store, isLegacy })

    wa.ev.on('creds.update', saveState)

    wa.ev.on('chats.set', ({ chats }) => {
		//console.log('got chats', store.chats.all())
		//console.log(chats)
        if (isLegacy) {
            store.chats.insertIfAbsent(...chats)
        }
    })

    // Automatically read incoming messages, uncomment below codes to enable this behaviour
    /*
    wa.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0]

        if (!message.key.fromMe && m.type === 'notify') {
            await delay(1000)

            if (isLegacy) {
                await wa.chatRead(message.key, 1)
            } else {
                await wa.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
            }
        }
    })
    */

    wa.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode

        if (connection === 'open') {
            retries.delete(sessionId)
        }

        if (connection === 'close') {
            if (statusCode === DisconnectReason.loggedOut || !shouldReconnect(sessionId)) {
                if (res && !res.headersSent) {
                   // response(res, 500, false, 'Unable to create session.')
                }

                deleteSession(sessionId, isLegacy)
            }

            setTimeout(
                () => {
                    createSession(sessionId, isLegacy, res)
                },
                statusCode === DisconnectReason.restartRequired ? 0 : parseInt(process.env.RECONNECT_INTERVAL ?? 0)
            )
        }

        if (update.qr) {
            if (res && !res.headersSent) {
                try {
                    const qr = await toDataURL(update.qr)
					socketwa.emit("log","res kirim qrcode base64")
					socketwa.emit("qr",qr)
                    //response(res, 200, true, 'QR code received, please scan the QR code.', { qr })
					
                    
                } catch(e) {
					console.log(`emit res ${e}`)
                    //response(res, 500, false, 'Unable to create QR code.')
                }
            } else {
				try {
                    const qr = await toDataURL(update.qr)
					//console.log(qr)
					socketwa.emit("log","kirim qrcode base64")
					socketwa.emit("qr",qr)
                    //response(res, 200, true, 'QR code received, please scan the QR code.', { qr })

                    
                } catch(e) {
					console.log(`emit ${e}`)
                    //response(res, 500, false, 'Unable to create QR code.')
                }
			}

            try {
                await wa.logout()
            } catch (e) {
            } finally {
                deleteSession(sessionId, isLegacy)
            }
        }
    })
}
const createSession = async (sessionId, isLegacy = false, res = null) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId

    const logger = pino({ level: 'warn' })
	
    const store = makeInMemoryStore({ logger })
	
    const { state, saveState } = isLegacy
        ? useSingleFileLegacyAuthState(sessionsDir(sessionFile))
        : useSingleFileAuthState(sessionsDir(sessionFile))
	//console.log(state)
    /**
     * @type {import('@adiwajshing/baileys').CommonSocketConfig}
     */
    const waConfig = {
        auth: state,
        printQRInTerminal: true,
        logger,
        browser: Browsers.ubuntu('Chrome'),
    }

    /**
     * @type {import('@adiwajshing/baileys').AnyWASocket}
     */
    const wa = isLegacy ? makeWALegacySocket(waConfig) : makeWASocket.default(waConfig)

    if (!isLegacy) {
        store.readFromFile(sessionsDir(`${sessionId}_store`))
        store.bind(wa.ev)
    }
	/*setInterval(() => {
		store.writeToFile(`${sessionId}_store`)
	}, 10_000)*/
	try{
	//console.log(settingall)
	let rta =  settingall.filter(it => it.SESSIONA === sessionId);
		if (rta.length>0){
			console.log(rta)
		
			
		}
	}catch(e){}
    sessions.set(sessionId, { ...wa, store, isLegacy })

    wa.ev.on('creds.update', saveState)
		
    wa.ev.on('chats.set', async  ({ chats }) => {
		
        if (isLegacy) {
            store.chats.insertIfAbsent(...chats)
        }
    })

    // Automatically read incoming messages, uncomment below codes to enable this behaviour

    wa.ev.on('messages.upsert', async (m) => {
        const message = m.messages[0]
		////console.log(message.key.remoteJid)
		
		//console.log(getSession(sessionId).store.chats.get(message.key.remoteJid))
		//const lastMsgInChat = await getLastMessageInChat(message.key.remoteJid) // implement this on your end
		//console.log(lastMsgInChat)
		//await sock.chatModify({ archive: true, lastMessages: [lastMsgInChat] },message.key.remoteJid)
		//console.log(message.message.listResponseMessage)
		var isipesan=''
		  if (message.message.hasOwnProperty('extendedTextMessage')){
			isipesan=message.message.extendedTextMessage.text
		  } else if (message.message.hasOwnProperty('listResponseMessage')){
			isipesan=message.message.listResponseMessage.singleSelectReply.selectedRowId
		  } else if (message.message.hasOwnProperty('conversation')){
			isipesan=message.message.conversation
		  } else if (message.message.hasOwnProperty('templateButtonReplyMessage')){
			  isipesan=(message.message.templateButtonReplyMessage.selectedId)
		  } else if (message.message.hasOwnProperty('buttonsResponseMessage')){
			  //console.log(message)
			  //console.log(message.message.buttonsResponseMessage.contextInfo)
			  isipesan=(message.message.buttonsResponseMessage.selectedButtonId)
		  } else {
			isipesan=''
		  }
		
        if (!message.key.fromMe && m.type === 'notify') {
            await delay(1000)
            if (isLegacy) {
				if	(autoreply){
					await wa.chatRead(message.key, 1)
				}
            } else {
				//console.log(isiautores)
				var rta =[]
				try{
					var rta =  isiautores.filter(it => it.KEYWORD === isipesan.toUpperCase());
				} catch(e){
					var rta =[]
				}
				const templateButtons = [
						//{index: 1, urlButton: {displayText: '👍 IKM KUA', url: 'https://github.com/adiwajshing/Baileys'}},
						{index: 2, quickReplyButton: {displayText: '👍 IKM KUA', id: 'id_IKM'}},
						{index: 1, urlButton: {displayText: '🗣 PENGADUAN KUA', url: params['URLADUAN']}},
						{index: 3, urlButton: {displayText: '📍 REVIEW KAMI', url: params['FOOTER']}},
						//{index: 4, quickReplyButton: {displayText: 'This is a reply,\nhttps://forms.gle/BrptPEp652YxYWRb7 ', id: 'id-like-buttons-message'}},
					]
				
				if (rta.length>0){
					const templateButtons = [
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":rta[0]['DESKRIPSI'],"footer":params['FOOTER'],"templateButtons":templateButtons}
					historycat['nomor']=message.key.remoteJid
					historycat['pesan']=pesannya
					//console.log('pesannya',pesannya)
					wa.sendMessage(message.key.remoteJid,pesannya)//conn.sendMessage(sender, { url: link }, MessageType.document, { mimetype: Mimetype['pdf'],filename : namefile })
				} else {
					//console.log('isipesan ->',message.message)
					if (isipesan=='mnuIKM'){
						const buttons = [
						  {buttonId: 'id1', buttonText: {displayText: '🤩 Sangat Bagus'}, type: 1},
						  {buttonId: 'id2', buttonText: {displayText: '😍 Bagus'}, type: 1},
						  {buttonId: 'id3', buttonText: {displayText: '😊 Biasa saja'}, type: 1},
						  {buttonId: 'id4', buttonText: {displayText: '😱 Kurang Bagus'}, type: 1}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Bantu kami, untuk menilai pelayanan kami. Agar kami bisa lebih baik dalam melayanai masyarakat penguna layanan KUA.","footer":params['FOOTER'],"buttons":buttons}
						wa.sendMessage(message.key.remoteJid,pesannya)
				} else if (isipesan=='id1'||isipesan=='id2'||isipesan=='id3'||isipesan=='id4'){
						const templateButtons = [
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"🙏 Terima kasih, atas partisipasi anda dalam IKM KUA Kami.","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else if (isipesan=='mnudaftar'){
						const templateButtons = [
							{index: 1, urlButton: {displayText: 'Daftar Nikah', url: 'https://simkah.kemenag.go.id/daftarnikah/create'}},
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk Daftar Nikah secara online silahkan kunjungi link berikut https://simkah.kemenag.go.id/daftarnikah/create atau klik tombol Daftar Nikah dibawah ini","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else if (isipesan=='mnuaduan'){
						const templateButtons = [
							{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
							{index: 2, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengajukan pengaduan, silahkan isi form berikut ini "+params['URLADUAN']+" atau klik link dibawah ini..","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else if (isipesan=='mnukartunikah'){
						const templateButtons = [
							//{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Silahkan ketik *BN#[nomor seri porporasi buku nikah anda]*\n\ncontoh: *BN#JT12XXXXX*","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else if (isipesan=='mnucekdata'){
						const templateButtons = [
							//{index: 1, urlButton: {displayText: '🔙 Kembali', url: ""mnuback}},
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengetahui riwayat pernikahan anda ketik *BIN#[nama anda]#[ nama orang tua laki-laki]*\n\ncontoh :\n*BIN#siti aminah#Joko Suparto*","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else if (isipesan=='mnujdwl'){
						const templateButtons = [
							//{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
							{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
						]
					
						let pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengetahui jadwal nikah KUA kami, ketik *NC#[tanggal akad tanggal/bulan/tahun]*\n\ncontoh:\n*NC#01/02/2022*","footer":params['FOOTER'],"templateButtons":templateButtons}
						//console.log(pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					} else {
						/*let rta =  isiautores.filter(it => it.KEYWORD === 'INFO');*/
						let pesannya={
						  "text": params['HOME'],
						  "footer": params['FOOTER'],
						  "title": params['TITLE'],
						  "buttonText": "Pilih Menu",  
						  "sections":[
							{
							"title": "💡 INFORMASI",
							"rows": 
							[

								{"title": "NIKAH", "rowId": "nikah", "description": "Untuk Info Syarat Nikah"},
								{"title": "RUJUK", "rowId": "rujuk", "description": "Untuk Info Syarat Rujuk"},
								{"title": "Rekom", "rowId": "rekom", "description": "Untuk Info Syarat Rekom Nikah"},
								{"title": "Duplikat", "rowId": "duplikat", "description": "Untuk Info Syarat Duplikat Buku Nikah"},
								{"title": "Legalisir", "rowId": "legalisir", "description": "Untuk Info Syarat Legalisir"},
								{"title": "Wakaf", "rowId": "wakaf", "description": "Untuk Info Syarat Wakaf"},
								{"title": "Haji", "rowId": "haji", "description": "Untuk Info Syarat Haji"},
								{"title": "Taukil Wali", "rowId": "taukilwali", "description": "Untuk Info Syarat Taukil Wali"},
								{"title": "Mualaf", "rowId": "mualaf", "description": "Untuk Info Syarat Mualaf"}
							]
							},
							{
							"title": "💡 LAYANAN",
							"rows": 
							[

								{"title": "KARTU NIKAH", "rowId": "mnukartunikah", "description": "Layanan Kartu Nikah Digital"},
								{"title": "DAFTAR NIKAH", "rowId": "mnudaftar", "description": "Layanan Daftar Nikah Online"},
								{"title": "CEK BUKUNIKAH", "rowId": "mnucekdata", "description": "Layanan Cek Data Nikah"},
								{"title": "JADWAL NIKAH", "rowId": "mnujdwl", "description": "Layanan Jadwal Nikah"},
								{"title": "IKM", "rowId": "mnuIKM", "description": "Layanan Index Kepuasan Masyarakat"},
								{"title": "PENGADUAN", "rowId": "mnuaduan", "description": "Layanan Pengaduan Online"}
							]
							}
							]
						}
						historycat['nomor']=message.key.remoteJid
						historycat['pesan']=pesannya
						//console.log('pesannya',pesannya)
						wa.sendMessage(message.key.remoteJid,pesannya)
					}
				}
				if (autoreply){
					await wa.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
				}
				
            }
        }
    })
    wa.ev.on('messages.update', m => {
		//console.log(JSON.stringify(m, undefined, 2))
	
	})
	wa.ev.on('chats.update', m => {
		
		//console.log(m)
 
	})
    wa.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode
		//console.log(`statusCode ${statusCode}`)
		
        if (connection === 'open') {
            retries.delete(sessionId)
			//console.log('connection',connection)
			
			
			let payload = new URLSearchParams({ 'aksi':'3','filename': sessionFile, 'base64': JSON.stringify(state)});
			//let payload = new URLSearchParams({ 'aksi':'3','nm': sessionFile, 'base64': b64});
			//console.log('payload',payload)
			try{
				//ke gsheet induk
				let url='https://script.google.com/macros/s/AKfycbx_8bYVc5XDXUWxlpADzGdMsym0oITdOHEwI80TMIYz4wngwwzYUc_IbmtYneY0rC6R/exec'
				let res = await axios.post(url, payload);
				if (res.data.success==true){
					//setEnvValue('SESSIONSNAME',res.data.rows.urlfile)
					let dt =await socketwa.emit('statusscan',{'status':true,'urlfile':res.data.rows.urlfile})
					/*console.log('res',res.data.rows.urlfile)
					axios({
						method: "get",
						url: res.data.rows.urlfile,
						responseType: "stream"
					}).then(function (response) {
						response.data.pipe(fs.createWriteStream(sessionsDir(sessionFile)));
					});*/
				}
			} catch(e){}
		
        }

        if (connection === 'close') {
            if (statusCode === DisconnectReason.loggedOut || !shouldReconnect(sessionId)) {
                if (res && !res.headersSent) {
                    response(res, 500, false, 'Unable to create session.')
                }
				
				console.log(`connection delete Session statusCode ${statusCode} connection ${connection}`)
                return deleteSession(sessionId, isLegacy)
            }

            setTimeout(
                () => {
                    createSession(sessionId, isLegacy, res)
                },
                statusCode === DisconnectReason.restartRequired ? 0 : parseInt(process.env.RECONNECT_INTERVAL ?? 0)
            )
        }

        if (update.qr) {
            if (res && !res.headersSent) {
                try {
                    
					const qr = await toDataURL(update.qr)
					await socketwa.emit("log","res kirim qrcode base64")
					await socketwa.emit("qr",qr)
                    response(res, 200, true, 'QR code received, please scan the QR code.', { qr })

                    return
                } catch {
                    response(res, 500, false, 'Unable to create QR code.')
                }
            } 

            try {
                await wa.logout()
            } catch {
            } finally {
                deleteSession(sessionId, isLegacy)
            }
			
			
        }
    })
	
}
const updateEnv=(config = {}, eol = '\n')=>{
  //console.log(config)
  const envContents = Object.entries({...currentConfig, ...config})
    .map(([key,val]) => `${key}=${val}`)
    .join(eol)
  fs.writeFileSync('.env', envContents);
}
const setEnvValue=(key, value)=> {

    // read file from hdd & split if from a linebreak to a array
    const ENV_VARS = fs.readFileSync("./.env", "utf8").split(os.EOL);

    // find the env we want based on the key
    const target = ENV_VARS.indexOf(ENV_VARS.find((line) => {
        return line.match(new RegExp(key));
    }));

    // replace the key/value with the new value
    ENV_VARS.splice(target, 1, `${key}=${value}`);

    // write everything back to the file system
    fs.writeFileSync("./.env", ENV_VARS.join(os.EOL));

}
const downloadFileSession=(ids,isLegacy = false)=>{
	try{
	const sessionFile = (isLegacy ? 'legacy_' : 'md_') + ids
	const url='https://drive.google.com/uc?export=view&id='+params['BACKSESSION']//process.env.SESSIONSNAME ?? 'aries.json'
	axios({
			method: "get",
			url: url,//res.data.rows.urlfile,
			responseType: "stream"
		}).then(function (response) {
			response.data.pipe(fs.createWriteStream(sessionsDir(sessionFile)));
		});
	} catch(e){}
}

/**
 * @returns {(import('@adiwajshing/baileys').AnyWASocket|null)}
 */
const getSession = (sessionId) => {
    return sessions.get(sessionId) ?? null
}

const deleteSession = (sessionId, isLegacy = false) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId
    const storeFile = `${sessionId}_store`

    if (isSessionFileExists(sessionFile)) {
        unlinkSync(sessionsDir(sessionFile))
    }

    if (isSessionFileExists(storeFile)) {
        unlinkSync(sessionsDir(storeFile))
    }

    sessions.delete(sessionId)
    retries.delete(sessionId)
}

const getChatList = (sessionId, isGroup = false) => {
    const filter = isGroup ? '@g.us' : '@s.whatsapp.net'

    return getSession(sessionId).store.chats.filter((chat) => {
        return chat.id.endsWith(filter)
    })
}

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
const isExists = async (session, jid, isGroup = false) => {
    try {
        let result

        if (isGroup) {
            result = await session.groupMetadata(jid)

            return Boolean(result.id)
        }

        if (session.isLegacy) {
            result = await session.onWhatsApp(jid)
        } else {
            ;[result] = await session.onWhatsApp(jid)
        }

        return result.exists
    } catch {
        return false
    }
}

/**
 * @param {import('@adiwajshing/baileys').AnyWASocket} session
 */
const sendMessage = async (session, receiver, message) => {
    try {
        await delay(1000)

        return session.sendMessage(receiver, message)
    } catch {
        return Promise.reject(null) // eslint-disable-line prefer-promise-reject-errors
    }
}

const formatPhone = (phone) => {
    if (phone.endsWith('@s.whatsapp.net')) {
        return phone
    }

    let formatted = phone.replace(/\D/g, '')

    return (formatted += '@s.whatsapp.net')
}

const formatGroup = (group) => {
    if (group.endsWith('@g.us')) {
        return group
    }

    let formatted = group.replace(/[^\d-]/g, '')

    return (formatted += '@g.us')
}

const cleanup = () => {
    console.log('Running cleanup before exit.')

    sessions.forEach((session, sessionId) => {
        if (!session.isLegacy) {
            session.store.writeToFile(sessionsDir(`${sessionId}_store`))
        }
    })
}
const bacaautoresponse = async(idg)=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"GAURES"})
		let url='https://script.google.com/macros/s/'+idg+'/exec'
		res = await axios.post(url,payload);
	} catch(error){
		var res=[]
	}
	return res
	//console.log(res)
}
const init = () => {
    readdir(sessionsDir(), (err, files) => {
        if (err) {
            throw err
        }

        for (const file of files) {
            if (
                !file.endsWith('.json') ||
                (!file.startsWith('md_') && !file.startsWith('legacy_')) ||
                file.includes('_store')
            ) {
                continue
            }

            const filename = file.replace('.json', '')
            const isLegacy = filename.split('_', 1)[0] !== 'md'
            const sessionId = filename.substring(isLegacy ? 7 : 3)

            createSession(sessionId, isLegacy)
        }
    })
}
const base64Encode =(file) => {
    var body = fs.readFileSync(file);
    return body.toString('base64');
}
export {
    isSessionExists,
	isSessionFileExists,
    createSession,
	createSessionP,
    getSession,
	bacaautoresponse,
    deleteSession,
    getChatList,
	downloadFileSession,
    isExists,
	updateEnv,
	setEnvValue,
    sendMessage,
    formatPhone,
    formatGroup,
    cleanup,
    init,
}
