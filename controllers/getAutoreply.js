import { bacaautoresponse } from '../whatsapp.js'
import response from './../response.js'

const getAutoreply = async (req, res) => {
	try{
		//console.log(req)
		const idgas = req.body.idgas
		const sessionid = req.body.sessionid
		
		let dtx = await bacaautoresponse(idgas)
		//console.log(dtx)
		if (dtx){
			var dt={"sessionId":sessionid,"rows":dtx.data.rows}
			//console.log(dt)
			let idr =isiautores.filter(it => it.sessionId === sessionid);
			if (idr.length>0){
				for( var i = 0; i < isiautores.length; i++){ 
					if ( isiautores[i]['sessionId'] === sessionid) { 
						isiautores.splice(i, 1); 
					}
				}
			}
			isiautores.push(dt)
			response(res, 200, true, 'Success load AutoReply.')
		} else {
			response(res, 200, false, 'Failed load AutoReply.')
		}
	} catch(e){
		console.log('error console.log (isiautores)',e.message)
		response(res, 500, false, 'Failed to load AutoReply.')
	}
}

export default getAutoreply
