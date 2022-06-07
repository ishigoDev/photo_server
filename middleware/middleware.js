import jwt from 'jsonwebtoken';
import env from 'dotenv';
import multer from 'multer';
import * as path from 'path';
import * as fs from 'fs';
env.config();

export const requireSignin = (req,res,next) =>{
    if(req.headers.authorization){
        const token = req.headers.authorization.split(" ")[1];
        jwt.verify(token,process.env.JWT_SECRET,function(err,decoded){
            if(err) return res.status(401).json({ profile_error:'-1'});
            else{
                req.user = decoded; 
                next();
            }        
        });
    }else{
        return res.status(401).json({ profile_error:'1' ,message : 'Authorization Required !'});
    }
    
}

export const imgproperty = multer.diskStorage({
    destination:function(req,file,cb){        
        const __dirname = path.resolve(path.dirname('')); 
        const d = new Date();
        let year = d.getFullYear(); 
        const profilePath = path.join(__dirname,'/public/images/'+year);        
        if (!fs.existsSync(profilePath)){
            fs.mkdirSync(profilePath);
        }
        cb(null,profilePath);
    },
    filename: function (req, file, cb) {              
        cb(null,'category-'+Date.now()+'-'+file.originalname);
    }
});
export const photoproperty = multer.diskStorage({
    destination:function(req,file,cb){        
        const __dirname = path.resolve(path.dirname('')); 
        const d = new Date();
        let year = d.getFullYear(); 
        const profilePath = path.join(__dirname,'/public/images/'+year);        
        if (!fs.existsSync(profilePath)){
            fs.mkdirSync(profilePath);
        }
        cb(null,profilePath);
    },
    filename: function (req, file, cb) {              
        cb(null,'photo-'+Date.now()+'-'+file.originalname);
    }
});