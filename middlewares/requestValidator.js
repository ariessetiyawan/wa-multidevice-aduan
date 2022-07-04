import { validationResult } from 'express-validator'
import response from './../response.js'

const validate = (req, res, next) => {
    const errors = validationResult(req)
	//console.log(' vvalidate errors',errors)
    if (!errors.isEmpty()) {
        return response(res, 400, false, 'Please fill out all required input.')
    }

    next()
}

export default validate
