exports.log = function(str, tag) {
    console.log(`${currentTime()} ${tag ? tag.toUpperCase() : "INFO"}: ${str}`);
}

exports.info = function(str) {
    console.log(`${currentTime()} INFO: ${str}`);
}

exports.warn = function(str) {
    console.error(`${currentTime()} WARN: ${str}`);
}

exports.error = function(str) {

    console.error(`${currentTime()} ERROR: ${str}`);
}

exports.debugLog = function(str) {
    if(config["Slippi"]["Debug Mode"] === "true") {
        console.log(`${currentTime()} DEBUG: ${str}`);
    }
}

exports.debug = function(str) {
    if(config["Slippi"]["Debug Mode"] === "true") {
        e = new Error
        console.log(`${currentTime()} DEBUG: ${str}`);
        console.error(e.stack)  //to print the stack trace to get line numbers
    }
}

function currentTime() {
    var date = new Date();
    return `${date.getHours().toString().padStart(2,"0")}:${
        date.getMinutes().toString().padStart(2,"0")}:${
            date.getSeconds().toString().padStart(2,"0")}.${
                date.getMilliseconds().toString().padStart(3,"0")}`;
}