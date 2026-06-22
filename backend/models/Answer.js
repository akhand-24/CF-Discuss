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

const AnswerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Question',
      required: true
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
    comments: [CommentSchema]
  },
  {
    timestamps: true
  }
);

AnswerSchema.pre('save', function (next) {
  this.score = this.upvotes.length - this.downvotes.length;
  next();
});

const MongooseAnswer = mongoose.model('Answer', AnswerSchema);

function AnswerWrapper(data) {
  if (global.useLocalDB) {
    return new localDb.LocalAnswer(data);
  }
  return new MongooseAnswer(data);
}

AnswerWrapper.find = (query) => {
  if (global.useLocalDB) {
    const answers = localDb.readData('answers');
    let filtered = answers;
    if (query.questionId) {
      filtered = filtered.filter(a => a.questionId.toString() === query.questionId.toString());
    }
    return new localDb.QueryChain(filtered, 'answers');
  }
  return MongooseAnswer.find(query);
};

AnswerWrapper.findById = (id) => {
  if (global.useLocalDB) {
    const item = localDb.findById('answers', id);
    let answerObj = null;
    if (item) {
      answerObj = new localDb.LocalAnswer(item);
    }
    return new localDb.SingleQueryChain(answerObj, 'answers');
  }
  return MongooseAnswer.findById(id);
};

module.exports = AnswerWrapper;
