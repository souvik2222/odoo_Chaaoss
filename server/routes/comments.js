import express from 'express';
import Comment from '../models/Comment.js';
import Answer from '../models/Answer.js';
import Notification from '../models/Notification.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Create comment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { content, answerId } = req.body;

    const answer = await Answer.findById(answerId).populate('author');
    if (!answer || !answer.isActive) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const comment = new Comment({
      content,
      answer: answerId,
      author: req.user._id
    });

    await comment.save();

    // Add comment to answer
    answer.comments.push(comment._id);
    await answer.save();

    // Create notification for answer author
    if (answer.author._id.toString() !== req.user._id.toString()) {
      await new Notification({
        recipient: answer.author._id,
        sender: req.user._id,
        type: 'comment',
        message: `${req.user.username} commented on your answer`,
        relatedAnswer: answerId
      }).save();
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('author', 'username avatar');

    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || !comment.isActive) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is owner or admin
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    comment.isActive = false;
    await comment.save();

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;