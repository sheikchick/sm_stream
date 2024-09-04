const OBSWebSocket = require('obs-websocket-js').default;
const logging = require("./logging.js");

exports.loadObs = async () => {
    const _obs = new OBSWebSocket();
    const wsSettings = config["OBS"]["Websocket"];

    //defaults
    const host = wsSettings["Host"] || "127.0.0.1";
    const port = wsSettings["Port"] || "4455";
    const pass = wsSettings["Password"];

    logging.log(`Connecting to OBS at ${host}:${port}`)
    if(pass.length >= 6) {
        return _obs.connect(`ws://${host}:${port}`, pass).then(() => {
            logging.log("OBS WebSocket connected");
            global.obs = _obs;
            /*if (browserTransition) {
                return refreshBrowserTransition(browserTransition);
            }*/
        }).catch(() => {
            logging.error("Failed to connect to OBS, disconnecting...");
            unloadObs();
        });
    } else {
        logging.error("OBS websocket password provided is too short, disconnecting...");
        unloadObs();
    }
};


/**
 * If using an obs browser transition served from /static, if OBS is launched before the server
 * (which at the time of writing must be the case since OBS connection is only attempted at server
 * startup) then the browser source cannot load correctly.
 * This function essentially makes OBS refresh the browser source, now that the server is running.
 */
const refreshBrowserTransition = async (configTransition) => {
    const {transitions} = await obs.call('GetSceneTransitionList');
    const transition = transitions
        .find(({transitionName, transitionKind}) => transitionName === configTransition &&
            transitionKind === 'browserTransition');

    if (transition) {
        const {transitionName} = transition;
        await obs.call('SetCurrentSceneTransition', {transitionName});

        // Ensure "shutdown source when not visible" is ticked.
        await obs.call('SetCurrentSceneTransitionSettings', {transitionSettings: {
            audio_fade_style: 0,
            css: '',
            duration: 500,
            fps: 60,
            fps_custom: true,
            restart_when_active: false,
            shutdown: true,
            tp_type: 1,
            transition_point_ms: 350
        }});

        await obs.call('SetCurrentSceneTransition', {transitionName: 'Cut'});
        // OBS won't shut down the browser transition if switched back to too soon.
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                obs.call('SetCurrentSceneTransition', {transitionName})
                    .then(resolve)    
                    .catch(reject);
            }, 1000);
        });
    }
};

const unloadObs = () => {
    logging.error('OBS WebSocket unloaded');
    global.obs?.disconnect();
    global.obs = null;
};

/**
 * change obs scene using obs-websocket.
 * @param {string} scene 
 * @returns {Promise} resolves to a boolean indicating whether scene was changed.
 */
exports.changeScene = (() => {
    const setCurrentProgramScene = 'SetCurrentProgramScene';
    return async (sceneName) => {
        if (config["OBS"]["Scenes"]["Auto-swap Scenes"] === "true") {
            return obs?.call(setCurrentProgramScene, {sceneName})
                .then(() => {
                    logging.log(`Changed scene to ${sceneName}.`);
                }).catch(() => {
                });
        }
    }
})();

/**
 * get the timecode (in ms since start) of the current recording if it is in progress
 * @param {string} scene 
 * @returns {Promise} resolves to a boolean indicating whether scene was changed.
 */
exports.getTimecode = async () => {
    const getRecordStatus = 'GetRecordStatus';
    return obs?.call(getRecordStatus)
        .then((f) => {
            return f.outputDuration;
        }).catch((e) => {
            logging.error(`error in getTimecode() - ${e}`)
            return false
        });
};

/**
 * get the timecode (in ms since start) of the current recording if it is in progress
 * @param {string} scene 
 * @returns {Promise} resolves to a boolean indicating whether scene was changed.
 */
exports.getDirectory = async () => {
    const getRecordDirectory = 'GetRecordDirectory';
    return obs?.call(getRecordDirectory)
        .then((f) => {
            return f.recordDirectory;
        }).catch((e) => {
            logging.error(`error in getDirectory() - ${e}`)
            return false
        });
};