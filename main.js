const imageThumbnail = require('image-thumbnail');
const fs = require('fs');

(async () => {
  try {
    const thumbnail = await imageThumbnail('arrow.png', { width: 500 });
    fs.writeFileSync('arrow_500.png', thumbnail);
    console.log(thumbnail);
  } catch (err) {
    console.error(err);
  }
})();

// import redisClient from './utils/redis';

// (async () => {
//   console.log(redisClient.isAlive());
//   console.log(await redisClient.get('myKey'));
//   await redisClient.set('myKey', 12, 5);
//   console.log(await redisClient.get('myKey'));

//   setTimeout(async () => {
//     console.log(await redisClient.get('myKey'));
//   }, 1000 * 10);
// })();
