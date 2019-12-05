const express = require('express');
const redis = require('redis');
const { seed, db, Thing } = require('./db.js');
const PORT = 3000;

const client = redis.createClient();
const app = express();

client.del('all', (err, reply) => {
  if (!err) console.log('all deleted from redis');
  else console.error(err);
});

app.get('*', (req, res, next) => {
  console.time('getThings');
  client.get('all', (err, reply) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }

    if (!reply) {
      Thing.findAll()
        .then(things => {
          client.set(
            'all',
            JSON.stringify(things.map(thing => thing.get('name'))),
            'EX',
            10,
            (err, reply) => {
              if (err) {
                console.error(err);
                console.timeEnd('getThings');
                process.exit(1);
              }

              console.timeEnd('getThings');
              res.send(`DB Count: ${things.length}`);
            }
          );
        })
        .catch(e => {
          console.error(e);
          console.timeEnd('getThings');
          process.exit(1);
        });
    } else {
      const things = JSON.parse(reply);

      console.timeEnd('getThings');
      res.send(`Redis Count: ${things.length}`);
    }
  });
});

seed()
  .then(() => {
    app.listen(PORT, () => {
      console.log('App is listening on ', PORT);
    });
  });
