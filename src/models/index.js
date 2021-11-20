'use strict';

const { Sequelize, DataTypes } = require('sequelize');
const clothesModel = require('./clothes/model');
const foodModel = require('./food/model');
const Collection = require('./data-collection');
const users = require('../auth/models/users');
require('dotenv').config();

const DATABASE_URL = process.env.NODE_ENV === 'test' ? 'sqlite:memory:' : process.env.DATABASE_URL;
// const DATABASE_URL = process.env.DATABASE_URL || 'sqlite:memory:';

const DATABASE_CONFIG = process.env.NODE_ENV === 'production' ? {
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    }
  }
} : {};
const sequelize = new Sequelize(DATABASE_URL,DATABASE_CONFIG);

// const sequelize = new Sequelize(DATABASE_URL);
const food = foodModel(sequelize, DataTypes);
const clothes = clothesModel(sequelize, DataTypes);

module.exports = {
  db: sequelize,
  food: new Collection(food),
  clothes: new Collection(clothes),
  users: users(sequelize, DataTypes),
};
