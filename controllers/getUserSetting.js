import { bacaAllUser } from '../whatsapp.js'
import response from './../response.js'

const getUsersetting = async (req, res) => {
	try{
		//console.log(req)
		//const idgas = req.body.idgas
		const sessionid = req.body.sessionid
		settingall=await bacaAllUser('%')
		let dtx = await bacaAllUser(sessionid)
		//console.log(JSON.stringify(dtx.data.rows))
		
		response(res, 200, true, 'Success load User Setting.')
		
	} catch(e){
		console.log('error console.log (isiautores)',e.message)
		response(res, 500, false, 'Failed to load User Setting.')
	}
}

export default getUsersetting
