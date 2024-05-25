exports.delayPromiseStart = (timeout, fn) => new Promise((resolve, reject) => {
    setTimeout(() => {
        fn().then(resolve).catch(reject);
    }, timeout);
});