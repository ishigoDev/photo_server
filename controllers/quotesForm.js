import express from "express";
import Message from "../model/quoteModel.js";
import {quoteFormValidator} from '../middleware/validator.js';
import env from 'dotenv';
import validate_function from '../helper/validator.js';
import handlebars from 'handlebars';    
import * as fs from 'fs';
import * as path from 'path';
import transporter from '../mailer/mailer.js';
env.config();
const router = express.Router();

const quotesFunction = (data,res) =>{    
      const {
        firstName,
        lastName,
        email,
        phoneNumber,
        subject,        
        message,
    }= data;    
    const _message  = new Message({
        firstName,
        lastName,
        email,
        phoneNumber,
        subject,        
        message,
    });
    _message.save((error,message_dbresponse)=>{
        if(error) return res.status(400).json({message:error});
        return res.status(200).json({status:1,message:'Data Saved !'});                    
        if(message_dbresponse){            
            const __dirname = path.resolve(path.dirname('')); 
            const filePath = path.join(__dirname,'/mailer/quote_submit.html');                
            const source = fs.readFileSync(filePath, 'utf-8').toString();
            const template = handlebars.compile(source);                
            const replacements = {
                email: message_dbresponse.email,                
            };
            const htmlToSend = template(replacements);
            let mailOptions = {
                from: process.env.MAIL_USERNAME,
                to: message_dbresponse.email,
                subject: 'Quote Mail',                
                html: htmlToSend
            };                
              transporter.sendMail(mailOptions, function(err, data) {
                if (err) {
                    console.log("Error - Mail   " + err);
                } else {                                                    
                return res.status(200).json({status:1,message:'Data Saved !'});                    
                }
            });               
        }
    });
}

router.post('/quotes-form',quoteFormValidator,(req,res)=>{    
    const errors = validate_function(req);
    if(!errors.isEmpty()){
        return res.status(422).json(errors.array());
    }
    quotesFunction(req.body,res);    
});

export default router;