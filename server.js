//Importing depends
const express = require('express')
const cookiePaser = require('cookie-parser')
const mongoose = require('mongoose')
const userRouter = require('./routes/User')
const Cors = require("cors")


//Init app with express
const app = express()


//Declaration of middle wares
app.use(express.json())
app.use(cookiePaser())
app.use(Cors())

//Mongo DB config
const dbUrl = "mongodb+srv://todoscol:kWCF9OYzJUE5B241@cluster0.9be9w.mongodb.net/utodo?retryWrites=true&w=majority"

mongoose
    .connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true
    })
    .then(
        console.log("Database connected")
    )
    .catch(
        (err) => {
            console.log(err)
        }
    )

//Routes declaration/
app.use('/user', userRouter);

//Declaration of the end point

app.get("/", (req, res) => res.status(200).send("Todo List Backend"))
//Declaration od port and server hosting
port = process.env.PORT || 5000
app.listen(port, () => {
    console.log("Server running at " + port)
})



