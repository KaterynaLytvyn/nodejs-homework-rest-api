const fs = require('fs/promises')
const path = require('path')
const { v4: uuidv4 } = require('uuid');

const contactsPath = path.resolve(__dirname, 'contacts.json')

const listContacts = async () => {

  try {
    const data = await fs.readFile(contactsPath)
    const contacts = JSON.parse(data)

    return contacts    
  } 
  catch (error) {
    return error.message
  }
}

const getContactById = async (contactId) => {

  try {
    const contacts = await listContacts();
    const contact = contacts.find(i => i.id === contactId)
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
    const contacts = await listContacts();
    const contactIdx = contacts.findIndex(i => i.id === contactId)

    if(contactIdx >= 0) {
      const newContacts = contacts.filter(i => i.id !== contactId)

      await fs.writeFile(contactsPath, JSON.stringify(newContacts))
      return contacts[contactIdx]
    }

    return null

    

  } catch (error) {
    return error.message      
  }

}

const addContact = async (body) => {

  try {
    const contacts = await listContacts();
    const contact = {
        "id": uuidv4(),
        "name": body.name,
        "email": body.email,
        "phone": body.phone
    }
    contacts.push(contact)

    await fs.writeFile(contactsPath, JSON.stringify(contacts))
    return contact
    
  } catch (error) {
    return error.message 
  }
}

const updateContact = async (contactId, body) => {
  try {
    const contacts = await listContacts();
    const contactIdx = contacts.findIndex(i => i.id === contactId)

    if (contactIdx === -1){
      return null;
    }

    const contact = contacts[contactIdx]

    const { name, email, phone } = body

    if (name) {contact.name = name}
    if (email) {contact.email = email}
    if (phone) {contact.phone = phone}

    contacts[contactIdx] = contact;

    await fs.writeFile(contactsPath, JSON.stringify(contacts))
    return contacts[contactIdx]
    
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
}
