import express from "express";
import Admin from "../model/adminModel.js";
import Category from "../model/categoryModel.js";
import Photo from "../model/photoModel.js";
import jwt from 'jsonwebtoken';
import env from 'dotenv';
import {requireSignin, imgproperty , photoproperty} from '../middleware/middleware.js';
import transporter from '../mailer/mailer.js';
import * as fs from 'fs';
import * as path from 'path';
import multer from 'multer';
import handlebars from 'handlebars';    
import {signupValidation,loginValidator,forgetpasswordValidator,newpasswordValidator} from '../middleware/validator.js';
import validate_function from '../helper/validator.js';
import crypto from 'crypto';
import { Console } from "console";
import { nextTick } from "process";
env.config();
const router = express.Router();


const decrypt = (text) => {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let enKey = Buffer.from(text.key, 'hex')//will return key;
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(enKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
 }
const signUpFunction = (user,res) =>{    
    const {
        firstName,
        lastName,
        email,
        password,        
    }= user;
    const _admin_user = new Admin({
        firstName,
        lastName,
        email,
        password,        
    });
    _admin_user.save((error,user_data)=>{
        if(error) {
            if(error.code  == 11000) {
                return res.status(400).json({message:"User with this "+Object.keys(error.keyValue)[0]+" already exists."});          
            }else{
                return res.status(400).json({message:error});          
            } 
        } 
        if(user_data){
                return res.status(200).json({message:"User created successfully. Please Sign In !"})            
        }
    })
}

router.post('/signup',signupValidation,(req,res)=>{                
        const errors = validate_function(req);
        if(!errors.isEmpty()){
            return res.status(422).json(errors.array());
        }
        signUpFunction(req.body,res);            
});


const loginFunction = (user,res) =>{
    const token = jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:'600000000000000000000000000000000s'});
    const {_id,firstName,lastName,email,role , fullName} = user;
    res.status(200).json({
        token,
        user:{_id,firstName,lastName,email,role,fullName}
    });    
}
router.post('/login',loginValidator,(req,res)=>{    
    const errors = validate_function(req);
    if(!errors.isEmpty()){
        return res.status(422).json(errors.array());
    }
    Admin.findOne({email:req.body.email}).exec((error,user)=>{        
        if(error) return res.status(400).json({message:error});        
        if(user){            
            const decrypted_password = decrypt(req.body.password);                        
            if(user.authenticate(decrypted_password)){                
                loginFunction(user,res);
            }else{
                return res.status(401).json({message:"Wrong Password Entered"});        
            }    
        }else{
            return res.status(404).json({message:'User Not Found'});       
        }        
    }); 
});
router.get('/admin-header',requireSignin,(req,res)=>{
    Admin.findOne({_id:req.user._id}).exec((err,user)=>{
        if(err) return res.status(400).json({message:err});
        res.status(200).json({message:user.full_name}); 
    });
});

