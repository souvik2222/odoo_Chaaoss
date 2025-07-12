const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
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
  answers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  }],
  acceptedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  pinnedAnswer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Answer'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

questionSchema.virtual('voteScore').get(function() {
  const upvotes = this.votes.filter(vote => vote.type === 'upvote').length;
  const downvotes = this.votes.filter(vote => vote.type === 'downvote').length;
  return upvotes - downvotes;
});

questionSchema.virtual('answerCount').get(function() {
  return this.answers.length;
});

questionSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Question', questionSchema);