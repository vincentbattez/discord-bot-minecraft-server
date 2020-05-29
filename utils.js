async function waitUntil(callbackPromise) {
  console.log('waitUntil');
  
  return await new Promise(resolve => {
    const interval = setInterval(() => {
      callbackPromise()
        .then(() => {
          clearInterval(interval);
          console.log('clearInterval');
          resolve();
        })
        .catch(() => {
          console.log('try to connect...')
        })
    }, 2000);
  });
}

module.exports = {
  waitUntil
}