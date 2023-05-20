const sgMail = require('@sendgrid/mail')
require('dotenv').config()

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const sendEmail = async(data) => {

    const email = {...data, from: "kathy.lytvyn@gmail.com"}

    try {
        await sgMail.send(email)
        console.log('email sent successfully')
        return true;
        
    } catch (error) {
        console.log('error occurred:', error.message)
    }

}

module.exports = {
    sendEmail
}



