import nodemailer from 'nodemailer';
import env from 'dotenv';
env.config();
let transporter = nodemailer.createTransport({    
        service: 'gmail',
        auth: {        
          user: "evincedevapi@gmail.com",
          pass: "OldEvince12#",        
        }      
});

export default transporter;