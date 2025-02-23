const express = require('express');
const { joiRegisterSchema, joiLoginSchema } = require('../../models/user');
const { User } = require('../../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { auth } = require('../../middlewares/auth')
const { upload } = require('../../middlewares/upload')
const gravatar = require('gravatar')
const path = require('path')
const fs = require('fs/promises')
const jimp = require('jimp')
const {v4: uuidv4} = require('uuid')
const { sendEmail } = require('../../helpers/sendEmail')

dotenv.config();
const { SECRET_KEY } = process.env
const avatarsDir = path.join(__dirname,"../../", "public", "avatars");

const router = express.Router();

router.post('/register', async (req, res) => {
    const { subscription, email, password } = req.body

    const {error} = joiRegisterSchema.validate({ subscription, email, password })

    if (error) {
      return res.status(400).json({
        error: error.details,
      })
    }
    
    try {
        const user = await User.findOne({email})
        
        if(user) {
            return res.status(409).json({
                "message": "Email in use"
              });
        }

        const hashPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10))
        const avatarURL = gravatar.url(email)
        const verificationToken = uuidv4()
    
        const result = await User.create({subscription, email, password: hashPassword, avatarURL, verificationToken})

        const mail = {
          to: email,
          subject: "Confirm registration",
          html: `<p>To complete your registration, please confirm your email address: <a target="_blank" href="http://localhost:3000/api/users/verify/${verificationToken}">confirm email<a></p>`
        }

        await sendEmail(mail)

        res.status(201).json({
            "user": {
                "email": result.email,
                "subscription" : result.subscription,
                "avatarURL": avatarURL,
                "verificationToken": verificationToken
            }
        });
        
    } catch (error) {
        res.status(500).json({
            "error": error.message,
          }); 
    }

})

router.post('/login', async (req, res) => {
    const { email, password } = req.body
  
    const { error} = joiLoginSchema.validate({ email, password })

    if (error) {
        return res.status(400).json({
          error: error.details,
        })
      }
    
    try {
      const user = await User.findOne({email})
      
      if(!user) {
          return res.status(401).json({
              "message": "Email or password is wrong"
            });
      }

      const passCompare = bcrypt.compareSync(password, user.password)

      if(!passCompare) {
          return res.status(401).json({
              "message": "Email or password is wrong"
            });
      }

      if(!user.verify) {
        return res.status(401).json({
          "message": "Email is not verified"
        });
      }

      const payload = {
        id: user._id
      }

      const token  = jwt.sign(payload, SECRET_KEY)
      await User.findByIdAndUpdate(user.id, {"token": token})

      res.status(200).json({
        "token": token,
        "user": {
            "email": user.email,
            "subscription": user.subscription
          }
      }); 

    } 
    catch (error) {
        res.status(500).json({
            "error": error.message,
          });
    }
    
})

router.get('/current', auth, async (req, res) => {
  const { email, subscription } = req.user
  res.status(200).json({
    "email": email,
    "subscription": subscription
  })
})

router.post('/logout', auth, async (req, res) => {

  const { id } = req.user
  const user = await User.findById(id)

  if(!user){
    return res.status(401).json({
      "message": "Not authorized"
    });
  }

  await User.findByIdAndUpdate(user.id, {"token": null})
  res.status(204).json()

})

router.patch('/avatars', auth, upload.single("avatar"), async (req, res) => {
  const { path: tempUpload, originalname} = req.file;
  const { _id: id } = req.user
  const avatarImageName = `${id}_${originalname}`

  jimp.read(tempUpload)
  .then((image) => {
    image.resize(250, 250).write(tempUpload)
  })
  .catch((err) => {
    console.log(err)
  });

 
  try {
    const resultUpload = path.join(avatarsDir,avatarImageName)
    await fs.rename(tempUpload, resultUpload)

    const avatarURL = path.join("avatars", avatarImageName)
    await User.findByIdAndUpdate(req.user._id, {avatarURL})

    res.json({avatarURL})
  } 
  catch (error) {
    await fs.unlink(tempUpload)
  }

})

router.get('/verify/:verificationToken', async (req, res) => {

  const { verificationToken } = req.params;

  const user = await User.findOne({verificationToken})

  if(!user || user.verify) {
    return res.status(404).json({
      "message": "Not Found"
    });  
  }

  await User.findByIdAndUpdate(user._id, {verificationToken: null, verify: true})

  return res.status(200).json({
    "message": "Verification successful"
  }); 

})

router.post('/verify', async (req, res) => {

  const { email } = req.body

  if(!email){
    return res.status(400).json({"message": "missing required field email"})
  }

  const user = await User.findOne({email})

  if(!user){
    return res.status(400).json({"message": "user with this email is not found"})
  }

  if(user.verify){
    return res.status(400).json({"message": "Verification has already been passed"})
  }

  const mail = {
    to: user.email,
    subject: "Confirm registration",
    html: `<p>To complete your registration, please confirm your email address: <a target="_blank" href="http://localhost:3000/api/users/verify/${user.verificationToken}">confirm email<a></p>`
  }

  await sendEmail(mail)

  return res.status(200).json({"message": "Verification email sent"})

})


module.exports = router;