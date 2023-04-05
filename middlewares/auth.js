const jwt = require('jsonwebtoken')
const { User } = require('../models/user')
const dotenv = require('dotenv')

dotenv.config();
const { SECRET_KEY } = process.env

const auth = async(req, res, next) => {

    const {authorization=""} = req.headers;
    const [bearer, token] = authorization.split(" ");

    console.log('auth middleware - token from header:', token)

    if (bearer !== "Bearer") {
        return res.status(401).json({
            "message": "Not authorized"
        });
    }

    try {
        const {id} = jwt.verify(token, SECRET_KEY)
        console.log('auth middleware - received id from token:', id)
        const user = await User.findById(id)
        console.log('auth middleware - user by id:', user)

        if (!user || user.token !== token) {
            return res.status(401).json({
                "message": "Not authorized"
            });
        }

        req.user = user;
        next();
    } 
    catch (error) {
        if (error.message === "Invalid signature"){
            return res.status(401).json({
                "message": "Not authorized"
            });
        }  
        return res.status(500).json({
            "error": error.message,
          });      
    }

}

module.exports = {
    auth
}