router.post('/forgotpassword',forgetpasswordValidator,(req,res)=>{
    const errors = validate_function(req);
    if(!errors.isEmpty()){
        return res.status(422).json(errors.array());
    }
    Admin.findOne({email:req.body.email}).exec((error,user)=>{
        if(error) return res.status(400).json({message:error});
        if(user){             
            user.generatePasswordReset();                    
            user.save((error,user_data)=>{
                let link = "http://localhost:2000/resetpassword/" + user_data.resetPasswordToken;                
                const __dirname = path.resolve(path.dirname('')); 
                const filePath = path.join(__dirname,'/mailer/resetpassword.html');                
                const source = fs.readFileSync(filePath, 'utf-8').toString();
                const template = handlebars.compile(source);                
                const replacements = {
                    email: user_data.email,
                    link:link
                  };
                const htmlToSend = template(replacements);
                let mailOptions = {
                    from: process.env.MAIL_USERNAME,
                    to: user_data.email,
                    subject: 'Password Reset',                
                    html: htmlToSend
                };                
                  transporter.sendMail(mailOptions, function(err, data) {
                    if (err) {
                        console.log("Error " + err);
                    } else {                                                    
                        return res.status(200).json({error_code:'0',message:"Email Password Sent !"})                        
                    }
                  });               
            })                            
        }else{
            return res.status(404).json({error_code:'1',message:'User Not Found !'})
        }
    })    
});
router.get('/passwordreset/:token',(req,res)=>{
    Admin.findOne({resetPasswordToken:req.params.token , resetPasswordExpires:{$gt: Date.now() }}).exec((error,user)=>{
        if(error)  ;
        if(user){
            return res.status(200).json({error_code:'0',message:'user has token !!'})
        }else{
            return res.status(401).json({error_code:'1',message:'Password reset token is invalid or has expired !'})
        }
    });
});
router.post('/passwordreset/:token',newpasswordValidator,(req,res)=>{
    if(!errors.isEmpty()){
        return res.status(422).json(errors.array());
    }
    Admin.findOne({resetPasswordToken:req.params.token , resetPasswordExpires:{$gt: Date.now() }}).exec((error,user)=>{
        if(error) return res.status(400).json({message:error});
        if(user){
                user.password = req.body.password;
                user.resetPasswordToken=undefined;
                user.resetPasswordExpires=undefined;
                user.save((err,user_save)=>{
                    if(error) return res.status(400).json({message:error});
                    const __dirname = path.resolve(path.dirname('')); 
                    const filePath = path.join(__dirname,'/mailer/passwordsaved.html');
                    const source = fs.readFileSync(filePath, 'utf-8').toString();
                    const template = handlebars.compile(source);
                    const replacements = {
                        email: user_save.email,                        
                    };
                    const htmlToSend = template(replacements);
                    let mailOptions = {
                        from: process.env.MAIL_USERNAME,
                        to: user_save.email,
                        subject: 'Password Saved',                
                        html: htmlToSend
                    };                    
                      transporter.sendMail(mailOptions, function(err, data) {
                        if (err) {
                          console.log("Error " + err);
                        } else {                                                        
                                return res.status(200).json({error_code:'0',message:"Password and email saved and sent !"})                        
                        }
                      });   
                })
        }else{
            return res.status(401).json({error_code:'1',message:'Password reset token is invalid or has expired !'})
        }
    })
});
//photo category
var upload = multer({storage: imgproperty, limits: { fileSize: 4000000 }});
let pic_upload = upload.single('category-image');
router.post('/photo-category-add',(req,res)=>{        
    pic_upload(req,res,(err)=>{
        if(err){
        if(err.code=='LIMIT_FILE_SIZE'){
            res.status(500).json({message:'File Size is too large. Allowed file size is 2MB'});
        }
    }else{
        let image_option ;                   
        const d = new Date();
        let year = d.getFullYear(); 
        image_option = 'http://'+req.headers.host+'/images/'+year+'/'+req.file.filename;                        
        const __category = new Category({
            title:req.body.title,
            imgDirectory:image_option,
            permalink:req.body.permalink
        });
        __category.save((error, category_db)=>{
            if(error) return res.status(400).json({message:error});
            if(category_db){
                res.status(200).json({message:'category Saved !' });
            }
        })        
    }        
    });            
});
router.get('/photo-category',(req,res)=>{
    Category.find({},{createdAt: 0 , updatedAt : 0 , __v:0,  },(err,categories)=>{
        if(err) return res.status(400).json({message:err});
        res.status(200).json({message:categories});
    });
});
router.post('/photo-category-delete',requireSignin,(req,res)=>{
    var id = req.body.id;
    const __dirname = path.resolve(path.dirname('')); 
    const profilePath = path.join(__dirname,'/public/images/');              
    Category.findByIdAndDelete(id,(err,deleted)=>{
        if(err) return res.status(400).json({message:err});
        var deleted_directory = deleted.imgDirectory;
        var str_arr = deleted_directory.split('/');
        fs.unlinkSync(profilePath+"/"+str_arr[4]+'/'+str_arr[5]);
        res.status(200).json({message:'Deleted Successfully'});
    });
});
let pic_upload_2 = upload.single('category-image');
router.post('/photo-category-edit',requireSignin,(req,res)=>{    
    pic_upload_2(req,res,(err)=>{
        if(err){
        if(err.code=='LIMIT_FILE_SIZE'){
            res.status(500).json({message:'File Size is too large. Allowed file size is 2MB'});
        }
    }else{
        let image_option ;                   
        const d = new Date();
        let year = d.getFullYear(); 
        image_option = 'http://'+req.headers.host+'/images/'+year+'/'+req.file.filename;                        
        const data = {
            title:req.body.title,
            imgDirectory:image_option
        };            
        Category.findByIdAndUpdate(req.body.id,{$set:data},{ new: true },(err,updatedCategory)=>{
            if(err) return res.status(400).json({message:err});
            if(updatedCategory){
                res.status(200).json({message:'category Updated !' });
            }
        })             
    }        
    });            
})
//photo gallery
router.post('/photogallery',async (req,res,next)=>{
    const category_detail = await Category.find({'permalink':req.body.permalink},{_id:1}); 
    try{
        if(category_detail.length == 0){            
            const err = new Error();           
                err.message = `no category exist`;                
                throw err;
        }       
        const category_id = category_detail.map(x=>x._id);    
        let page = req.query.page || 1;
        const perPage = req.query.size || 6 ;            
        Photo.find({category:{$in:category_id}},{imgDirectory:1}).skip((page-1)*perPage).limit(perPage).exec((err,photos)=>{                
            if(err) return res.status(400).json({message:err});
            if(photos){    
                let total_count = photos.length;                
                let totalItems_f = total_count == 0 ? 1 : total_count;
                let totalPage_f = Math.ceil(total_count/perPage)  == 0 ? 1 : Math.ceil(total_count/perPage);      
                res.status(200).json({page:page,total:totalItems_f,totalPage:totalPage_f,per_page:perPage,pic:photos});                                                            
            }
        })     
    }catch(err){     
        next(err);        
    }    
}); 
var upload_photo = multer({storage: photoproperty, limits: { fileSize: 2000000 }});
let photo_upload = upload_photo.single('photo-image');
router.post('/photogallery-insert',(req,res)=>{
    photo_upload(req,res,(err)=>{
        if(err){
        if(err.code=='LIMIT_FILE_SIZE'){
            res.status(500).json({message:'File Size is too large. Allowed file size is 2MB'});
        }
    }else{
        let cate_arr = req.body.categories.split(",");        
        let photo_option ;                   
        const d = new Date();
        let year = d.getFullYear(); 
        photo_option = 'http://'+req.headers.host+'/images/'+year+'/'+req.file.filename;                        
        const __photo = new Photo({
            title:req.body.title,
            imgDirectory:photo_option,
            category:cate_arr
        });
        __photo.save((error, photo_db)=>{
            if(error) return res.status(400).json({message:error});
            if(photo_db){
                res.status(200).json({message:'Photo Saved !' });
            }
        })        
    }        
    });            
});
router.post('/photogallery-delete',requireSignin,(req,res)=>{
    var id = req.body.id;
    const __dirname = path.resolve(path.dirname('')); 
    const profilePath = path.join(__dirname,'/public/images/');              
    Photo.findByIdAndDelete(id,(err,deleted)=>{
        if(err) return res.status(400).json({message:err});
        var deleted_directory = deleted.imgDirectory;
        var str_arr = deleted_directory.split('/');
        fs.unlinkSync(profilePath+"/"+str_arr[4]+'/'+str_arr[5]);
        res.status(200).json({message:'Deleted Successfully'});
    });
});
router.post('/photogallery-edit',(req,res)=>{
    photo_upload(req,res,(err)=>{
        if(err){
        if(err.code=='LIMIT_FILE_SIZE'){
            res.status(500).json({message:'File Size is too large. Allowed file size is 2MB'});
        }
    }else{
        let image_option ;                   
        const d = new Date();
        let year = d.getFullYear(); 
        image_option = 'http://'+req.headers.host+'/images/'+year+'/'+req.file.filename;                        
        const data = {
            title:req.body.title,
            imgDirectory:image_option
        };            
        Photo.findByIdAndUpdate(req.body.id,{$set:data},{ new: true },(err,updatedPhoto)=>{
            if(err) return res.status(400).json({message:err});
            if(updatedPhoto){
                res.status(200).json({message:'Photo Updated !' });
            }
        })             
    }        
    });            
});



export default router;