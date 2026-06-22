const mongoose = require('mongoose');
const localDb = require('../config/localDb');

const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorUsername: {
    type: String,
    required: true
  },
  authorCfHandle: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QuestionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true
    },
    code: {
      type: String,
      default: ''
    },
    codeLanguage: {
      type: String,
      default: 'cpp'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    upvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    downvotes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    score: {
      type: Number,
      default: 0
    },
    contestId: {
      type: Number,
      default: null
    },
    contestName: {
      type: String,
      default: null
    },
    comments: [CommentSchema]
  },
  {
    timestamps: true
  }
);

QuestionSchema.pre('save', function (next) {
  this.score = this.upvotes.length - this.downvotes.length;
  next();
});

const MongooseQuestion = mongoose.model('Question', QuestionSchema);

function QuestionWrapper(data) {
  if (global.useLocalDB) {
    return new localDb.LocalQuestion(data);
  }
  return new MongooseQuestion(data);
}

QuestionWrapper.find = (query) => {
  if (global.useLocalDB) {
    const questions = localDb.readData('questions');
    let filtered = questions;

    if (query.contestId) {
      filtered = filtered.filter(q => q.contestId === Number(query.contestId));
    }

    if (query.$or) {
      const regexArr = query.$or.map(o => {
        const field = Object.keys(o)[0];
        const pattern = o[field].$regex;
        return { field, regex: new RegExp(pattern, 'i') };
      });
      filtered = filtered.filter(item => {
        return regexArr.some(r => r.regex.test(item[r.field]));
      });
    }

    return new localDb.QueryChain(filtered, 'questions');
  }
  return MongooseQuestion.find(query);
};

QuestionWrapper.findById = (id) => {
  if (global.useLocalDB) {
    const item = localDb.findById('questions', id);
    let questionObj = null;
    if (item) {
      questionObj = new localDb.LocalQuestion(item);
    }
    return new localDb.SingleQueryChain(questionObj, 'questions');
  }
  return MongooseQuestion.findById(id);
};

module.exports = QuestionWrapper;
