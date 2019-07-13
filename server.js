const cors = require('cors');
const express = require ('express');
const mongoose = require ('mongoose');
const bodyParser = require ('body-parser');
const morgan = require('morgan');

const messageRouter = require('./src/routes/messageRouter');
const groupRouter = require('./src/routes/groupRouter');

const app = express();
const databaseURI = 'mongodb://localhost:27017/test-socket';

mongoose.connect(databaseURI,
    {useNewUrlParser: true});


const port = process.env.PORT || 5000;


app.use(morgan('dev')); //this helps to log our requests

app.use(cors()); // this helps us solve issues with Cross Origin Resource Sharing
app.use(bodyParser.json()); // this gives us access to the raw json sent from the client. We can get it using request.body 
app.use(bodyParser.urlencoded({extended: true}));


const server = app.listen(port, () => {
    console.log(`Server started on ${port}`);
});

const messageSocket = require('socket.io')(server,{ // this allows us to create a socket with namespace of /message. Think of namespace as a route in your endpoint
    path: '/message',
    serveClient: false
});

const groupSocket = require('socket.io')(server,{ // this allows us to create a socket with namespace of /group. Think of namespace as a route in your endpoint
    path: '/group',
    serveClient: false
});

messageSocket.on('connection', socket => { // Wont it be nice to log who called our socket ?
    console.log('Connected client on port %s.', port);

    socket.on('disconnect', () => { // Wont it be nice to log who left our connection ?
        console.log('Client disconnected');
    });
});

groupSocket.on('connection', socket => {// Wont it be nice to log who called our socket ?
    console.log('Connected client on port %s.', port);

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

//Middleware

app.use((req, res, next) => { // Since, we would be using the sockets from within our application, its best we store it as part of the request object. Since request object can be accessed from other routers e.g messageRouter
    req.messageSocket = messageSocket;
    req.groupSocket = groupSocket;
    next();
});

//Routes
app.use('/messages', messageRouter);
app.use('/groups', groupRouter);

//Middleware
app.use((req, res, next) => { // if any invalid/ unknown route is called , this will handle it
    const error  = new Error('Route not found');
    error.status = 404;
    next(error);
});

//Middleware
app.use((error, req, res, next) => { // use this to handle any other error. Make use of next(error) in any part of the express app
    res.status(error.status || 500);
     res.json({
         error: {
             message : error
         }
     });
});
