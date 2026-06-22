const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect } = require('../middleware/auth');

router.get('/', async (req, res) => {
  const { contestId, search, sortBy } = req.query;
  let query = {};

  if (contestId) {
    query.contestId = Number(contestId);
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { body: { $regex: search, $options: 'i' } }
    ];
  }

  try {
    let sortOption = { score: -1, createdAt: -1 };
    if (sortBy === 'newest') {
      sortOption = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username cfHandle')
      .sort(sortOption);
    
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username cfHandle');
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { title, body, code, codeLanguage, contestId, contestName } = req.body;

  try {
    const question = new Question({
      title,
      body,
      code: code || '',
      codeLanguage: codeLanguage || 'cpp',
      author: req.user._id,
      contestId: contestId ? Number(contestId) : null,
      contestName: contestName || null
    });

    const createdQuestion = await question.save();
    const populated = await Question.findById(createdQuestion._id).populate('author', 'username cfHandle');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const isUpvoted = question.upvotes.includes(userId);
    const isDownvoted = question.downvotes.includes(userId);

    if (isUpvoted) {
      question.upvotes = question.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      question.upvotes.push(userId);
      if (isDownvoted) {
        question.downvotes = question.downvotes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await question.save();
    res.json({
      score: question.score,
      upvotes: question.upvotes,
      downvotes: question.downvotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/downvote', protect, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const isUpvoted = question.upvotes.includes(userId);
    const isDownvoted = question.downvotes.includes(userId);

    if (isDownvoted) {
      question.downvotes = question.downvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      question.downvotes.push(userId);
      if (isUpvoted) {
        question.upvotes = question.upvotes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await question.save();
    res.json({
      score: question.score,
      upvotes: question.upvotes,
      downvotes: question.downvotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/comments', protect, async (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const comment = {
      text,
      author: req.user._id,
      authorUsername: req.user.username,
      authorCfHandle: req.user.cfHandle
    };

    question.comments.push(comment);
    await question.save();
    res.status(201).json(question.comments[question.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
