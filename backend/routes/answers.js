const express = require('express');
const router = express.Router();
const Answer = require('../models/Answer');
const { protect } = require('../middleware/auth');

router.get('/question/:questionId', async (req, res) => {
  try {
    const answers = await Answer.find({ questionId: req.params.questionId })
      .populate('author', 'username cfHandle')
      .sort({ score: -1, createdAt: -1 });
    res.json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, async (req, res) => {
  const { questionId, body, code, codeLanguage } = req.body;

  try {
    const answer = new Answer({
      questionId,
      body,
      code: code || '',
      codeLanguage: codeLanguage || 'cpp',
      author: req.user._id
    });

    const createdAnswer = await answer.save();
    const populated = await Answer.findById(createdAnswer._id).populate('author', 'username cfHandle');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.post('/:id/upvote', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const isUpvoted = answer.upvotes.includes(userId);
    const isDownvoted = answer.downvotes.includes(userId);

    if (isUpvoted) {
      answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      answer.upvotes.push(userId);
      if (isDownvoted) {
        answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await answer.save();
    res.json({
      score: answer.score,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/downvote', protect, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const isUpvoted = answer.upvotes.includes(userId);
    const isDownvoted = answer.downvotes.includes(userId);

    if (isDownvoted) {
      answer.downvotes = answer.downvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      answer.downvotes.push(userId);
      if (isUpvoted) {
        answer.upvotes = answer.upvotes.filter((id) => id.toString() !== userId.toString());
      }
    }

    await answer.save();
    res.json({
      score: answer.score,
      upvotes: answer.upvotes,
      downvotes: answer.downvotes
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
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const comment = {
      text,
      author: req.user._id,
      authorUsername: req.user.username,
      authorCfHandle: req.user.cfHandle
    };

    answer.comments.push(comment);
    await answer.save();
    res.status(201).json(answer.comments[answer.comments.length - 1]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
