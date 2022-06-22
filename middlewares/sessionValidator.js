import { isSessionExists,downloadFileSession,createSession,isSessionFileExists } from '../whatsapp.js'
import response from './../response.js'

const validate = (req, res, next) => {
    const sessionId = req.query.id ?? req.params.id
	console.log(!isSessionExists(sessionId))
    if (!isSessionExists(sessionId)) {
		if (!isSessionFileExists(sessionId)){
			downloadFileSession(sessionId)
		} else {
			return response(res, 404, false, 'Session not found.')
		}
    } 
	//console.log(sessionId)
    res.locals.sessionId = sessionId
    next()
}

export default validate
