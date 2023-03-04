const express = require('express');
const router = express.Router();
const userModel = require('../models/users');
const trackerModel = require('../models/tracker');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// Check login credentials
router.post('/api/login', async (req, res) => {
    try {
        // Check if user exists
        const user = await userModel.findOne({ username: req.body.username });
        if (!user) {
             res.send('User does not exist');
        }
        else if (user.password !== req.body.password) {
             res.send('Invalid Password');
        }
        else {
            const token = jwt.sign({ _id: user._id }, process.env.JWT_TOKEN, { expiresIn: '12h' });
             res.send({ user, token });
        }
    } catch (error) {
         res.send(error.message);
    }
});

// add an employee
router.post('/api/register', async (req, res) => {
    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ username: req.body.username });
        if (existingUser) {
             res.send('User already exists !!!');
        }
        else {
            // Create new user
            const newUser = new userModel(req.body);

            // Save the user
            await newUser.save();
            let token = jwt.sign({ _id: newUser._id }, process.env.JWT_TOKEN);
             res.send({ newUser, token });
        }
    } catch (error) {
         res.send(error.message);
    }
});

// read users
router.post('/api/users', (req, res) => {
    try {
        let verifyToken = jwt.verify(req.body.token, process.env.JWT_TOKEN);
        if (verifyToken) {
            userModel.find((err, data) => {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(data);
                }
            });
        }
    } catch (error) {
        console.log(error.message);
    }
});

// update specific employee credentials
router.put('/api/users/:_id', (req, res) => {
    const verifyToken = jwt.verify(req.body.token, process.env.JWT_TOKEN);
    if (verifyToken) {
        userModel.findByIdAndUpdate({ _id: req.params._id }, req.body, (err, data) => {
            if (err) {
                res.send(err);
            }
            else {
                res.send(data);
            }
        })
    }
})

// delete specific employee
router.delete('/api/delete/:_id', async (req, res) => {
    try {
        const userData = await userModel.findByIdAndDelete({ '_id': req.params._id });
        if (!userData) return res.send({ message: 'User not found' });

        const trackerData = await trackerModel.deleteMany({ 'empId': req.params._id });
        res.send({ userData, trackerData });
    } catch (err) {
        res.send(err);
    }
});


module.exports = router;