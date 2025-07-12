import express from 'express';
import Question from '../models/Question.js';
import Answer from '../models/Answer.js';
import User from '../models/User.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all questions with pagination
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const tags = req.query.tags ? req.query.tags.split(',') : [];
    const sort = req.query.sort || 'newest';

    let query = { isActive: true };

    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Tag filtering
    if (tags.length > 0) {
      query.tags = { $in: tags };
    }

    // Sorting
    let sortQuery = {};
    switch (sort) {
      case 'newest':
        sortQuery = { createdAt: -1 };
        break;
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'votes':
        sortQuery = { voteScore: -1 };
        break;
      case 'views':
        sortQuery = { views: -1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    const questions = await Question.find(query)
      .populate('author', 'username avatar reputation')
      .populate('acceptedAnswer')
      .sort(sortQuery)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Calculate vote scores
    const questionsWithScores = questions.map(question => ({
      ...question,
      voteScore: question.votes.filter(v => v.type === 'upvote').length - 
                 question.votes.filter(v => v.type === 'downvote').length,
      answerCount: question.answers.length
    }));

    const total = await Question.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    res.json({
      questions: questionsWithScores,
      pagination: {
        currentPage: page,
        totalPages,
        totalQuestions: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single question
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'username avatar reputation')
      .populate({
        path: 'answers',
        match: { isActive: true },
        populate: [
          {
            path: 'author',
            select: 'username avatar reputation'
          },
          {
            path: 'comments',
            match: { isActive: true },
            populate: {
              path: 'author',
              select: 'username avatar'
            }
          }
        ]
      });

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Increment view count
    question.views += 1;
    await question.save();

    // Sort answers: pinned first, then by votes
    if (question.answers) {
      question.answers.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        const aScore = a.votes.filter(v => v.type === 'upvote').length - 
                      a.votes.filter(v => v.type === 'downvote').length;
        const bScore = b.votes.filter(v => v.type === 'upvote').length - 
                      b.votes.filter(v => v.type === 'downvote').length;
        
        return bScore - aScore;
      });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create question
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, tags } = req.body;

    const question = new Question({
      title,
      description,
      tags,
      author: req.user._id
    });

    await question.save();
    await User.findByIdAndUpdate(req.user._id, { $inc: { questionsAsked: 1 } });

    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'username avatar reputation');

    res.status(201).json(populatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Vote on question
router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body; // 'upvote' or 'downvote'
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Remove existing vote from this user
    question.votes = question.votes.filter(
      vote => vote.user.toString() !== req.user._id.toString()
    );

    // Add new vote
    question.votes.push({
      user: req.user._id,
      type
    });

    await question.save();
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete question
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Check if user is owner or admin
    if (question.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    question.isActive = false;
    await question.save();

    res.json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;