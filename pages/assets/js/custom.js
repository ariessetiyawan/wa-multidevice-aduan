$(document).ready(function() {
	$('#txt_noHP').val(localStorage.getItem('user_aktif'));	
	console.log($('#txt_noHP').val(localStorage.getItem('user_aktif')))
	//console.log('sessionStorage '+sessionStorage.getItem('wa_aduan_center')+","+sessionStorage.getItem('wa_aduan_center_login'))
    if (sessionStorage.getItem('wa_aduan_center')==0 || sessionStorage.getItem('wa_aduan_center_login')==0|| sessionStorage.getItem('wa_aduan_center')==undefined||sessionStorage.getItem('wa_aduan_center_login')==undefined){
		location.href = "/pages/sign-in.html";
	} else {
		sessionStorage.setItem('wa_aduan_center_login',1)
		
	}

});
function randomString(length) {
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghiklmnopqrstuvwxyz'.split('');

    if (! length) {
        length = Math.floor(Math.random() * chars.length);
    }

    var str = '';
    for (var i = 0; i < length; i++) {
        str += chars[Math.floor(Math.random() * chars.length)];
    }
    return str;
}
$(document).on("click",".bt_logout", function(){
	sessionStorage.setItem('wa_aduan_center',0)
	sessionStorage.setItem('wa_aduan_center_login',0)
	sessionStorage.setItem('wa_aduan_center_expired',0)
	location.href="/pages/sign-in.html"
})
$(document).on("click","#hapus_device1", function(){
	$('#delssMDL').modal('show');
})
$(document).on("click","#hapus_device", function(){
	/*localStorage.setItem('wacenter_IDGAS',$('#txts_IDGAS').val())
	localStorage.setItem('wacenter_IDSHEET',$('#txts_IDSHEET').val())
	localStorage.setItem('wacenter_urladuan',$('#txts_urladuan').val())
	var frms={"sessionid":localStorage.getItem('user_aktif'),"IDGAS":localStorage.getItem('wacenter_IDGAS'),"IDSHEET":localStorage.getItem('txts_IDSHEET')}
	try{
	socket.emit("setting_form",frms)
	}catch(e){}*/
	var kode=$('#txt_noHP').val();
	var wd=$('.card-qrcode').width();
	if (kode !==''){
		const qrcode = document.getElementById("qrcode")
		$.ajax({
			url:`/sessions/delete/${kode}`,
			method:'DELETE',
			success:function(e){
				//var dt=JSON.parse(e)
				//console.log(dt.success)
				console.log(e.success)
				if (!e.success){
					qrcode.setAttribute("max-width", wd+"px")
					qrcode.setAttribute("src", "./assets/img/cross.svg")
					qrcode.setAttribute("alt", "Terjadi error")
				} else {

					$('#txt_noHP').val('');
					localStorage.setItem('user_aktif','')
					qrcode.setAttribute("src", "./assets/img/scanhp.png")
					qrcode.setAttribute("alt", "qrcode")
				}
				$('#delssMDL').modal('hide');
				//console.log(JSON.stringify(e))
			},
			error:function(e){
				//console.log((e))
				alert((e.responseJSON.message))
				$('#delssMDL').modal('hide');
			}
				
			
		})
	} else {
		alert('Nomor Handphone harus diisi !')
	}
})
$(document).on("click","#mnuL_frmpesan", function(){
	$('#txts_nosession').val($('#txt_noHP').val())
	$('#txts_to').val('')
	$('#txts_isipesan').val('')
	$('#pesanMdl').modal('toggle');
})
$(document).on("click","#bt_close_pesan", function(){
	$('#pesanMdl').modal('hide');
})
$(document).on("click","#bt_save_pesan", function(){
	
	var sip=$('#txts_to').val()
	sip=parseInt(sip)
	sip="62"+sip.toString()
	var pesanx=$('#txts_isipesan').val()
	//pesanx=pesanx.replace('\n',"%0a %0a")
	const templateButtons = [
	  {index: 1, urlButton: {displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys'}},
	  {index: 2, callButton: {displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901'}},
	  {index: 3, quickReplyButton: {displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message'}},
	]
	const buttonsMD = [
	   { 
		  index: 0, 
		  urlButton: {
			  url: 'https://github.com/jrCleber/exemples-baileys',
			 displayText: '⭐ IKM KUA ⭐',
		  }
	   },
	  /* {
		  index: 1,
		  callButton: { displayText: 'Call me 📱', phoneNumber: '+55 31 0 0000-000', }
	   },
	   {
		  index: 2,
		  quickReplyButton: { id: 'id1', displayText: 'ReplyBtn1' }
	   },
	   {
		  index: 3,
		  quickReplyButton: { id: 'id2', displayText: 'ReplyBtn2' }
	   }*/
	]
	var isipesanx=	{receiver: sip, 
						message: {
							caption: pesanx,
							footer: "createby ariessda",
							templateButtons: buttonsMD,
							image: {url: './pages/assets/img/logos/visa.png'}
						}
				}
	
	const buttons = [
	  {buttonId: 'id1', buttonText: {displayText: 'Button 1'}, type: 1},
	  {buttonId: 'id2', buttonText: {displayText: 'Button 2'}, type: 0},
	  {buttonId: 'id3', buttonText: {displayText: 'Button 3'}, type: 0}
	]

	var isipesanx1={receiver: sip, 
						message: {caption: pesanx,
								  footer: "nice footer, link: https://google.com",
								  image: {url: './pages/assets/img/logos/visa.png'},
								  buttons: buttons,
								  headerType: 2
						}
				}
	//var data={"receiver":sip,"message":isipesanx}
	//console.log(isipesanx)
	var idss=$('#txt_noHP').val()
	$.ajax({
		url:'/chats/send?id='+(idss),
		method:'POST',
		data:isipesanx,
		success:function(e){
			if (e.success){
				localStorage.setItem('user_aktif',$('#txt_noHP').val())
			}
			alert(e.message)
			console.log(e)
		},
		error:function(e){
			console.log(e)
		}
	})
})
$(document).on("click","#mnuL_frmaduan", function(){
	var url=localStorage.getItem('wacenter_urladuan')
	window.open(url)
})
$(document).on("click","#mnuL_gsheet", function(){
	var url=localStorage.getItem('wacenter_IDSHEET')
	window.open(url)
})
$(document).on("click","#mnuL_setting", function(){
	$('#txts_sessionurl').val(localStorage.getItem('wacenter_sessionurl'))
	$('#txts_session').val(localStorage.getItem('user_aktif'))
	$('#txts_IDGAS').val(localStorage.getItem('wacenter_IDGAS'))
	$('#txts_IDSHEET').val(localStorage.getItem('wacenter_IDSHEET'))
	$('#txts_urladuan').val(localStorage.getItem('wacenter_urladuan'))
	$('#txts_urlapp').val(localStorage.getItem('wacenter_urlapp'))
	$('#settingMdl').modal('toggle');
})
$(document).on("click","#mnuL_setting1", function(){
	//alert('mnuL_setting1')
	$('#mnuL_setting').trigger("click")
})

$(document).on("click","#bt_close_setting", function(){
	$('#settingMdl').modal('hide')
})
$(document).on("click","#bt_save_setting", function(){
	try{
		var data={
			"sessionid":$('#txts_session').val(),
			"idgas":$('#txts_IDGAS').val(),
			"idsheet":$('#txts_IDSHEET').val(),
			"aduan":$('#txts_urladuan').val(),
			"urlapp":$('#txts_urlapp').val(),
			"urlsession":$('#txts_sessionurl').val(),
			"username":sessionStorage.getItem('wa_aduan_center_username'),
			"password":sessionStorage.getItem('wa_aduan_center_password'),
			"aksi":"10"
		}

		$.ajax({
			url:"https://script.google.com/macros/s/AKfycbz4P6jwBXqY98dwGGrT44c9Agz54h0vgE47WNYGRtGu6QkbJGck/exec",
			method:"POST",
			data:data,
			success:function(e){
				if (e.success){
					localStorage.setItem('user_aktif',$('#txts_session').val())
					localStorage.setItem('wacenter_urlapp',$('#txts_urlapp').val())
					localStorage.setItem('wacenter_IDGAS',$('#txts_IDGAS').val())
					localStorage.setItem('wacenter_IDSHEET',$('#txts_IDSHEET').val())
					localStorage.setItem('wacenter_urladuan',$('#txts_urladuan').val())
					localStorage.setItem('wacenter_sessionurl',$('#txts_sessionurl').val())
					
					var frms={
						"sessionid":localStorage.getItem('user_aktif'),
						"idgas":$('#txts_IDGAS').val(),
						"idsheet":$('#txts_IDSHEET').val(),
						"urlduan":$('#txts_urladuan').val(),
						"urlapp":$('#txts_urlapp').val(),
						"backup":$('#txts_sessionurl').val()

					}
					socket.emit("setting_form",frms)
					$('#settingMdl').modal('hide')
				} else {
					alert(e.message)
				}
			},
			error:function(e){
				alert('terjadi error !')
			}
		})
	} catch(e){
		alert ('terjadi error !')
	}
	
})
$(document).on("click","#cmd_qrcode", function(){
	var kode=$('#txt_noHP').val();
	if (kode !==''){
		const qrcode = document.getElementById("qrcode")
		var data={"id":kode,"isLegacy":false}
		qrcode.setAttribute("src", "./assets/img/loader.gif")
		qrcode.setAttribute("alt", "mohon ditunggu !")
		$.ajax({
			url:'/sessions/add',
			type:'POST',
			data:data,
			success:function(e){
				if (!e.success){
					
					qrcode.setAttribute("src", "./assets/img/cross.svg")
					qrcode.setAttribute("alt", "qrcode")
				} else {
					console.log(e)
					//localStorage.setItem('user_aktif',kode)
					//localStorage.setItem('user_aktif',kode)
					qrcode.setAttribute("src", e.data.qr)
					qrcode.setAttribute("alt", "qrcode")
				}
				//console.log(JSON.stringify(e))
			},
			error:function(e){
				console.log((e))
			}
				
			
		})
	} else {
		alert('Nomor Handphone harus diisi !')
	}
})