import mongoose from 'mongoose';

const attachmentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileName: {
    type: String
  }
}, {
  timestamps: true
});

const Attachment = mongoose.model('Attachment', attachmentSchema);
export default Attachment;
