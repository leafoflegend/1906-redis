const Sequelize = require('sequelize');
const faker = require('faker');

const { STRING } = Sequelize;

const db = new Sequelize('postgres://localhost:5432/1906-redis', {
  logging: false,
});

const Thing = db.define('thing', {
  name: {
    type: STRING,
    allowNull: false,
  },
});

const seed = () => {
  return db.sync({
    force: true,
  })
    .then(() => {
      return Promise.all(new Array(10000)
        .fill('')
        .map(() => Thing.create({
          name: faker.lorem.word()
        })));
    })
    .then(things => {
      console.log('Things created: ', things.length);
    })
    .catch(e => {
      console.error(e);
      process.exit(1);
    })
};

module.exports = { db, seed, Thing };
