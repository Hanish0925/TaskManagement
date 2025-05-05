import Comment from '../models/Comment.js';
import Task from '../models/Task.js';
import { produceEvent } from '../kafka/producer.js';

export const addComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { taskId } = req.params;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const comment = await Comment.create({
      taskId,
      content,
      author: req.user._id
    });

    task.comments.push(comment._id);
    await task.save();

    const payload = {
      taskId,
      commentId: comment._id,
      content: comment.content,
      authorId: req.user._id,
      authorName: req.user.name,
      taskOwnerId: task.createdBy,
      createdAt: comment.createdAt,
    };

    const io = req.app.get('io');
    io?.to(`task:${taskId}`).emit('newComment', payload);

    await produceEvent('task-events', {
      type: 'COMMENT_ADDED',
      ...payload,
    });

    res.status(201).json(comment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const comments = await Comment.find({ taskId: req.params.taskId })
      .populate('author', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
