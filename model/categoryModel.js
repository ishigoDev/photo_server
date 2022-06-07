import mongoose from 'mongoose';


const categorySchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        min: 3,
        max: 30
    },    
    imgDirectory:{
        type:String,        
    },
    permalink:{
        type:String, 
    }
}, { timestamps: true });

export default mongoose.model('Category', categorySchema); 
