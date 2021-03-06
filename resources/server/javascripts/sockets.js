/**
 * Controlador de conexiones WebSocket.
 *
 * Created by mor on 25/04/16.
 */

var mongoGames = require('../../../db/mongoGames'),
    logger = require('../../both/javascripts/logger'),
    util = require('../../both/javascripts/util');

module.exports = function (io) {
    io.on('connection', function(socket) {
        var user, char, game;
        var charFunctions = require('../../both/javascripts/charFunctions');
        var charName, hasChar;
        if(hasChar)
            logger.log('socket', 'user connected');
        socket.on('setChar', function (sheet) {
            updateChar(sheet);
        });
        socket.on('login', function (sheet) {
            user = sheet.user;
            char = sheet.char;
            game = sheet.game;
            hasChar = !(util.isBoolean(char) || util.isUndefined(char));
            if (!util.isBoolean(char))
                logger.log("socket", "character " + charFunctions.findData(char, 'nombre').value + "(" + user.name + ") at game: " + game.name);
        });
        socket.on('update', function(sheet) {
            updateChar(sheet);
            socket.broadcast.emit('update', sheet);
            socket.emit('update', sheet);
        });
        socket.on('disconnect', function() {
            if (hasChar)
                logger.log('socket', 'goodbye ' + charFunctions.findData(char, 'nombre').value + "(" + user.name + ")");
        });
        function updateChar(sheet) {
            user = sheet.user;
            char = sheet.char;
            game = sheet.game;
            mongoGames.updateGame(game, function () {
                logger.log("socket", "updated character: " + charFunctions.findData(char, 'nombre').value + "(" + user.name + ") at game: " + game.name); // recibe el personaje :D
            });
        }
    });
};