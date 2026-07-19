const path = require('path');
const { appendFile } = require("fs/promises");

exports.LOGFILE = "log.txt";

exports.log = function (str, tag) {
    console.log(`[${currentTime()}] ${tag ? tag.toUpperCase() : "INFO"}: ${str}`);
    if (config["File Logging"]["Output to file"] === "true") {
        config["File Logging"]["All logs"] && this.output(str)
    }
}

exports.warn = function (str) {
    console.error(`[${currentTime()}] WARN: ${str}`);
    if (config["File Logging"]["Output to file"] === "true") {
        this.output(str, "WARN")
    }
}

exports.error = function (str, verbose = true) {
    console.error(`[${currentTime()}] ERROR: ${str}`);
    if (config["File Logging"]["Output to file"] === "true") {
        config["File Logging"]["Verbose"] && verbose
            ? this.outputErrorVerbose(str)
            : this.outputError(str)
    };
}

exports.debugLog = function (str) {
    if (config["Slippi"]["Debug Mode"] === "true") {
        console.log(`[${currentTime()}] DEBUG: ${str}`);
    }
}

exports.debug = function (str) {
    if (config["Slippi"]["Debug Mode"] === "true") {
        e = new Error
        console.log(`[${currentTime()}] DEBUG: ${str}`);
        console.error(e.stack)  //to print the stack trace to get line numbers
    }
}

exports.output = function (str, tag) {
    appendFile(this.LOGFILE, `[${currentTime()}] ${tag ? tag.toUpperCase() : "INFO"}: ${str}\r\n`)
}

exports.outputError = function (str) {
    appendFile(this.LOGFILE, `[${currentTime()}] ERROR: ${str}\r\n`)
}

exports.outputErrorVerbose = function (str) {
    e = new Error
    this.outputError(str);
    this.outputError(e.stack)  //to print the stack trace to get line numbers
}

function currentTime() {
    var date = new Date();
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(3, "0")}`;
}