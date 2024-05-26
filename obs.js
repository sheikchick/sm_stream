const OBSWebSocket = require('obs-websocket-js').default;
const logging = require("./logging.js");

exports.loadObs = async () => {
    const _obs = new OBSWebSocket();
    const {host, port, password, browser_transition} = config.obs;
    if(host && port) {
        unloadObs();
        return _obs.connect(`ws://${config.obs.host}:${config.obs.port}`, password).then(() => {
            logging.log("OBS web-socket connected");
            global.obs = _obs;
            if (browser_transition) {
                return refreshBrowserTransition(browser_transition);
            }
        }).catch(() => {
            logging.error("Failed to connect to OBS, proceeding without.");
        });
    } else {
        logging.log("No OBS connection information provided, proceeding without.");
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
            transitionKind === 'browser_transition');

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
        if (config.obs.scene_changer) {
            return obs?.call(setCurrentProgramScene, {sceneName})
                .then(() => {
                    logging.log(`Changed scene to ${sceneName}.`);
                }).catch(() => {
                    logging.log(`Failed to change scene to ${sceneName}.`);
                    unloadObs();
                });
        }
    }
})();

/**
 * get the timecode (in ms since start) of the current recording if it is in progress
 * @param {string} scene 
 * @returns {Promise} resolves to a boolean indicating whether scene was changed.
 */
exports.getTimecode = () => {
    const getRecordStatus = 'GetRecordStatus';
    return obs?.call(getRecordStatus)
        .then((f) => {
            return f.outputDuration;
        }).catch(() => {
            unloadObs();
            return false
        });
};