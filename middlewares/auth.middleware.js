const jwt = require('jsonwebtoken')


module.exports = function(req,res,next){
    // Get token from header
    const token = req.header('Authorization')

    // check if not token
    if(!token){
        return res.status(401).json({msg: 'No token, authorization denied'})
    }

    //verfiy token
    try{
        const  decoder = jwt.verify(token, process.env.jwtToken)

        req.user = decoder.user
        next()
    } catch(err){
        res.status(401).json({ msg: 'Token is not valid '})
    }
}