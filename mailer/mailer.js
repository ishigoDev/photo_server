import nodemailer from 'nodemailer';
import env from 'dotenv';
env.config();
let transporter = nodemailer.createTransport({    
        service: 'gmail',
        host: 'smtp.gmail.com',
        auth: {        
          user: process.env.MAIL_USERNAME,
          pass: process.env.MAIL_PASSWORD,        
        }      
});

export default transporter;