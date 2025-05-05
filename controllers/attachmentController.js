import Attachment from '../models/Attachment.js';
import Task from '../models/Task.js';
import { produceEvent } from '../kafka/producer.js';

export const uploadAttachment = async (req, res) => {
  try {
    const { taskId } = req.params;
    const file = req.file;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const attachment = await Attachment.create({
      taskId,
      uploadedBy: req.user._id,
      fileUrl: `/uploads/${file.filename}`,
      fileName: file.originalname
    });

    task.attachments.push(attachment._id);
    await task.save();

    const payload = {
      taskId,
      attachmentId: attachment._id,
      fileName: attachment.fileName,
      fileUrl: attachment.fileUrl,
      uploadedById: req.user._id,
      uploadedByName: req.user.name,
      taskOwnerId: task.createdBy,
      createdAt: attachment.createdAt
    };

    const io = req.app.get('io');
    io?.to(`task:${taskId}`).emit('newAttachment', payload);

    await produceEvent('task-events', {
      type: 'ATTACHMENT_ADDED',
      ...payload,
    });

    res.status(201).json(attachment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


export const getAttachments = async (req, res) => {
  try {
    const attachments = await Attachment.find({ taskId: req.params.taskId })
      .populate('uploadedBy', 'name avatarUrl')
      .sort({ createdAt: -1 });

    res.json(attachments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
