const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');//to create an id
const Order = require('../models/order');
const Product = require('../models/product');
const checkAuth = require('../middleware/check-auth');

router.get('/',checkAuth,(req,res,next)=>{
    Order.find().select('_id product quantity').populate('product','_id name price').exec()
        .then(results =>{
            res.status(200).json({
                count: results.length,
                orders:results.map(result =>{
                    return{
                        _id: result._id,
                        product: result.product,
                        quantity:result.quantity,
                        request:{
                            requestProduct:{
                                type:'Get',
                                url:'http://localhost:3000/products/' + result.product
                            },
                            requestOrder:{
                                type: 'Get',
                                url:'http://localhost:3000/orders/' + result._id
                            }
                        }
                    }
                })

            })
        }).catch(err=>{
            res.status(500).json({
                error:err
            });
    });
});
router.get('/:orderId',checkAuth,(req,res,next)=>{
    Order.findById(req.params.orderId)

        .exec()
        .then(order => {
            if (!order){
                return res.status(404).json({
                    message: 'the order is not found'
                });
            }else{
                res.status(200).json({
                    _id: order._id,
                    product:order.product,
                    quantity:order.quantity,
                    getProduct:{
                        type:'GET',
                        url:'http://localhost:3000/products/' + order.product
                    }
                });
            }
        }).catch(err =>{
            res.status(500).json({
                Error:err
            });
    });
});

router.post('/',checkAuth,(req,res,next)=>{
    Product.findById(req.body.productId).exec()
        .then(product =>{
            //this checks whether the productId is null which means there is not relevant product id
            if (!product){
                //when return is there the subsequent code would not execute
                return res.status(404).json({
                    message:'product not found'
                })
            }
            const order = new Order({
                _id: mongoose.Types.ObjectId(),//this automatically generates an id
                quantity:req.body.quantity,
                product:req.body.productId
            });


            order.save()
                .then(result => {
                    res.status(201).json({
                        message:'the order is stored',
                        createdOrder:{
                            _id:result._id,
                            product:result.product,
                            quantity:result.quantity
                        },
                        request:{
                            type:'GET',
                            url:'http://localhost:3000/orders/' + result._id
                        }
                    });
                })
                .catch(err =>{
                    console.log(err);
                    res.status(500).send({
                        error:err
                    });
                });
        }).catch(err=>{
            res.status(500).json({
                message:err
            })
    });


});



router.post('/:orderID',checkAuth,(req,res,next)=>{
    res.status(201).json({
        message:'inserted order'
    });
});



router.delete('/:orderId',checkAuth,(req,res,next)=>{
    Order.findById(req.params.orderId).exec()
        .then(order =>{
            if (!order){
                return res.status(404).json({
                   message:'the order is not available'
                });
            }
            Order.remove({_id:order._id}).exec()
                .then(deletedOrder=>{
                    res.status(200).json({
                        _id:deletedOrder._id,
                        message:'order has been deleted'
                    })
                })
                .catch(err =>{
                    res.status(500).json({
                        error:err
                    })
                });
        })
        .catch();
});
module.exports = router;
