import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true,    
    },
    imgDirectory: {
        type: String, 
        required: true, 
    },
    category: [{ 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'       
    }] 
}, { timestamps: true });

export default mongoose.model('Photo', photoSchema); 