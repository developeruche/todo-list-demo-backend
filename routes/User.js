const express = require('express');
const userRouter = express.Router();
const passport = require('passport');
const passportConfig = require('../passport');
const User = require('../models/User');
const Todo = require('../models/Todo');
const JWT = require('jsonwebtoken')




const signToken = userID => {
    return JWT.sign({
        iss: "UniqueCDev",
        sub: userID
    }, "UniqueCDev", { expiresIn: "604800000" })
}

//Creating sign up or register route

userRouter.post('/register', (req, res) => {
    const { username, password, role } = req.body;
    User.findOne({ username }, (err, user) => {
        if (err)
            res.status(500).json({ message: { msgBody: "Error has Occured", msgError: true } })
        if (user)
            res.status(400).json({ message: { msgBody: "Username is already taken", msgError: true } })
        else {
            const newUser = new User({ username, password, role });
            newUser.save(err => {
                if (err)
                    res.status(500).json({ message: { msgBody: "Error has Occured", msgError: true } })
                else
                    res.status(201).json({ message: { msgBody: "Account successful created", msgError: false } })

            })
        }
    })
})

//Create Login routes

userRouter.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    if (req.isAuthenticated()) {
        const { _id, username, role } = req.user
        const token = signToken(_id);
        res.cookie('access_token', token, { httpOnly: true, sameSite: true })
        res.status(200).json({ isAuthenticated: true, user: { username, role } })
    }
})

//Creating logout route

userRouter.get('/logout', passport.authenticate('jwt', { session: false }), (req, res) => {
    res.clearCookie('access_token')
    res.json({ user: { username: "", role: "" }, success: true })
})

//Creating routes for uploading / updating todos

userRouter.post('/todo', passport.authenticate('jwt', { session: false }), (req, res) => {
    const todo = new Todo(req.body)
    todo.save(err => {
        if (err)
            res.status(500).json({ message: { msgBody: "fb 1 Error has Occured", msgError: true } })
        else
            req.user.todos.push(todo);
        req.user.save(err => {
            if (err)
                res.status(500).json({ message: { msgBody: "fb 2 Error has Occured", msgError: true } })
            else
                res.status(200).json({ message: { msgBody: "Successfully created todo", msgError: false } })
        })
    })
})

//Creating routes for fecthing todos

userRouter.get('/todos', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.findById({ _id: req.user._id }).populate('todos').exec((err, document) => {
        if (err)
            res.status(500).json({ message: { msgBody: "Error has Occured", msgError: true } })
        else {
            res.status(200).json({ todos: document.todos, authenticate: true })
        }
    })
})

//Create routes for login as admin

userRouter.get('/admin', passport.authenticate('jwt', { session: false }), (req, res) => {
    if (req.user.role === 'admin') {
        res.status(200).json({ message: { msgBody: "You are an admin", msgError: false } })
    }
    else
        res.status(403).json({ message: { msgBody: "You are not admin contact an admin to become one", msgError: true } })
})

//Creating route for the frontend to know if the user is still logged in

userRouter.get('/authenticated', passport.authenticate('jwt', { session: false }), (req, res) => {
    const { username, role } = req.user;
    res.status(200).json({ isAuthenticated: true, user: { username, role } })
})

//Creating route to delete the last todo item
userRouter.delete('/deletelasttodo', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.update({ _id: req.user._id }, { $pop: { todos: 1 } })
        .then(
            res.status(200).json({ message: { msgBody: "last todo succefully deteleted", msgError: false } })
        )
        .catch(
            err => {
                res.status(403).send(err)
            }
        )

})

//Creating a route to delete the first todo item
userRouter.delete('/deletefirsttodo', passport.authenticate('jwt', { session: false }), (req, res) => {
    User.update({ _id: req.user._id }, { $pop: { todos: -1 } })
        .then(
            res.status(200).json({ message: { msgBody: "last todo succefully deteleted", msgError: false } })
        )
        .catch(
            err => {
                res.status(403).send(err)
            }
        )
})



module.exports = userRouter;