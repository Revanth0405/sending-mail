const express = require('express')
const mongoose = require('mongoose')
const nodemailer = require('nodemailer');

const app = express()

app.use(express.static(__dirname + 'public'))

app.use(express.urlencoded({extended:true}));

mongoose.connect('mongodb://localhost:27017/email', {useNewUrlParser: true})

const db = mongoose.connection;
db.on('error', console.error.bind("Mongodb connection error"))
db.once('open', ()=>{
    console.log('Mongodb connected successfully')
})

const schema = new mongoose.Schema({
    mymail:{ type: String, unique: true },
    username:String,
    password:String
})

const login = mongoose.model('logins', schema)


app.get('/', (req, res)=>{
    res.sendFile(__dirname + '/signup.html')
})

app.get('/login', (req, res)=>{
    res.sendFile(__dirname + '/login.html')
})

app.post('/login-form', async (req, res)=>{
    const {mymail, password} = req.body
    let message = ''
    try{
        const user = await login.findOne({mymail, password})
        if(user){
            console.log('Login successful')
            message = 'Login successful'
        }else{
            console.log('Not successful')
            message = 'Email or password is invalid'
        }
    }catch(err){
        console.log('Error logging in', err);
    }

    return res.send(message)
})

app.post('/signup-form', async (req, res)=>{
    const formData = req.body
    const { mymail} = req.body;
    let message = ''
    try {
        // Check if a user with the provided email and password exists in the database
        const existingUser = await login.findOne({mymail});
        if (!existingUser) {
            // Login successful
            console.log('User created')
            message = "User created"
            login.insertMany([formData])
        } else {
            // No user found with provided email and password
            console.log('User already exist')
            message = "user already exist"
        }
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('Error logging in');
    }
    return res.send(message)
})

app.get('/main-page', (req, res)=>{
    res.sendFile(__dirname + '/index.html')
})

app.post('/main-page-form', (req, res)=>{
    const {mymail, yourmail, password, message} = req.body
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: mymail,
            pass: password
        }
        });
        const mailOptions = {
        from: mymail,
        to: yourmail,
        subject: 'Test Email through JS',
        text: message
        };
        transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.error('Error sending email:', error);
            res.send('mail not sent')
        } else {
            console.log('Email sent:', info.response);
            res.send('Mail Sent Successfully check your inbox')
        }
        })
    })

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log('server started')
})