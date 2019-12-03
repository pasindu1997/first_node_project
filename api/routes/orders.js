const express = require('express');
const router = express.Router();

router.get('/',(req,res,next)=>{
    res.status(200).json({
        message: 'retreived orders'
    });
});
router.get('/:orderId',(req,res,next)=>{
    res.status(200).json({
        message: 'retreived orders',
        orderId: req.params.orderId
    });
});

router.post('/:orderID',(req,res,next)=>{
    res.status(201).json({
        message:'inserted order'
    });
});

router.post('/',(req,res,next)=>{
    const order = {
        orderId: req.body.productId,
        quantity: req.body.quantity
    }
    res.status(201).json({
        message:'inserted order',
        order: order
    });
});

router.delete('/:orderId',(req,res,next)=>{
    res.status(200).json({
        message:'deleted order'
    });
});
module.exports = router;
