import { rmSync, readdir } from 'fs'
import { join } from 'path'
import pino from 'pino'
import makeWASocket, {
    makeWALegacySocket,
    useMultiFileAuthState,
    useSingleFileLegacyAuthState,
    makeInMemoryStore,
    Browsers,
    DisconnectReason,
    delay,
} from '@adiwajshing/baileys'
import { toDataURL } from 'qrcode'
import __dirname from './dirname.js'
import response from './response.js'
import axios from 'axios'

const sessions = new Map()
const retries = new Map()

const sessionsDir = (sessionId = '') => {
    return join(__dirname, 'sessions', sessionId ? sessionId : '')
}

const isSessionExists = (sessionId) => {
    return sessions.has(sessionId)
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

const createSession = async (sessionId, isLegacy = false, res = null) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '')

    const logger = pino({ level: 'warn' })
    const store = makeInMemoryStore({ logger })

    let state, saveState

    if (isLegacy) {
        ;({ state, saveState } = useSingleFileLegacyAuthState(sessionsDir(sessionFile)))
    } else {
        ;({ state, saveCreds: saveState } = await useMultiFileAuthState(sessionsDir(sessionFile)))
    }

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
        store.readFromFile(sessionsDir(`${sessionId}_store.json`))
        store.bind(wa.ev)
    }

    sessions.set(sessionId, { ...wa, store, isLegacy })

    wa.ev.on('creds.update', saveState)

    wa.ev.on('chats.set', ({ chats }) => {
        if (isLegacy) {
            store.chats.insertIfAbsent(...chats)
        }
    })

    // Automatically read incoming messages, uncomment below codes to enable this behaviour
    
    wa.ev.on('messages.upsert', async (m) => {     
        try{
			const message = m.messages[0]
			
			if (!message.key.fromMe && m.type === 'notify') {
				await delay(500)
				if (isLegacy) {
					if	(autoreply){
						await wa.chatRead(message.key, 1)
					}
				} else {
					//console.log(isiautores)
					try{
						var rta =[]
						try{
							params['HOME']=''
							params['HEADER']=''
							params['URLADUAN']=''
							params['FOOTER']=''
							params['TITLE']=''
							params['IDGAS']=''
							params['AUTOREPLY']=''
							params['AUTOINFO']=''
							var usra=settingall.data.rows.filter(it => it.SESSION === sessionId);
							//console.log('settingall '+sessionId+'->',settingall)
							if (usra.length>0){
								if (usra[0]['URLLOGOWA']==null||usra[0]['URLLOGOWA']==undefined||usra[0]['URLLOGOWA']==''){
								    params['HEADER']='1WCuMrY3jNCO1okoEFHTs-FtCf6Xy-OkN'
								} else {
									params['HEADER']=usra[0]['URLLOGOWA']
								}
								params['HOME']=usra[0]['HOME']
								params['URLADUAN']=usra[0]['URLADUAN']
								params['FOOTER']=usra[0]['FOOTER']
								params['TITLE']=usra[0]['TITLE']
								params['IDGAS']=usra[0]['IDGAS']
								params['AUTOREPLY']=usra[0]['AUTOREPLY']
								params['AUTOINFO']=usra[0]['AUTOINFO']
								autoreply=(params['AUTOREPLY'])
								autoinfo=(params['AUTOINFO'])
								//console.log('autoreply '+sessionId+'->',autoreply)
							} else {
								
							}
							//console.log('isiautores->',isiautores)
							var rta1=[]
							if (isiautores.length>0){
								var rta1=isiautores.filter(it => it.sessionId === sessionId);
								//console.log('isiautores->',JSON.stringify(rta1[0]['rows']))
							} else {
								let payload = new URLSearchParams({ 'aksi':'GAURES','session': sessionId});
										try{
											let url='https://script.google.com/macros/s/'+params['IDGAS']+'/exec'
											let res = await axios.post(url, payload);
											
											if (res.data.success==true){
												var dtss={}
												dtss['sessionId']=sessionId
												dtss['rows']=res.data.rows
												isiautores.push(dtss)
												var rta1=isiautores.filter(it => it.sessionId === sessionId);
												//console.log('isiautores->',isiautores)
												
											}
										} catch(e){}
							}
							if (rta1.length>0){
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
									  isipesan=(message.message.buttonsResponseMessage.selectedButtonId)
								  } else {
									isipesan=''
								  }
								var rta =  rta1[0]['rows'].filter(it => it.KEYWORD === isipesan.toUpperCase());
								//console.log('autoreply->',JSON.stringify(rta))
							} 
							
						} catch(e){
							var rta =[]
						}
						//console.log('autoreply '+sessionId+'->',autoreply)
						if (autoreply==1){
							var pesannya={
									  "text": params['HOME'],
									  "footer": params['FOOTER'],
									  "title": params['TITLE'],
									  "buttonText": "Pilih Menu",  
									  "sections":[
										{
										"title": "💡 INFORMASI",
										"rows": 
										[

											{"title": "❤️ NIKAH", "rowId": "nikah", "description": "Untuk Info Syarat Nikah"},
											{"title": "🤝 RUJUK", "rowId": "rujuk", "description": "Untuk Info Syarat Rujuk"},
											{"title": "📝 Rekom", "rowId": "rekom", "description": "Untuk Info Syarat Rekom Nikah"},
											{"title": "📑 Duplikat", "rowId": "duplikat", "description": "Untuk Info Syarat Duplikat Buku Nikah"},
											{"title": "💯 Legalisir", "rowId": "legalisir", "description": "Untuk Info Syarat Legalisir"},
											{"title": "🎁 Wakaf", "rowId": "wakaf", "description": "Untuk Info Syarat Wakaf"},
											{"title": "🕋 Haji", "rowId": "haji", "description": "Untuk Info Syarat Haji"},
											{"title": "🤲 Taukil Wali", "rowId": "taukilwali", "description": "Untuk Info Syarat Taukil Wali"},
											{"title": "👳‍ Mualaf", "rowId": "mualaf", "description": "Untuk Info Syarat Mualaf"}
										]
										},
										{
										"title": "💡 LAYANAN",
										"rows": 
										[

											{"title": "💳 KARTU NIKAH", "rowId": "mnukartunikah", "description": "Layanan Kartu Nikah Digital"},
											{"title": "✍️ DAFTAR NIKAH", "rowId": "mnudaftar", "description": "Layanan Daftar Nikah Online"},
											{"title": "🔎 CEK BUKUNIKAH", "rowId": "mnucekdata", "description": "Layanan Cek Data Nikah"},
											{"title": "📆 JADWAL NIKAH", "rowId": "mnujdwl", "description": "Layanan Jadwal Nikah"},
											{"title": "💚 IKM", "rowId": "mnuIKM", "description": "Layanan Index Kepuasan Masyarakat"},
											{"title": "🗣 PENGADUAN", "rowId": "mnuaduan", "description": "Layanan Pengaduan Online"}
										]
										}
										]
									}
							const templateButtons = [
								//{index: 1, urlButton: {displayText: '👍 IKM KUA', url: 'https://github.com/adiwajshing/Baileys'}},
								{index: 2, quickReplyButton: {displayText: '👍 IKM KUA', id: 'id_IKM'}},
								{index: 1, urlButton: {displayText: '🗣 PENGADUAN KUA', url: params['URLADUAN']}},
								{index: 3, urlButton: {displayText: '📍 REVIEW KAMI', url: params['FOOTER']}},
								//{index: 4, quickReplyButton: {displayText: 'This is a reply,\nhttps://forms.gle/BrptPEp652YxYWRb7 ', id: 'id-like-buttons-message'}},
							]
							if (!params['HOME']||!params['HEADER']){
										let payload = new URLSearchParams({ 'aksi':'12','session': sessionId});
										try{
											let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
											let res = await axios.post(url, payload);
											
											if (res.data.success==true){
												params=(res.data.rows[0])
												params['HEADER']=res.data.rows[0]['URLLOGOWA']
											}
										} catch(e){}
									}
							if (rta.length>0){
								const templateButtons = [
										{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]
								pesannya['text']=rta[0]['DESKRIPSI']
								if (params['HEADER']==null||params['HEADER']==undefined||params['HEADER']==''){
								    var fotohead='1WCuMrY3jNCO1okoEFHTs-FtCf6Xy-OkN'
									params['HEADER']=fotohead
								} else {
									var fotohead=params['HEADER']
								}
								var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+fotohead},"caption":rta[0]['DESKRIPSI'],"footer":params['FOOTER'],"templateButtons":templateButtons}
								//console.log('pesannya '+sessionId+'->',pesannya)
								wa.sendMessage(message.key.remoteJid,pesannya)//conn.sendMessage(sender, { url: link }, MessageType.document, { mimetype: Mimetype['pdf'],filename : namefile })
							} else {						
								if (isipesan.toUpperCase()=='MENU'||isipesan.toUpperCase()=='INFO'){
									if (pesannya){
										wa.sendMessage(message.key.remoteJid,pesannya)
									}
								} else if (isipesan=='mnuIKM'||isipesan.toUpperCase()=='IKM'){
									const buttons = [
									  {buttonId: 'id1', buttonText: {displayText: '🤩 Sangat Bagus'}, type: 0},
									  {buttonId: 'id2', buttonText: {displayText: '😍 Bagus'}, type: 0},
									  {buttonId: 'id3', buttonText: {displayText: '😊 Biasa saja'}, type: 0},
									  {buttonId: 'id4', buttonText: {displayText: '😱 Kurang Bagus'}, type: 0},
									]
									const templateButtons = [
										{index: 1, quickReplyButton: {displayText: '🤩 Sangat Bagus', id: 'id4'}},
										{index: 2, quickReplyButton: {displayText: '😍 Bagus', id: 'id3'}},
										{index: 3, quickReplyButton: {displayText: '😊 Biasa saja', id: 'id2'}},
										//{index: 4, urlButton: {displayText: '😱 Kurang Bagus', url: 'https://simkah.kemenag.go.id/daftarnikah/create'}},
																
									]
									var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},
									"caption":"Bantu kami, untuk menilai pelayanan kami. Agar kami bisa lebih baik dalam melayanai masyarakat penguna layanan KUA.","footer":params['FOOTER'],"buttons":buttons}//
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='id1'||isipesan=='id2'||isipesan=='id3'||isipesan=='id4'){
									const templateButtons = [
										{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]						
									var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"🙏 Terima kasih, atas partisipasi anda dalam IKM KUA Kami.","footer":params['FOOTER'],"templateButtons":templateButtons}
							
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnudaftar'||isipesan.toUpperCase()=='DAFTARNIKAH'){
									const templateButtons = [
										{index: 1, urlButton: {displayText: 'Daftar Nikah', url: 'https://simkah.kemenag.go.id/daftarnikah/create'}},
										{index: 2, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]
									var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk Daftar Nikah secara online silahkan kunjungi link berikut https://simkah.kemenag.go.id/daftarnikah/create atau klik tombol Daftar Nikah dibawah ini","footer":params['FOOTER'],"templateButtons":templateButtons}
									
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnuaduan'||isipesan.toUpperCase()=='PENGADUAN'){
									const templateButtons = [
										{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
										{index: 2, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]						
									var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengajukan pengaduan, silahkan isi form berikut ini "+params['URLADUAN']+" atau klik link dibawah ini..","footer":params['FOOTER'],"templateButtons":templateButtons}
								
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnukartunikah'||isipesan.toUpperCase()=='KARTUNIKAH'){
									const templateButtons = [
										//{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
										{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]						
									//var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Silahkan ketik *BN#[nomor seri porporasi buku nikah anda]*\n\ncontoh: *BN#JT12XXXXX*","footer":params['FOOTER'],"templateButtons":templateButtons}
									pesannya['text']="Silahkan ketik *BN#[nomor seri porporasi buku nikah anda]*\n\ncontoh: *BN#JT12XXXXX*"
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnucekdata'||isipesan.toUpperCase()=='BUKUNIKAH'){
									const templateButtons = [
										//{index: 1, urlButton: {displayText: '🔙 Kembali', url: ""mnuback}},
										{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]						
									//var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengetahui riwayat pernikahan anda ketik *BIN#[nama anda]#[ nama orang tua laki-laki]*\n\ncontoh :\n*BIN#siti aminah#Joko Suparto*","footer":params['FOOTER'],"templateButtons":templateButtons}
									pesannya['text']="Untuk mengetahui riwayat pernikahan anda ketik *BIN#[nama anda]#[ nama orang tua laki-laki]*\n\ncontoh :\n*BIN#siti aminah#Joko Suparto*"
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnujdwl'||isipesan.toUpperCase()=='JADWALNIKAH'){
									const templateButtons = [
										//{index: 1, urlButton: {displayText: 'Form Pengaduan', url: params['URLADUAN']}},
										{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
									]
								
									//var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"Untuk mengetahui jadwal nikah KUA kami, ketik *NC#[tanggal akad tanggal/bulan/tahun]*\n\ncontoh:\n*NC#01/02/2022*","footer":params['FOOTER'],"templateButtons":templateButtons}
									pesannya['text']="Untuk mengetahui jadwal nikah KUA kami, ketik *NC#[tanggal akad tanggal/bulan/tahun]*\n\ncontoh:\n*NC#01/02/2022*"
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else {
									/*let rta =  isiautores.filter(it => it.KEYWORD === 'INFO');*/
									//console.log('params->',params)
									
									
									//console.log(pesannya)
									try{
										if (autoinfo==1){
											var toj=message.key.remoteJid
											let resut = toj.includes("broadcast")
											//console.log(resut)
											if (resut==false){
												if (pesannya){
													wa.sendMessage(message.key.remoteJid,pesannya)
												}
											} else {
												console.log('message.key.remoteJid ->',message.key.remoteJid)
												console.log('broadcast message ',message.key.participant)
											}
										}
									}catch(e){}
								}
							}
							if (autoreply){
								await wa.sendReadReceipt(message.key.remoteJid, message.key.participant, [message.key.id])
							}
							var hitcat={}
							hitcat['nomor']=message.key.remoteJid
							hitcat['pesan']=isipesan
							hitcat['time']=new Date()
							historycat.push(hitcat)
						}
					} catch(e){}
					//console.log('historycat->',historycat)
				}
			}
		} catch(e){
			console.log(e.message)
		}
    })
    
    wa.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update
        const statusCode = lastDisconnect?.error?.output?.statusCode

        if (connection === 'open') {
            retries.delete(sessionId)
        }

        if (connection === 'close') {
            if (statusCode === DisconnectReason.loggedOut || !shouldReconnect(sessionId)) {
                if (res && !res.headersSent) {
                    response(res, 500, false, 'Unable to create session.')
                }

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

/**
 * @returns {(import('@adiwajshing/baileys').AnyWASocket|null)}
 */
const getSession = (sessionId) => {
    return sessions.get(sessionId) ?? null
}

const deleteSession = (sessionId, isLegacy = false) => {
    const sessionFile = (isLegacy ? 'legacy_' : 'md_') + sessionId + (isLegacy ? '.json' : '')
    const storeFile = `${sessionId}_store.json`
    const rmOptions = { force: true, recursive: true }

    rmSync(sessionsDir(sessionFile), rmOptions)
    rmSync(sessionsDir(storeFile), rmOptions)

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
const sendMessage = async (session, receiver, message, delayMs = 1000) => {
    try {
        await delay(parseInt(delayMs))

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

const cleanup = async () => {
	const hss1 =await kirimpesanTL()
    console.log('Running cleanup before exit.')
    sessions.forEach((session, sessionId) => {
        if (!session.isLegacy) {
            session.store.writeToFile(sessionsDir(`${sessionId}_store.json`))
        }
    })
}

const init = () => {
    readdir(sessionsDir(), (err, files) => {
        if (err) {
            throw err
        }

        for (const file of files) {
            if ((!file.startsWith('md_') && !file.startsWith('legacy_')) || file.endsWith('_store')) {
                continue
            }

            const filename = file.replace('.json', '')
            const isLegacy = filename.split('_', 1)[0] !== 'md'
            const sessionId = filename.substring(isLegacy ? 7 : 3)
			//console.log(isLegacy)
            createSession(sessionId, isLegacy)
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
const kirimpesanTL = async()=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"TOTL"})
		let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
		res = await axios.post(url,payload);
	} catch(error){
		var res=[]
	}
	return res
}
const bacaAllUser = async(dt)=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"12","session":dt})
		let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
		res = await axios.post(url,payload);
		//console.log(res)
	} catch(error){
		var res=[]
	}
	return res
	//console.log(res)
}
const bacaGroupUser = async(dt)=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"GRP","group":dt})
		let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
		res = await axios.post(url,payload);
		//console.log(res)
	} catch(error){
		var res=[]
	}
	return res
	//console.log(res)
}
const bacaAllAReply = async()=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"GRA"})
		let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
		res = await axios.post(url,payload);
	} catch(error){
		var res=[]
	}
	return res
	//console.log(res)
}
export {
	kirimpesanTL,
	bacaGroupUser,
	bacaAllAReply,
	bacaAllUser,
	bacaautoresponse,
    isSessionExists,
    createSession,
    getSession,
    deleteSession,
    getChatList,
    isExists,
    sendMessage,
    formatPhone,
    formatGroup,
    cleanup,
    init,
}
