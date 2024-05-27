exports.delayPromiseStart = (timeout, fn) => new Promise((resolve, reject) => {
    setTimeout(() => {
        fn().then(resolve).catch(reject);
    }, timeout);
});

exports.ms_to_hhmmss = (ms) => {
    let seconds = parseInt(ms / 1000);
    
    const hours = parseInt(seconds / 3600);
    seconds = seconds % 3600;

    const minutes = parseInt(seconds / 60);
    seconds = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};