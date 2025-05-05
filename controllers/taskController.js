import Task from '../models/Task.js';
import { getCache, setCache, deleteCache, buildUserScopedKey } from '../utils/cache.js';
import { produceEvent } from '../kafka/producer.js';

const getCacheKey = (userId, status, q) => {
  const parts = [userId];
  if (status) parts.push(`status:${status}`);
  if (q) parts.push(`q:${q}`);
  return buildUserScopedKey('tasks', parts.join(':'));
};

export const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, assignedTo, projectId, priority, status } = req.body;

    const task = await Task.create({
      title,
      description,
      dueDate,
      assignedTo,
      projectId,
      priority,
      status: status || 'open',
      createdBy: req.user._id
    });

    await deleteCache(buildUserScopedKey('tasks', req.user._id));

    const io = req.app.get('io');
    io.to(projectId).emit('newTask', task);

    await produceEvent('task-events', {
      type: 'TASK_CREATED',
      taskId: task._id,
      title: task.title,
      assignedTo: task.assignedTo,
      createdBy: req.user._id,
      projectId: task.projectId,
      priority: task.priority,
      status: task.status
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  const { status, q } = req.query;
  const cacheKey = getCacheKey(req.user._id, status, q);

  try {
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const baseQuery = {
      $or: [
        { createdBy: req.user._id },
        { assignedTo: req.user._id }
      ]
    };

    if (status) {
      baseQuery.status = status;
    }

    if (q) {
      const regex = { $regex: q, $options: 'i' };
      baseQuery.$or.push({ title: regex }, { description: regex });
    }

    const tasks = await Task.find(baseQuery).populate('assignedTo projectId');

    await setCache(cacheKey, tasks, 60);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo projectId');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await deleteCache(buildUserScopedKey('tasks', req.user._id));

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('taskUpdated', task);

    await produceEvent('task-events', {
      type: 'TASK_UPDATED',
      taskId: task._id,
      updates: req.body,
      updatedBy: req.user._id,
    });

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    if (!['open', 'in-progress', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const task = await Task.findByIdAndUpdate(id, { status }, { new: true });
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await deleteCache(buildUserScopedKey('tasks', req.user._id));

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('taskStatusUpdated', {
      taskId: task._id,
      status
    });

    await produceEvent('task-events', {
      type: 'TASK_STATUS_UPDATED',
      taskId: task._id,
      status,
      updatedBy: req.user._id,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await deleteCache(buildUserScopedKey('tasks', req.user._id));

    const io = req.app.get('io');
    io.to(task.projectId.toString()).emit('taskDeleted', { taskId: task._id });

    await produceEvent('task-events', {
      type: 'TASK_DELETED',
      taskId: task._id,
      deletedBy: req.user._id,
    });

    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
