import Project from '../models/Project.js';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { produceEvent } from '../kafka/producer.js';

export const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
      members: [req.user._id]
    });

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { joinedProjects: project._id }
    });

    await produceEvent('project-events', {
      type: 'PROJECT_CREATED',
      projectId: project._id,
      name: project.name,
      description: project.description,
      createdBy: req.user._id,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const joinProject = async (req, res) => {
  try {
    const projectId = req.params.id;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    let newJoin = false;

    if (!project.members.includes(req.user._id)) {
      project.members.push(req.user._id);
      await project.save();

      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { joinedProjects: project._id }
      });

      newJoin = true;
    }
    const tasks = await Task.find({ projectId: project._id }, '_id');
    const taskIds = tasks.map(task => task._id.toString());

    if (newJoin) {
      const payload = {
        projectId,
        userId: req.user._id,
        username: req.user.name
      };

      const io = req.app.get('io');
      if (io) {
        io.to(`project:${projectId}`).emit('userJoinedProject', payload);
      }

      await produceEvent('project-events', {
        type: 'USER_JOINED_PROJECT',
        ...payload
      });
    }

    res.json({
      message: 'Joined project successfully',
      project,
      taskIds // Pass these to frontend to join task:<id> rooms
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('joinedProjects');
    res.json(user.joinedProjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
