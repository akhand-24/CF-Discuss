const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const localDb = require('../config/localDb');

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    cfHandle: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const MongooseUser = mongoose.model('User', UserSchema);

const UserWrapper = {
  findOne: async (query) => {
    if (global.useLocalDB) {
      return localDb.findOne('users', query);
    }
    return MongooseUser.findOne(query);
  },
  findById: (id) => {
    if (global.useLocalDB) {
      return {
        select: async () => localDb.findById('users', id)
      };
    }
    return MongooseUser.findById(id);
  },
  create: async (data) => {
    if (global.useLocalDB) {
      return localDb.create('users', data);
    }
    return MongooseUser.create(data);
  }
};

module.exports = UserWrapper;
