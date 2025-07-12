const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  votes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['upvote', 'downvote']
    }
  }],
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isAccepted: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

answerSchema.virtual('voteScore').get(function() {
  const upvotes = this.votes.filter(vote => vote.type === 'upvote').length;
  const downvotes = this.votes.filter(vote => vote.type === 'downvote').length;
  return upvotes - downvotes;
});

answerSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Answer', answerSchema);