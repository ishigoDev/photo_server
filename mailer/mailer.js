import nodemailer from 'nodemailer';
import env from 'dotenv';
env.config();
let transporter = nodemailer.createTransport({    
        service: 'gmail',
        auth: {        
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,        
        }      
});

export default transporter;