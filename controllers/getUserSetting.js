import { bacaGroupUser,bacaListMenu } from '../whatsapp.js'
import response from './../response.js'

const getUsersetting = async (req, res) => {
	try{
		const idgas = req.body.idgas
		const sessionid = req.body.sessionid
		settingall=await bacaGroupUser(group)
		//console.log('settingall',settingall.data.rows)
		if (settingall.data.rows.length>0){
			let idr =settingall.data.rows.filter(it => it.SESSION === sessionid);
			if (idr.length>0){
				var newdt={}
				newdt=(idr[0])
				let dtx=await bacaListMenu(idgas)
				if (dtx.data.rows.length>0){					
					newdt['LISTMENU']=(dtx.data.rows)
					for( var i = 0; i < settingall.data.rows.length; i++){ 
						if ( settingall.data.rows[i]['SESSION'] === sessionid) { 
							settingall.data.rows.splice(i, 1);
							break;
						}
					}
					settingall.data.rows.push(newdt)
					//console.log('settingall',settingall.data.rows)
				}
			}
		}
		
		response(res, 200, true, 'Success load User Setting.')
		
	} catch(e){
		console.log('error console.log (dtx)',e.message)
		response(res, 500, false, 'Failed to load User Setting.')
	}
}

export default getUsersetting
