/**
 * Enrutador de la partida.
 * Created by mor on 5/07/16.
 */

var sha1 = require('sha1');

var mongoUsers = require('../db/mongoUsers'), // db users controller
    mongoGames = require('../db/mongoGames'); // db games controller

var util = require('../server/util'), // utils
    cookies = require('../server/cookies'), // cookies
    http = require('../server/http'),
    ViewData = require('../objects/system/ViewData'), // view data model
    views = require('../objects/system/views'),
    Game = require('../objects/models/Game'), // game model
    CharFactory = require('../objects/factory/CharFactory'),
    constants = require('../objects/constants/Constants'), // constants object
    clans = require('../objects/models/Clans'),
    generations = require('../objects/models/Generations');

var cf = new CharFactory();

var view, user, game, char = cf.initChar();
var goToLogin = function (res) {
    res.redirect('/')
};

var express = require('express'),
    router = express.Router({caseSensitive: true});

// PANTALLA DE JUEGO
router.get(constants.server.routes.game.access.gamePanel, function (req, res) {
    var userName = req.params.user, gameName = req.params.game;
    var tmpUser = {name: userName}, tmpGame = {name: gameName},
        key = req.cookies.key;
    if (sha1(userName) === key) {
        mongoUsers.findUserByName(tmpUser, function (u) {
            if (!util.isNull(u)) {
                user = u;
                mongoGames.findGameByName(tmpGame, function (g) {
                    if (!util.isNull(g)) {
                        game = g;
                        view = new ViewData(views.master, userName + ' - ' + gameName, gameName + ': ' + userName, 0);
                        view.data.userJSON = JSON.stringify(user);
                        view.data.gameJSON = JSON.stringify(game);
                        view.data.user = user;
                        view.data.game = game;
                        view.data.constants = constants.char;
                        view.data.clans = clans;
                        view.data.gens = generations;
                        view.data.playerFlag = true;
                        if (!util.isMaster(user, game)) { // player
                            console.log("[server] logging player in: " + game.name);
                            view.file = views.player;
                            char = util.findChar(user, game);
                            if (!char) {
                                var cf = new CharFactory();
                                char = cf.initChar();
                            }
                            view.data.charJSON = JSON.stringify(char);
                            view.data.char = char;
                            res.render(view.file, view.data);
                        } else { // master
                            view.data.playerFlag = false;
                            console.log("[server] logging master " + user.name + " in: " + game.name);
                            res.render(view.file, view.data);
                        }
                    } else {
                        goToLogin(res);
                    }
                });
            }
        });
    } else {
        goToLogin(res);
    }
});
console.log('[server] game panel route set');

router.get(constants.server.routes.game.access.initChar, function (req, res) {
    var ret = cf.initChar();
    ret.npc = true;
    http.contentType(res, 'application/json');
    res.send(JSON.stringify(ret));
});
console.log('[server] init char request route set');

module.exports = router;