import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    firstName: {
        type: String, 
        required: true, 
        min: 3,
        max: 30
    },
    lastName: {
        type: String, 
        required: true, 
        min: 3,
        max: 30
    },
    email: { 
        type: String, 
        required: true, 
        unique:false,
        trim:true,        
        lowercase:true
    },
    phoneNumber: { 
        type: String, 
        required: true 
    },
    subject: { 
        type: String 
    },
    message: { 
        type: String, 
        required: true 
    },
}, { timestamps: true });
messageSchema.set('toObject', { virtuals: true });
messageSchema.set('toJSON', { virtuals: true });
messageSchema.virtual('full_name').get(function(){
    return this.firstName+' '+this.lastName;
});

export default mongoose.model('Message', messageSchema); 