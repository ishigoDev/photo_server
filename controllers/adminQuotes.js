import express from "express";
import {requireSignin} from '../middleware/middleware.js';
import Message from "../model/quoteModel.js";
import mongoose from 'mongoose';

const router = express.Router();

router.get('/quotes',requireSignin,(req,res)=>{    
    let page = req.query.page || 1;
    const perPage = 10 ;
    let totalItems;    
    Message.find().countDocuments().then((count)=>{
        totalItems = count;
        return Message.find({},{subject:0,phoneNumber:0,message:0,updatedAt:0}).skip((page-1)*perPage).limit(perPage).exec()
    })    
    .then((messages)=>{           
        let totalItems_f = totalItems == 0 ? 1 : totalItems;
        let totalPage_f = Math.ceil(totalItems/perPage)  == 0 ? 1 : Math.ceil(totalItems/perPage);      
        res.status(200).json({page:page,total:totalItems_f,totalPage:totalPage_f,per_page:perPage,quoteData:messages});                
    }).catch((err)=>{
        res.status(400).json({message:err});
    });    
});
router.post('/single-quote',requireSignin,(req,res)=>{
    let id = req.body.id;
    var isValid = mongoose.Types.ObjectId.isValid(id); 
    if(isValid){
        Message.findById(id).exec((err,quote)=>{
            if(err) return res.status(400).json({message:err});
            res.status(200).json({quote:quote});
        });
    }else{
        return res.status(404).json({message:"Not Found"});
    }    
});
router.post('/bulk-quotes-delete',requireSignin,(req,res)=>{
    var objId = req.body;
    var idsArray = Object.values(objId);    
    Message.remove({'_id':{"$in":idsArray}}).exec((err,message)=>{
        if(err)  return res.status(400).json({message:err});
        res.status(200).json({quoteData:message.deletedCount});        
    });      
})
router.get('/dashboard-quote-analysis',requireSignin,(req,res)=>{
    let date ;
    let formated_date , act_date;
    let totalCount ; 
    Message.find().countDocuments().then((count)=>{                
        date = new Date().toISOString().slice(0, 10);
        formated_date = date+'T00:00:00.000Z';    
        totalCount = count    ;
        act_date = new Date(formated_date);
        return Message.aggregate([{$match:{createdAt:{$gt:act_date}}},{$group:{_id: "_id",count:{$sum:1}}}]);
    })    
    .then((currentDate)=>{
        let doc_count ;
        if(currentDate.length == 0 ){
            doc_count =0;
        }else{
            currentDate.map((x)=>
            {
               doc_count =  x.count;               
            })                
        }        
        res.status(200).json({count:totalCount,todayCount:doc_count});                
    })
})


export default router;


