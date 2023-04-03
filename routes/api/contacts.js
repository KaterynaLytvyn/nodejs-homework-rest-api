const express = require('express');
const { joiSchema } = require('../../models/contacts');
const { listContacts, getContactById, removeContact, addContact, updateContact, updateStatusContact } = require('../../controllers/contacts');
const { auth } = require('../../middlewares/auth')


const router = express.Router()

router.get('/', auth, async (req, res) => {
  try {
    const contacts = await listContacts()
    res.status(200).json({
      contacts
    });    
  } 
  catch (error) {
    res.status(500).json({
      msg: error.msg,
    });
  }

})

router.get('/:id', auth, async (req, res, next) => {

  try {
    const { id } = req.params
    const contact = await getContactById(id)
  
    if(contact==null){
      res.status(404).json({
        "message": "Not found"
      })
    }

    else{
      res.status(200).json(contact)
    }
    
  } catch (error) {
    res.status(500).json({
      msg: error.msg,
    });    
  }
  
})

router.post('/', auth, async (req, res, next) => {

  try {
    const body = req.body
    const {error} = joiSchema.validate(body)

    if (error) {
      error.status = 400;
      error.message = "missing required name field"
      throw error
    }

    const newContact = await addContact(body)

    res.status(201).json({
      newContact
    })
 
  } 
  catch (error) {
    res.status(error.status).json({
      message: error.message,
    });      
  }

})

router.delete('/:id', auth, async (req, res, next) => {

  try {
    const { id } = req.params
    const result = await removeContact(id)
  
    if (result) {
      res.status(200).json({"message": "contact deleted"})
    }

    else {
      res.status(404).json({"message": "Not found"})
    }
    
  } 
  catch (error) {
    res.status(500).json({
      msg: error.msg,
    }); 
  }

})

router.put('/:id', auth, async (req, res, next) => {
  
  try {
    const { id } = req.params
    const body = req.body

    if (Object.keys(body).length === 0) {
      res.status(400).json({"message": "missing fields"})
    }

    const result = await updateContact(id, body)

    if (result) {
      res.status(200).json({result})
    }
    else {
      res.status(404).json({"message": "Not found"})
    }
    
  } 
  catch (error) {
    
  }
})

router.patch('/:id/favorite', auth, async (req, res, next) => {
  try {
    const { id } = req.params
    const body = req.body

    if (!Object.keys(body).includes('favorite')) {
      res.status(400).json({"message": "missing field favorite"})
    }

    const result = await updateStatusContact(id, body)

    if (result) {
      res.status(200).json({result})
    }
    else {
      res.status(404).json({"message": "Not found"})
    }
  } 
  catch (error) {
    
  }

})

module.exports = router
