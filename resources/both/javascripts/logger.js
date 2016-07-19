/**
 * Objeto para controlar el log de mensajes por consola.
 * Created by becari on 19/07/2016.
 */

var logger = {
    /**
     * Deja un mensaje en la consola.
     * @param source String nombre del ámbito de procedencia del mensaje.
     * @param message String cuerpo del mensaje.
     */
    log: function(source, message) {
        var time = new Date(),
            formatTime = function(t) {
                return t.toString().length > 1 ? t : '0' + t;
            },
            formattedTime = formatTime(time.getHours()) + ":" + formatTime(time.getMinutes()) + ":" + formatTime(time.getSeconds()),
            fullMessage = formattedTime + ": [" + source + "] -> " + message;
        console.log(fullMessage);
    }
};

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined')
    module.exports = logger;