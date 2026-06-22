const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFilePath = (collection) => path.join(DATA_DIR, `${collection}.json`);

const readData = (collection) => {
  const filePath = getFilePath(collection);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    return [];
  }
};

const writeData = (collection, data) => {
  fs.writeFileSync(getFilePath(collection), JSON.stringify(data, null, 2), 'utf8');
};

const findOne = (collection, query) => {
  const data = readData(collection);
  const item = data.find(x => {
    return Object.keys(query).every(key => x[key] === query[key]);
  });
  if (item && collection === 'users') {
    return {
      ...item,
      matchPassword: async function (enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
      }
    };
  }
  return item || null;
};

const findById = (collection, id) => {
  const data = readData(collection);
  const item = data.find(x => x._id.toString() === id.toString());
  return item || null;
};

const create = async (collection, itemData) => {
  const data = readData(collection);
  const newItem = {
    _id: Math.random().toString(36).substring(2, 9),
    ...itemData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  if (collection === 'users') {
    const salt = await bcrypt.genSalt(10);
    newItem.password = await bcrypt.hash(newItem.password, salt);
    newItem.matchPassword = async function (enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  data.push(newItem);
  writeData(collection, data);
  return newItem;
};

class QueryChain {
  constructor(data, collection) {
    this.data = data;
    this.collection = collection;
  }

  populate(pathName, fields) {
    if (pathName === 'author') {
      const users = readData('users');
      this.data = this.data.map(item => {
        const author = users.find(u => u._id.toString() === item.author?.toString());
        return {
          ...item,
          author: author ? { _id: author._id, username: author.username, cfHandle: author.cfHandle } : null
        };
      });
    }
    return this;
  }

  sort(sortOption) {
    this.data.sort((a, b) => {
      if (sortOption.score) {
        const scoreDiff = b.score - a.score;
        if (scoreDiff !== 0) return scoreDiff;
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    return this;
  }

  then(resolve) {
    resolve(this.data);
  }
}

class SingleQueryChain {
  constructor(item, collection) {
    this.item = item;
    this.collection = collection;
  }

  populate(pathName, fields) {
    if (pathName === 'author' && this.item) {
      const users = readData('users');
      const author = users.find(u => u._id.toString() === this.item.author?.toString());
      this.item = {
        ...this.item,
        author: author ? { _id: author._id, username: author.username, cfHandle: author.cfHandle } : null
      };
    }
    return this;
  }

  then(resolve) {
    resolve(this.item);
  }
}

class LocalQuestion {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.title = data.title;
    this.body = data.body;
    this.code = data.code || '';
    this.codeLanguage = data.codeLanguage || 'cpp';
    this.author = data.author;
    this.upvotes = data.upvotes || [];
    this.downvotes = data.downvotes || [];
    this.score = data.score || 0;
    this.contestId = data.contestId || null;
    this.contestName = data.contestName || null;
    this.comments = data.comments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  async save() {
    this.score = this.upvotes.length - this.downvotes.length;
    this.updatedAt = new Date().toISOString();
    
    const questions = readData('questions');
    const index = questions.findIndex(q => q._id.toString() === this._id.toString());
    
    const plainObject = {
      _id: this._id,
      title: this.title,
      body: this.body,
      code: this.code,
      codeLanguage: this.codeLanguage,
      author: this.author,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      score: this.score,
      contestId: this.contestId,
      contestName: this.contestName,
      comments: this.comments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (index >= 0) {
      questions[index] = plainObject;
    } else {
      questions.push(plainObject);
    }
    
    writeData('questions', questions);
    return this;
  }
}

class LocalAnswer {
  constructor(data) {
    this._id = data._id || Math.random().toString(36).substring(2, 9);
    this.questionId = data.questionId;
    this.body = data.body;
    this.code = data.code || '';
    this.codeLanguage = data.codeLanguage || 'cpp';
    this.author = data.author;
    this.upvotes = data.upvotes || [];
    this.downvotes = data.downvotes || [];
    this.score = data.score || 0;
    this.comments = data.comments || [];
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  async save() {
    this.score = this.upvotes.length - this.downvotes.length;
    this.updatedAt = new Date().toISOString();
    
    const answers = readData('answers');
    const index = answers.findIndex(a => a._id.toString() === this._id.toString());
    
    const plainObject = {
      _id: this._id,
      questionId: this.questionId,
      body: this.body,
      code: this.code,
      codeLanguage: this.codeLanguage,
      author: this.author,
      upvotes: this.upvotes,
      downvotes: this.downvotes,
      score: this.score,
      comments: this.comments,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };

    if (index >= 0) {
      answers[index] = plainObject;
    } else {
      answers.push(plainObject);
    }
    
    writeData('answers', answers);
    return this;
  }
}

module.exports = {
  readData,
  writeData,
  findOne,
  findById,
  create,
  QueryChain,
  SingleQueryChain,
  LocalQuestion,
  LocalAnswer
};
