const { Contact } = require('../models/contacts')

const listContacts = async () => {

    try {
      const contacts = await Contact.find({});
  
      return contacts    
    } 
    catch (error) {
      return error.message
    }
  }
  
  const getContactById = async (contactId) => {
  
    try {
      const contact = await Contact.findById(contactId);
  
      if(!contact){
          return null
      }
  
      return contact  
    } 
    catch (error) {
      return error.message
    }
  }
  
  const removeContact = async (contactId) => {
  
    try {
      const result = Contact.findByIdAndRemove(contactId)
      
      if (!result) {
        return null
      }
  
      return result    
  
    } catch (error) {
      return error.message      
    }
  
  }
  
  const addContact = async (body) => {
  
    try {
      const contact = await Contact.create(body)
      return contact
      
    } catch (error) {
      return error.message 
    }
  }
  
  const updateContact = async (contactId, body) => {
    try {
      const result = Contact.findByIdAndUpdate(contactId, body, {new: true})
  
      if (!result) {
        return null
      }
  
      return result
      
    } catch (error) {
      return error.message 
    }
  }
  
  const updateStatusContact = async (contactId, body) => {
    try {
      const result = Contact.findByIdAndUpdate(contactId, body, {new: true})
  
      if (!result) {
        return null
      }
  
      return result
    } catch (error) {
      return error.message 
    }
  
  }
  
  module.exports = {
    listContacts,
    getContactById,
    removeContact,
    addContact,
    updateContact,
    updateStatusContact,
  }