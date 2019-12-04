const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');
//this is the package used to upload the files
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        //cd is callback function.this executes every time a picture is uploaded
        cb(null,'./uploads');
    },
    filename:function (req, file, cb){
        cb(null,file.originalname)
    }
});

const fileFilter = (req,file,cb) => {
    //reject a file
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null,true);
    }else {
        cb(null,false);
    }
};

const upload = multer({
    storage:storage,
    limits:{
        fileSize: 1024 * 1024 * 5 //this will be taken in bytes
    },
    fileFilter: fileFilter

});

router.get('/',(req,res,next)=>{
    Product.find()
        .select('name price _id productImage')
    .exec()
    .then(results => {
        const response = {
          count: results.length,
            products: results.map( result => {
                return{
                    _id: result._id,
                    name: result.name,
                    price: result.price,
                    productImage: result.productImage,
                    request:{
                        type: 'Get',
                        url: 'http://localhost:3000/products/' + result._id
                    }
                }
            })
        };
        res.status(200).send(response)
    })
    .catch(err => {
        console.log(err);
        res.status(500).send({
            error: err
        });
    })
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
        .select("name price _id productImage")
        .exec()
        .then(result => {
            console.log("this is from database",result);
            if(result){
                res.status(200).send(result);
            }else{
                res.status(404).send({
                    message: 'Not a valid id'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({error: err})
        });
});

router.post('/',upload.single('productImage'), (req,res,next)=>{
    console.log(req.file);
    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price: req.body.price,
        productImage: req.file.path
    });
    //saving to the database
    product.save().then(result => {
        console.log(result);
        res.status(200).json({
            message: 'handling post requests to /products',
            createdProduct: {
                _id: result._id,
                name: result.name,
                price: result.price,
                request:{
                    type: 'GET',
                    url:'http://localhost:3000/products/' + result._id
                }
            }
        });
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });

});

router.post('/:productId',(req,res,next)=>{
    
});

router.patch('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }
    Product.update({
        _id:id
    },{$set:updateOps}).exec().then(result => {
        console.log(result);
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).send({
            error:err
        });
    });

});

router.delete('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.remove({
        _id:id
    }).then(result=> {
        res.status(200).json(result);
    }).catch(err => {
        console.log(err);
        res.status(500).json({
            error:err
        });
    });
});
 
module.exports = router;