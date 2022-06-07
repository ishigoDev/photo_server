import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const adminSchema = new mongoose.Schema({
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
        unique:true,
        trim:true,        
        lowercase:true
    },     
    hash_password:{
        type: String, 
        required: true,         
        trim:true,                
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date   
}, { timestamps: true });
adminSchema.set('toObject', { virtuals: true });
adminSchema.set('toJSON', { virtuals: true });
adminSchema.virtual('full_name').get(function(){
    return this.firstName+' '+this.lastName;
});
adminSchema.virtual('password').set(function(password){
    this.hash_password =bcrypt.hashSync(password,10);
});
adminSchema.methods = {
    authenticate:function(password){
        return bcrypt.compareSync(password,this.hash_password);        
    },
    generatePasswordReset:function(){
        this.resetPasswordToken = crypto.randomBytes(20).toString('hex');
        this.resetPasswordExpires= Date.now()+ 3600000;
    }
}

export default mongoose.model('Admin', adminSchema); 