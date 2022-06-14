import express from "express";
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import env from 'dotenv';
import router from './controllers/quotesForm.js';
import admin_router from './controllers/admin.js';
import admin_quote_router from './controllers/adminQuotes.js';


const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static('public'));  
env.config();
//cors error solution
app.use(cors());
// app.use((req,res,next)=>{
//     res.setHeader('Access-Control-Allow-Origin','https://neutrography.web.app/');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
//     res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Authorization");
//     res.setHeader('Access-Control-Allow-Credentials', true);    
//     next();
// });

    
app.use('/neutro',router);
app.use('/start',(req,res)=>{
    res.status(200).json({message:'Working Fine'})
});
app.use('/neutro-admin',admin_router);
app.use('/neutro-admin',admin_quote_router);

//api not found
app.use((req,res)=>{
    res.status(404).json({message:'Route Not Found !'});
});


// Handling Errors
app.use((err, req, res, next) => { 
    console.log(err);
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";
    res.status(err.statusCode).json({
      message: err.message,
    });    
});
//listen & database
mongoose.connect(`mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASSWORD}@cluster0.ejuxc.mongodb.net/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`,{
    useNewUrlParser: true,
    useUnifiedTopology:true,
}).then(()=>{
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running on the port ${process.env.PORT}`);
    })
});
