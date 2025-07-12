import express from 'express';
import Answer from '../models/Answer.js';
import Question from '../models/Question.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create answer
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, questionId } = req.body;

    const question = await Question.findById(questionId);
    if (!question || !question.isActive) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = new Answer({
      content,
      question: questionId,
      author: req.user._id
    });

    await answer.save();

    // Add answer to question
    question.answers.push(answer._id);
    await question.save();


    await User.findByIdAndUpdate(req.user._id, { $inc: { answersGiven: 1 } });

    // Create notification for question author
    if (question.author.toString() !== req.user._id.toString()) {
      await new Notification({
        recipient: question.author,
        sender: req.user._id,
        type: 'answer',
        message: `${req.user.username} answered your question: ${question.title}`,
        relatedQuestion: questionId,
        relatedAnswer: answer._id
      }).save();
    }

    const populatedAnswer = await Answer.findById(answer._id)
      .populate('author', 'username avatar reputation');

    res.status(201).json(populatedAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/:id/vote', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    const answer = await Answer.findById(req.params.id);

    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    answer.votes = answer.votes.filter(
      vote => vote.user.toString() !== req.user._id.toString()
    );

    // Add new vote
    answer.votes.push({
      user: req.user._id,
      type
    });

    await answer.save();
    res.json({ message: 'Vote recorded' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Accept answer
router.post('/:id/accept', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');

    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is question owner
    if (answer.question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question owner can accept answers' });
    }


    await Answer.updateMany(
      { question: answer.question._id },
      { isAccepted: false }
    );


    answer.isAccepted = true;
    await answer.save();


    await Question.findByIdAndUpdate(answer.question._id, {
      acceptedAnswer: answer._id
    });

    res.json({ message: 'Answer accepted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.post('/:id/pin', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id).populate('question');

    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }


    if (answer.question.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only question owner can pin answers' });
    }

    // Remove pinned status from other answers
    await Answer.updateMany(
      { question: answer.question._id },
      { isPinned: false }
    );

    // Pin this answer
    answer.isPinned = true;
    await answer.save();

    // Update question's pinned answer
    await Question.findByIdAndUpdate(answer.question._id, {
      pinnedAnswer: answer._id
    });

    res.json({ message: 'Answer pinned' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete answer
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);

    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    // Check if user is owner or admin
    if (answer.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Soft delete answer
    answer.isActive = false;
    await answer.save();

    // Soft delete all comments on this answer
    await Comment.updateMany(
      { answer: answer._id },
      { isActive: false }
    );

    res.json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;