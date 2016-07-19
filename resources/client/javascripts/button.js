/**
 * Objeto para controlar los botones de la interfaz
 * Created by becari on 11/05/2016.
 */
var button = {
    /**
     * Guarda los datos del formulario y procede a construir la tabla. Según el clan, printará sus correspondientes disciplinas.
     * Si alguno de los campos está vacío, simplemente se muestra un alert encima del formulario que informará de que quedan
     * campos sin rellenar.
     */
    setButtonClick: function(element, callback) {
        if(element && callback && util.type(util.func, callback)) {
            var event = 'click';
            element.off(event);
            element.on(event, callback);
            return element;
        }
    },
    /**
     * Guarda, correctamente formatados, los datos del personaje que el usuario ha rellenado en el formulario.
     * Procede a mostrar los datos en la pantalla de crear personajes.
     */
    submitCharData: function() {
        var alertId = 'emptyFields', panelName = 'data';
        if (util.allInputsSet(panelName)) {
            overlay.close(panelName);
            var charData = char.data, overlayId = 'sheet', inputs, inputsGroup, counter = 0,
                clanName = $("select#clan").val(), attrName = 'atributos', skillsName = 'habilidades',
                attrId = 'attr', skillsId = 'skills', statsTableId = 'stats', discsTableId = 'disciplinas',
                defClanName = 'Assamita guerrero';
            //clanName = util.isUndefined(clanName) ? defClanName : clanName;
            charFunctions.modStats(clanName);
            inputs = form.getDataInputs();
            while(inputs.length > 0) {
                inputsGroup = inputs.shift();
                charData[counter].fields.forEach(function(f) {
                    f.value = inputsGroup.shift();
                });
                counter++;
            }
            var discs = charFunctions.getDiscs(clanName);
            prefs.setPrefs(attrName, prefs.getPrefs(attrId));
            prefs.setPrefs(skillsName, prefs.getPrefs(skillsId));
            table.build(char, statsTableId);
            table.build(discs, discsTableId);
            charFunctions.setDiscs(discs);
            button.setTableButtons(statsTableId);
            table.updateOther();
            overlay.open(overlayId);
        } else {
            overlay.showAlert(alertId);
        }
    },
    /**
     * Guarda los datos de la ficha y envía por websockets al servidor el objeto del cliente, que contiene datos del
     * usuario, personaje y partida
     * @param char Personaje del cliente
     * @param user Usuario del cliente
     * @param game Partida del cliente
     */
    submitSheet: function(char, user, game) {
        if(restrict.fullSheet(char)) {
            var sheet, npc, mes = 'setChar',
                listId = (npc = char.npc) ? 'npc' : 'char',
                sheetPanel = 'sheet', charPoints = 'fp',
                panelName = npc ? 'masterPanel' : 'playerPanel';
            charFunctions.setReady(char, true);
            charFunctions.setCharPoints(char, charPoints, 15);
            charFunctions.initBlood(char);
            charFunctions.setOwner(char, user);
            charFunctions.addCharacter(char, listId, game);
            sheet = {user: user, char: char, game: game};
            sockets.server(mes, sheet);
            overlay.close(sheetPanel);
            overlay[panelName]();
        }
    },
    /**
     * Define la función llamada al hacer click en el botón de resolución de tiradas.
     */
    setRollResolutionButton: function() {
        var getValue = function(element) {return parseInt(element.val())};
        button.setButtonClick($('span#roll-button'), function() {
            if ($('div#roll-result>table>tbody').is(':hidden')) {
                var stats = [], dif = getValue($('tr#action-dif input')),
                    mod = getValue($('tr#action-mod input')),
                    wins = getValue($('tr#action-wins input')),
                    will = charFunctions.findStat(char, 'fuerza_de_voluntad'),
                    blood = charFunctions.findStat(char, 'sangre'),
                    useMaxable = function (stat, param) {
                        if (param > 0 && stat.level >= param) {
                            stat.level -= param;
                            charFunctions.setStat(char, stat, stat);
                        }
                    };
                $('tr.stat-select select>option:selected').each(function () {
                    stats.push(charFunctions.findStat(char, $(this).attr('id')));
                });
                useMaxable(will, wins);
                useMaxable(blood, mod);
                var rollSet = dice.RollSet(stats, dif, mod, wins);
                table.showRollSet(rollSet.resolve());
                overlay.show($('div#roll div#roll-result'));
                overlay.hide($('div#roll div#roll-options'));
                sockets.update();
            }
        })
    },
    /**
     * Define la función llamada al pulsar el botón de descargar la ficha en forma de imagen.
     */
    setDownloader: function() {
        button.setButtonClick($('span#download'), function() {
            table.exportImg($('table#show-stats')[0]);
        });
    },
    /**
     * Establece los eventos de botones de la tabla del personaje.
     * @param id Tabla o fila de la que establecer el evento.
     */
    setTableButtons: function(id) {
        var levelButtons = $('#'+id+' img[class]');
        levelButtons.each(function() {
            var e, attrName = (e = $(this)).closest('td[id]').attr('id');
            if(restrict.lookRestriction(attrName))
                button.setButtonClick(e, function() {
                    var firstClass = e.attr('class').split(' ')[0]; // set, unset o max
                    button.statButtonClick(attrName, firstClass)
                });
        });
    },
    /**
     * Define el comportamiento del botón de otorgar experiencia.
     */
    setXpGiver: function () {
        var element = $('span#xp-giver');
        button.setButtonClick(element, function () {
            char.xp++;
            overlay.gameWindow(char);
            sockets.update();
        });
    },
    /**
     * Define el funcionamiento del botón de creación de personajes (para la pantalla del máster)
     */
    setCharCreationButton: function () {
        var element = $('span#char-creation-button');
        button.setButtonClick(element, function () {
            ajax.charRequest(function (ch, textStatus, jqXHR) {
                char = ch;
                overlay.initCharPanel(function () {
                    overlay.close('panel');
                });
            });
        });
    },
    /**
     * Define las funciones que se llaman al clicar sobre los botones de la tabla de preferencias
     * @param id Identificador de la tabla de preferencias
     */
    setPrefsButtons: function(id) {
        var rowList = $('table#'+id+'-prefs tr'),
            row, spanList, spanBtn, btn, spanClass;
        rowList.each(function() {
            row = $(this);
            spanList = row.find('span');
            spanList.each(function() {
                spanBtn = $(this);
                button.setButtonClick(spanBtn, function() {
                    btn = $(this);
                    row = btn.parent().parent();
                    var spanClassList = util.getClassList(btn);
                    spanClassList.forEach(function(c) {
                        if(c === 'prev' || c === 'next')
                            spanClass = c;
                    });
                    prefs.modPrefs(row, spanClass);
                });
            });
        });
    },
    /**
     * Define las funciones que se lanzan al hacer clic sobre los iconos de subida de nivel de una estadística.
     * Restaura el display
     */
    setXpButtons: function() {
        var rows = $('table#show-stats tr:not(:has(table))'), // selecciona todas las filas que NO contengan una tabla
            row, btn, stat, statId, s, r;
        var arrowUpClass = 'glyphicon glyphicon-arrow-up', learnedClass = 'learned';
        rows.each(function() {
            row = $(this);
            statId = util.clean(row.find('td[class]').text());
            if(statId !== "") {
                stat = charFunctions.findStat(char, util.clean(row.find('td[class]').text()));
                var cost = charFunctions.xpCost(stat);
            }
            col = row.find('td:has(span)');
            btn = row.find('td>span');
            table.removeText(col);
            if (!util.isUndefined(stat) && !util.isUndefined(cost) &&
                restrict.lookRestriction(stat) &&
                restrict.notEnoughPoints(charFunctions.getCharPoints(char), cost)) {
                if (stat.level > 0) row.addClass(learnedClass);
                col.append(' '+cost);
                btn.addClass(arrowUpClass);
                button.setButtonClick(btn, function () {
                    r = $(this).parent().parent();
                    s = charFunctions.findStat(char, util.clean(r.find('td[class]').text()));
                    charFunctions.growStat(s);
                    sockets.update();
                });
            } else {
                btn.removeClass(arrowUpClass);
                btn.off('click');
            }
        });
    },
    /**
     * Función que carga un personaje seleccionado en el elemento especificado por parametro.
     * @param option Elemento que contiene el identificador del personaje seleccionado.
     */
    charSelectOptionClick: function (option) {
        var optionClass;
        if(!util.isUndefined(optionClass = option.attr('class'))) {
            var o = option, charName = o.text(), tmpChar, charList = game.charList, npcList = game.npcList;
            var list = game[optionClass + 'List'];
            list.forEach(function (ch) {
                if (util.isUndefined(tmpChar) &&
                    charName === charFunctions.findData(ch, 'nombre').value)
                    tmpChar = ch;
            });
            if (!util.isUndefined(tmpChar)) {
                char = tmpChar;
            }
            overlay.gameWindow(char);
        }
    },
    /**
     * Función que abre un panel desplegable.
     * @param id Identificador del panel
     * @param own Objeto del botón que ha lanzado la función
     */
    openPanel: function(id, own) {
        overlay.show(id);
        if(!util.isUndefined(own)) {
            own.removeClass('glyphicon-plus opener');
            own.addClass('glyphicon-minus closer');
        }
    },
    /**
     * Función que cierra un panel desplegable
     * @param id Identificador del panel
     * @param own Objeto del botón que ha lanzado la función
     */
    closePanel: function(id, own) {
        overlay.hide(id);
        if(!util.isUndefined(own)) {
            own.removeClass('glyphicon-minus closer');
            own.addClass('glyphicon-plus opener');
        }
    },
    /**
     * Define el botón de apertura/cierre de un panel desplegable
     * @param panelId Identificador del panel desplegable
     */
    setPanelButton: function(panelId) {
        var element = $('#'+panelId+'>.panel-heading>span.glyphicon'),
            panel = $('#'+panelId+' .panel-body'), mode, own, cls;
        button.setButtonClick(element, function() {
            if((cls = (own = $(this)).attr('class')).indexOf('opener') > 0) {
                mode = 'openPanel';
            } else if(cls.indexOf('closer') > 0) {
                mode = 'closePanel';
            }
            if(!util.isUndefined(mode))
                button[mode](panel, own);
        });
    },
    setRollPanelButton: function () {
        var opener = $('span#roll-opener'), closer = $('div#roll span#roll-closer'),
            options = $('div#roll div#roll-options'),
            result = $('div#roll div#roll-result'),
            overlayId = 'roll', animationSpeed = 'fast';
        button.setButtonClick(opener, function () {
            overlay.open(overlayId, animationSpeed, function (e) {
                overlay.show(options);
                overlay.hide(result);
            });
        });
        button.setButtonClick(closer, function() {
            overlay.close(overlayId, animationSpeed, function (e) {
                overlay.hide(options);
                overlay.hide(result);
            });
        });
        button.setRollResolutionButton();
        util.disable('tr#action-dif input');
    },
    /**
     * Función destinada a llamarse al hacer clic en uno de los iconos de nivel de la ficha del personaje.
     * @param id String identificador del elemento padre del icpno (correspondiente a la estadistica a la que pertenece)
     * @param cls Clase del icono: set, unset o max
     */
    statButtonClick: function(id, cls) {
        if (cls === "unset")
            mode = true;
        else if (cls === "set")
            mode = false;

        var stat = charFunctions.findStat(char, id),
            parent = charFunctions.findParent(char, id);

        if(restrict.notUpdatable(stat) && restrict.lookRestriction(stat)) {
            if(mode && parent.initPoints > 0 && restrict.maxLevelRestriction(stat)) {
                    parent.initPoints--;
                    table.modStat(stat, mode);
                    table.updateInitPoints(parent);
            } else if(!mode && parent.initPoints >= 0 && restrict.levelZeroRestriction(stat)) {
                if(!char.ready) {
                    parent.initPoints++;
                    table.modStat(stat, mode);
                    table.updateInitPoints(parent);
                }
            }
            table.updateOther();
            sockets.update();
        }
    }
};