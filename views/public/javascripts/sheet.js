/**
 * Script para manejar la tabla de la ficha de personaje
 * - TODO funciones de interactividad con el usuario (subir las estadísticas de nivel clicando en las bolas grises, o bajarlas clicando en las rojas)
 * Created by mor on 9/05/16.
 */

var char; // personaje alojado en la memoria del cliente (es decir, el que está jugando)
var icons = {
    set: {class:"set", src: "set_level_icon.png"},
    unset: {class: "unset", src: "unset_level_icon.png"},
    maxable: {class: "max", src: "max_level_icon.png"}
};

/**
 * Abre un elemento desplegable
 * @param selectorId ID del elemento (string)
 */
function openNav(selectorId) {
    var element = $("#"+selectorId);
    element.fadeIn('fast', function() {element.css('width', '100%')});
}
/**
 * Cierra un elemento desplegable
 * @param selectorId ID del elemento (string)
 */
function closeNav(selectorId) {
    var element = $("#"+selectorId);
    element.fadeOut('fast', function() {element.css('width', '0%')});
}
/**
 * Mediante recursividad, construye una tabla a partir de un objeto de estadísticas. Si el objeto es un array, dibujará
 * una tabla de una fila para cada posición. Si es un objeto de estadísticas
 * @param statsObj
 * @returns {*}
 */
function table(statsObj) {
    if(util.is(util.stat, statsObj)) { // es un objeto de estadística singular
        return "<tr><td>"+statsObj.name+"</td><td id='"+statsObj.name.toLowerCase()+"'>"+level(statsObj)+"</td></tr>";
    } else if(util.is(util.table, statsObj)) { // es un objeto de conjunto de estadísticas
        var subTable = "", stats = statsObj.stats;
        var tableAdd = function(a) {subTable += a}, len = stats.length;
        tableAdd("<td><div class='table-responsive'><table id='"+statsObj.name.toLowerCase()+"' class='table'>");
        tableAdd("<thead><th>"+statsObj.name+"</th></thead><tbody><tr>");
        for(var i = 0; i<len; i++) {
            var s = stats[i];
            //tableAdd("<td>"+table(s)+"</td>");
            tableAdd(table(s));
        }
        tableAdd("</tr></tbody></table></div></td>");
        return subTable;
    } else if(util.type(util.arr, statsObj)) { // es un array
        var mainTable = $("table#stats>tbody");
        var content = "";
        var contentAdd = function(a) {content += a};
        statsObj.forEach(function(s){contentAdd("<tr>"+table(s)+"</tr>")});
        mainTable.append(content);
    }
}

function level(stat) { // OMG OMG OMG IT WORKS!!!! :D :D :D :D so happy 4 dat ^^
    var ret = "", level = stat.level;
    var icon, max = stat.max, lim = stat.limit;
    // bucle que inserta la imagen de una esfera de nivel. Si el personaje posee ese nivel aprendido, sera roja, y sino, gris
    for(var i = 1; i<=lim; i++) {
        if(stat.hasOwnProperty('max'))  icon = i<=max ? icons.maxable : icons.unset;
        else if(i>level) icon = icons.unset;
        else icon = icons.set;
        ret += "<img class='"+icon.class+"' src='/public/images/icon/" + icon.src + "'>";
    }
    return ret;
}

$("table#stats").ready(function() {
    var charJSON = $("div#char").text();
    char = JSON.parse(charJSON);
    char.stats[3].stats[2].max = 7; // testing para ver si pone bien las "bolitas rellenables" de sangre
    table(char.stats);
});

if (window["WebSocket"]) {
    $(document).ready(function() {
        var socket = io.connect(document.location.href);
        function connect() {
            openNav('sheet');
            /*socket.emit('id', id);
            socket.on('top', function(ten) {
                var element = $("ol#top");
                console.log("server top: " + ten);
                if(!top.compare(ten)) {
                    element.empty();
                    for(var counter = 0; counter < 10; counter++)
                        element.append(topEntry(ten[counter]));
                }
            });
            socket.on('snakes', function(data) {
                drawMap(data);
            });*/
        }
        connect();
    });
}