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
import dateFormat from 'dateformat'


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
			var isipesan=''
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
							//console.log(sessionId)
							console.log(JSON.stringify(usra[0]['LISTMENU']))
							var pesannya={}
							if (usra.length>0){
								params['HOME']=usra[0]['HOME']
								params['HEADER']=usra[0]['URLLOGOWA']
								params['URLADUAN']=usra[0]['URLADUAN']
								params['FOOTER']=usra[0]['FOOTER']
								params['TITLE']=usra[0]['TITLE']
								params['IDGAS']=usra[0]['IDGAS']
								params['AUTOREPLY']=usra[0]['AUTOREPLY']
								params['AUTOINFO']=usra[0]['AUTOINFO']
								params['SENDTYPE']=usra[0]['SENDTYPE']
								autoreply=(params['AUTOREPLY'])
								autoinfo=(params['AUTOINFO'])
								params['LISTMENU']=usra[0]['LISTMENU']
								//console.log(usra[0]['LISTMENU'])
								if (usra[0]['LISTMENU']==undefined){
									try{
										var payload=new URLSearchParams({"aksi":"LM"})
										var url='https://script.google.com/macros/s/'+params["IDGAS"]+'/exec'
										res = await axios.post(url,payload);
										//console.log(res)
										if (res.data.success){
											params['LISTMENU']=res.data.rows
											usra[0]['LISTMENU']=params['LISTMENU']
											//console.log(usra[0]['LISTMENU'])
										}
									} catch(e){
										params['LISTMENU']=[
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
								}
								//console.log('params ->',params)
							}
							var rta1=isiautores.filter(it => it.sessionId === sessionId);
							//.log('isiautores ->',JSON.stringify(rta1.rows))
							if (rta1.length>0){
								
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
										//console.log('isiautores->',rta1)
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
									}
								} catch(e){}
							}
							
						} catch(e){
							var rta =[]
						}
						if (autoreply==1){
							var pesannya={
									  "text": params['HOME'],
									  "footer": params['FOOTER'],
									  "title": params['TITLE'],
									  "buttonText": "Pilih Menu",  
									  "sections":params['LISTMENU']
									}
							//console.log(JSON.stringify(pesannya))
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
								var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":rta[0]['DESKRIPSI'],"footer":params['FOOTER'],"templateButtons":templateButtons}
								wa.sendMessage(message.key.remoteJid,pesannya)//conn.sendMessage(sender, { url: link }, MessageType.document, { mimetype: Mimetype['pdf'],filename : namefile })
							} else {						
								//console.log('isipesan->',isipesan)
								if (isipesan.toUpperCase()=='INFO'||isipesan.toUpperCase()=='mnuhome'||isipesan.toUpperCase()=='MENU'){
									
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='mnuikm'||isipesan.toUpperCase()=='IKM'){
									const buttons = [
									  {buttonId: 'id1', buttonText: {displayText: '🤩 Sangat Bagus'}, type: 1},
									  {buttonId: 'id2', buttonText: {displayText: '😍 Bagus'}, type: 1},
									  {buttonId: 'id3', buttonText: {displayText: '😊 Biasa saja'}, type: 1},
									  {buttonId: 'id4', buttonText: {displayText: '😱 Kurang Bagus'}, type: 1},
									  {buttonId: 'id5', buttonText: {displayText: '🔰 Menu Utama'}, type: 0}
									]
									const templateButtons = [
										{index: 1, quickReplyButton: {displayText: '🤩 Sangat Bagus', id: 'id4'}},
										{index: 2, quickReplyButton: {displayText: '😍 Bagus', id: 'id3'}},
										{index: 3, quickReplyButton: {displayText: '😊 Biasa saja', id: 'id2'}}
																	

									]
									var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},
									"caption":"Bantu kami, untuk menilai pelayanan kami. Agar kami bisa lebih baik dalam melayanai masyarakat penguna layanan KUA.","footer":params['FOOTER'],"buttons":buttons}
									wa.sendMessage(message.key.remoteJid,pesannya)
								} else if (isipesan=='id1'||isipesan=='id2'||isipesan=='id3'||isipesan=='id4'){
									var res=[]
									var payload=new URLSearchParams({"aksi":"IKMin","nomor":message.key.remoteJid,"nilai":isipesan})
									var url='https://script.google.com/macros/s/'+params["IDGAS"]+'/exec'
									res = await axios.post(url,payload);
									const templateButtons = [
											{index: 1, quickReplyButton: {displayText: '🔰 Menu Utama',id:"mnuhome"}}
										]
									if (res.data.success){						
										var pesannya={"image":{"url":"https://drive.google.com/uc?export=view&id="+params['HEADER']},"caption":"🙏 Terima kasih, atas partisipasi anda dalam IKM KUA Kami.","footer":params['FOOTER'],"templateButtons":templateButtons}
									} else {
										if (res.data.pesan!=''){
											var pesannya={"text":res.data.pesan,"footer":params['FOOTER'],"templateButtons":templateButtons}
										
										} else {
											var pesannya={"text":"🙏 Mohon maaf, penilaian anda tidak bisa kami tindak lanjuti, telah terjadi masalah di server kami","footer":params['FOOTER'],"templateButtons":templateButtons}
										}
									}
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
								} else if (isipesan=='mnukartunikah'||isipesan=='KARTUNIKAH'){
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
									pesannya['text']="Untuk mengetahui riwayat pernikahan anda ketik *BIN#[nama anda]#[ nama orang tua laki-laki]*, atau *BINTI#[nama anda]#[ nama orang tua laki-laki]*\n\ncontoh :\n*BIN#siti aminah#Joko Suparto*"
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
									
									try{
										isipesan=(message.message.conversation)
										isipesan=isipesan.toUpperCase();
										var isit=isipesan.match("BIN#")
										var isit1=isipesan.match("BINTI#")
										var isit2=isipesan.match("BN#")
										var isit3=isipesan.match("NC#")
										if (isit=='BIN#' || isit1=='BINTI#'){
											var dt=isipesan.split('#')
											pesannya['text']='🙏 Mohon ditunggu, system kami sedang melakukan proses pencarian Data Nikah atas nama *'+dt[1]+'* bin/binti *'+dt[2]+'*'
											wa.sendMessage(message.key.remoteJid,pesannya)
											await delay(500)
											var res=[]
											var payload=new URLSearchParams({"aksi":"SNA","nama":dt[1],"ayah":dt[2]})
											var url='https://script.google.com/macros/s/'+params["IDGAS"]+'/exec'
											res = await axios.post(url,payload);

											if (res.data.success){
												var tglcatat=res.data.rows[0]['tglcatat']
												
												pesannya['text']='🙏 Terima kasih telah menunggu, pencarian Data Nikah atas nama *'+dt[1]+'* bin/binti *'+dt[2]+'*\n\n ✅ *Tercatat* di KUA kami dengan nomor pencatatan [ *'+res.data.rows[0]['no_akta']+'* ] tercatat pada tanggal *'+tglcatat+'* \n\nTerima Kasih'
											} else {
												pesannya['text']='🙏 Terima kasih telah menunggu, pencarian Data Nikah atas nama *'+dt[1]+'* bin/binti *'+dt[2]+'*\n\n ❌ *Tidak ditemukan* di system kami\n\nTerima kasih'
											}
											wa.sendMessage(message.key.remoteJid,pesannya)
										} else if (isit2=='BN#'){
											var dt=isipesan.split('#')
											pesannya['text']='🙏 Mohon ditunggu, system kami sedang melakukan proses pencarian Data Buku Nikah dengan nomor seri porporasi *'+dt[1]+'*'
											wa.sendMessage(message.key.remoteJid,pesannya)
											await delay(500)
											var res=[]
											var payload=new URLSearchParams({"aksi":"KTN","sp":dt[1]})
											var url='https://script.google.com/macros/s/'+params["IDGAS"]+'/exec'
											res = await axios.post(url,payload);

											if (res.data.success){
												var tglcatat=res.data.rows[0]['tglcatat']
												
												pesannya['text']='🙏 Terima kasih telah menunggu, pencarian Data Nikah dengan nomor seriporporasi *'+dt[1]+'*\n\n ✅ *Tercatat* di KUA kami dengan nomor pencatatan [ *'+res.data.rows[0]['no_akta']+'* ] tercatat pada tanggal *'+tglcatat+'*\n\nKartu nikah dapat di unduh link dibawah ini :\n'+res.data.rows[0]['kartunikah']+' \n\nTerima Kasih'
											} else {
												pesannya['text']='🙏 Terima kasih telah menunggu, pencarian Data Nikah atas nama *'+dt[1]+'* bin/binti *'+dt[2]+'*\n\n ❌ *Tidak ditemukan* di system kami\n\nTerima kasih'
											}
											wa.sendMessage(message.key.remoteJid,pesannya)
										} else if (isit3=='NC#'){
											try{
												var dt=isipesan.split('#')
												var tgln=dt[1]
												var s=tgln.split('/')
												var date=new Date(s[2]+'-'+s[1]+'-'+s[0])	
												var date1=new Date(new Date(s[2]+'-'+s[1]+'-'+s[0]).getTime()+(1*24*60*60*1000))											
												var tahun = date.getFullYear();
												var bulan = date.getMonth();
												var tanggal = date.getDate();
												var hari = date.getDay();
												var jam = date.getHours();
												var menit = date.getMinutes();
												var detik = date.getSeconds();
												switch(hari) {
														 case 0: hari = "Minggu"; break;
														 case 1: hari = "Senin"; break;
														 case 2: hari = "Selasa"; break;
														 case 3: hari = "Rabu"; break;
														 case 4: hari = "Kamis"; break;
														 case 5: hari = "Jum'at"; break;
														 case 6: hari = "Sabtu"; break;
														}
												switch(bulan) {
														 case 0: bulan = "Januari"; break;
														 case 1: bulan = "Februari"; break;
														 case 2: bulan = "Maret"; break;
														 case 3: bulan = "April"; break;
														 case 4: bulan = "Mei"; break;
														 case 5: bulan = "Juni"; break;
														 case 6: bulan = "Juli"; break;
														 case 7: bulan = "Agustus"; break;
														 case 8: bulan = "September"; break;
														 case 9: bulan = "Oktober"; break;
														 case 10: bulan = "November"; break;
														 case 11: bulan = "Desember"; break;
														}
												var tglnf = hari + ", " + tanggal + " " + bulan + " " + tahun;												
												pesannya['text']='🙏 Mohon ditunggu, system kami sedang melakukan proses pencarian Jadwal Nikah pada hari/tanggal *'+tglnf+'*\n\n..☕️☕️..'
												wa.sendMessage(message.key.remoteJid,pesannya)
												await delay(500)
												var res=[]
												var tgl=dateFormat(date, "yyyy-mm-dd");
												var sd=dateFormat(date1, "yyyy-mm-dd");
												var payload=new URLSearchParams({"aksi":"SJDWL","tgl":tgl,"sd":sd})
												//console.log(JSON.stringify(payload))
												var url='https://script.google.com/macros/s/'+params["IDGAS"]+'/exec'
												res = await axios.post(url,payload);
												if (res.data.success){
													var html=""
													for (var i=0;i<res.data.rows.length;i++){
														//html+='🚹 *'+res.data.rows[i]['suami_nama'].trim()+'*\n🚺 *'+res.data.rows[0]['istri_nama'].trim()+'*\n👤 _'+res.data.rows[i]['penghulu_hadir_nm'].trim()+'*\n🏠 _'+res.data.rows[i]['alamat_akad'].trim()+'_\n⏰ *'+res.data.rows[i]['pukul']+'*\n\n'
														html+='🚹 *'+res.data.rows[i]['suami_nama'].trim()+'*\n🚺 *'+res.data.rows[i]['istri_nama'].trim()+'*\n🏠 _'+res.data.rows[i]['alamat_akad'].trim()+'_\n⏰ *'+res.data.rows[i]['pukul']+'*\n\n'
													}
													pesannya['text']='🙏 Terima kasih telah menunggu, Jadwal Nikah pada tanggal *'+tglnf+'*\n\n ✅ Terdapat *'+(res.data.rows.length).toString()+'* jadwal nikah, dengan detail sbb:\n\n'+html+'\n\nTerima Kasih'
												} else {
													pesannya['text']='🙏 Terima kasih telah menunggu, Jadwal Nikah pada tanggal *'+tglnf+'*\n\n ❌ *Tidak ditemukan* di system kami\n\nTerima kasih'
												}
												//wa.sendMessage(message.key.remoteJid,pesannya)
											} catch(e) {
												var date=new Date(s[2]+'-'+s[1]+'-'+s[0])	
												pesannya['text']='🙏 format tanggal jadwal nikah tidak dikenal!\n\nUntuk mengetahui jadwal nikah KUA kami, ketik *NC#[tanggal akad tanggal/bulan/tahun]*\n\ncontoh:\n*NC#01/02/2022*\n'
											}
											wa.sendMessage(message.key.remoteJid,pesannya)
										} else {
											if (autoinfo==1){
												var toj=message.key.remoteJid
												let resut = toj.includes("broadcast")
												//console.log(resut)
												if (resut==false){
													//console.log('pesannya',JSON.stringify(pesannya))
													if (pesannya){
														wa.sendMessage(message.key.remoteJid,pesannya)
													}
												} else {
													console.log('message.key.remoteJid ->',message.key.remoteJid)
													console.log('broadcast message ',message.key.participant)
												}
											}
										}
									}catch(e){
										
									}
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
			console.log('messages.upsert ->',e.message)
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
		var dt= await session.sendMessage(receiver, message) 
        return dt
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
const bacaGroupUser = async(dt)=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"GRP","group":dt})
		let url='https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec'
		res = await axios.post(url,payload);
		//console.log('bacaGroupUser',res)
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
		//console.log(res)
	} catch(error){
        console.log('bacaAllAReply',error.message)
		var res=[]
	}
	return res
	//console.log(res)
}
const bacaListMenu = async(idg)=>{
	var res=[]
	try{
		var res=[]
		let payload=new URLSearchParams({"aksi":"LM"})
        let payload1=({"aksi":"LM"})
		let url='https://script.google.com/macros/s/'+idg+'/exec'
		res = await axios.post(url,payload);
		//console.log('list menu',res)
	} catch(error){
        console.log('list menu',error.message)
		var res=[]
	}
	return res
}
export {
	kirimpesanTL,
	bacaListMenu,
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
