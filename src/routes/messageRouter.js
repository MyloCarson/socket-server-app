const express = require('express');
const Message = require('../models/message');
const messageRouter = express.Router();

messageRouter
  .get('/:groupId', (req, res, next) => {
    Message.find({ groupId: req.params.groupId })
      .then(messages => {
        res.status(200).json(messages);
      })
      .catch(err => {
        next(err);
      });
  })

  .post('/:groupId', (req, res, next) => {
    let message = new Message(req.body);
    message
      .save()
      .then(message => {

          /** Here is where the magic happens. We want to inform everyone in real time that a message has come in
           * 1: We get the messageSocket that we store in our request
           * 2: We get the connected clients from the messageSocket. Each client is referred to as a socket. Therefore messageSocket.sockets.connected
           * 3: We iterate over the object of clients (sockets).
           * 4: We check for clients  that have a query param of groupId, where the groupId is equals to that of this new message ( Reason is we don't want to send message to a group who isnt thesame as this message)
           * 5: We emit a payload for every client that matches our description
           */
        const messageSocket = req.messageSocket; // get our socket stored in the  request
        const connectedSockets = messageSocket.sockets.connected; // this gives us access to all the connected clients in our socket
        Object.keys(connectedSockets).forEach(function(key) {
          if (
            connectedSockets[key].handshake.query.groupId.localeCompare(
              message.groupId
            ) === 0
          ) {
            connectedSockets[key].emit('message', message);
          }
        });
        res.status(201).json(message);
      })
      .catch(err => {
        next(err);
      });
  });
module.exports = messageRouter;