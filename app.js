const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/nodejsDemo',{useUnifiedTopology: true, useNewUrlParser: true, useCreateIndex: true });
mongoose.Promise = global.Promise;

const productRoutes = require('./api/routes/products');
const userRoutes = require('./api/routes/users');
const orderRoutes = require('./api/routes/orders');

//this will make the upload file public which means this folder is publicly available
app.use('/uploads ',express.static('uploads')); //hit http://localhost:3000/A%2016.jpg in browser
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use((req,res,next)=>{
    res.header('Access-Control-Allow-Origin','*');
    res.header('Access-Control-Allow-Headers','Origin,X-Requested-With,Content-Type,Accept,Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods','PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

//routes which should handle request
app.use('/products',productRoutes );
app.use('/orders',orderRoutes);
app.use('/users',userRoutes);

//if there is no requests route the below
app.use((req,res,next)=> {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);

    
});
//if any kind of error throws(database errors) go to this
app.use((error,req,res,next) =>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});
 
module.exports = app;