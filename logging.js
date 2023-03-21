exports.log = function(str) {
    console.log(currentTime() + " INFO: " + str);
}

exports.error = function(str) {
    console.error(currentTime() + " ERROR: " + str);
}

exports.debug = function(str) {
    console.log(currentTime() + " DEBUG: " + str);
}

function currentTime() {
    var date = new Date();
    return(date.getHours().toString().padStart(2,"0") + ":" + date.getMinutes().toString().padStart(2,"0") + ":" + date.getSeconds().toString().padStart(2,"0") + "." + date.getMilliseconds().toString().padStart(3,"0"))
}