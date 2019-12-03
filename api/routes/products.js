const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Product = require('../models/product');

router.get('/',(req,res,next)=>{
    Product.find()
    .exec()
    .then(results => {
        console.log(results);
        res.status(200).send(results)
    })
    .catch(err => {
        console.log(error);
        res.status(500).send({
            error: err
        });
    })
});

router.get('/:productId',(req,res,next)=>{
    const id = req.params.productId;
    Product.findById(id)
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

router.post('/',(req,res,next)=>{

    const product = new Product({
        _id: new mongoose.Types.ObjectId(),
        name:req.body.name,
        price: req.body.price
    })
    //saving to the database
    product.save().then(result => {
        console.log(result);
        res.status(200).json({
            message: 'handling post requests to /products',
            createdProduct: result
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