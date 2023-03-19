const express = require('express');
const Joi = require('joi');
const { listContacts, getContactById, removeContact, addContact, updateContact } = require('../../models/contacts');

const router = express.Router()

const contactSchema = Joi.object({
    name: Joi.required(), 
    email: Joi.required(), 
    phone: Joi.required()
  })

router.get('/', async (req, res, next) => {
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

router.get('/:id', async (req, res, next) => {

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

router.post('/', async (req, res, next) => {

  try {
    const body = req.body
    const {error} = contactSchema.validate(body)

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

router.delete('/:id', async (req, res, next) => {

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

router.put('/:id', async (req, res, next) => {
  
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

module.exports = router
