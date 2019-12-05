

const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');

router.post('/signup',(req,res,next) =>{
    User.find({email:req.body.email})
        .exec()
        .then(result =>{
            console.log(result.length);
            if (!result.length>=1){
                bcrypt.hash(req.body.password,10/*this is the salt value(random string which avoids hashing back)*/, (err,hash) =>{
                    if (err){
                        return res.status(500).json({
                            error:err
                        });
                    }else{
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            password: hash
                        });
                        user.save().then(result => {
                            console.log(result);
                            res.status(201).json({
                                message: 'User created'
                            })
                        }).catch(err => ({
                            error:err
                        }))
                    }

                })
            }else{
                res.status(409).json({
                    message: 'email already exist'
                })
            }
        })
        .catch(err => {
            res.status(409).json({
                message:err
            })
        });

});

router.post('/login',(req,res,next)=>{
     User.find({email:req.body.email}).exec()
         .then(Users => {
             if (Users.length<1){
                 return res.status(401).json({
                     message:"Auth failed"
                 })
             }
             //checking whether the password is correct
             if (bcrypt.compareSync(req.body.password, Users[0].password)){
                console.log("hetti");
                const token = jwt.sign({
                    email:Users[0].password,
                    userId: Users[0]._id
                }, process.env.JWT_KEY,{
                    expiresIn: "1h"
                });
                 return res.status(200).json({
                     message: 'Auth successful',
                     token: token
                 })
             }else{
                 return res.status(401).json({
                     message: 'Auth failed'
                 })
             }

         })
         .catch(err => {
             res.status(401).json({
                 message:err
             })
         });
});

router.delete('/:userId',(req,res,next) => {
    User.findById(req.params.userId).exec().then(result => {
        if (!result){
            res.status(409).json({
                messgae: "userID does not exist"
            })
        }else{
            User.remove({_id : result._id})
                .exec()
                .then(deletedUser => {
                    res.status(200).json({
                        message: "the user has been deleted",
                        userDeleted: deletedUser
                    })
                })
                .catch(err => {
                   res.status(409).json({
                       message: err
                   })
                });
        }
    }).catch(err => {
        res.status(409).json({
            message:err
        })
    });
});

module.exports = router;