// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' })); // parse JSON body with larger limit

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('MONGO_URI not set in .env');
  process.exit(1);
}

/**
 * Schemas
 */

const TopicSchema = new mongoose.Schema({
  clientId: { type: Number },
  title: String,
  description: String,
  duration: String,
  completed: { type: Boolean, default: false }
}, { _id: false });

const SubjectSchema = new mongoose.Schema({
  clientId: { type: Number },
  name: String,
  topics: [TopicSchema]
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
  clientId: { type: Number },
  title: String,
  type: String,
  subject: String,
  description: String,
  marks: Number,
  due: String,
  totalStudents: Number,
  submitted: Number
}, { _id: false });

const TrackerSchema = new mongoose.Schema({
  clientId: { type: Number },
  date: String,
  subject: String,
  studentsPresent: Number,
  topicsCovered: [String],
  notes: String,
  notesFile: String
}, { _id: false });

const ClassSchema = new mongoose.Schema({
  clientId: { type: Number, unique: true, sparse: true },
  label: { type: String, required: true },
  totalStudents: { type: Number, default: 30 },
  subjects: [SubjectSchema],
  assignments: [AssignmentSchema],
  tracker: [TrackerSchema],
  createdAt: { type: Date, default: Date.now }
});

const ClassModel = mongoose.model('Class', ClassSchema);

// Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

/* ---------- API routes ---------- */

// Get all classes
app.get('/api/classes', async (req, res) => {
  try {
    const classes = await ClassModel.find().sort({ createdAt: -1 }).lean();
    res.json(classes);
  } catch (err) {
    console.error('GET /api/classes error:', err);
    res.status(500).json({ error: 'Server error fetching classes' });
  }
});

// Create new class
app.post('/api/classes', async (req, res) => {
  try {
    const { clientId, label, totalStudents } = req.body;
    if (!label) return res.status(400).json({ error: 'label required' });

    const newClass = new ClassModel({
      clientId: clientId || Date.now(),
      label,
      totalStudents: totalStudents || 30,
      subjects: [],
      assignments: [],
      tracker: []
    });
    await newClass.save();
    console.log('Created class:', newClass.clientId);
    res.status(201).json(newClass);
  } catch (err) {
    console.error('POST /api/classes error:', err);
    res.status(500).json({ error: 'Server error creating class' });
  }
});

// Delete a class
app.delete('/api/classes/:clientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const deleted = await ClassModel.findOneAndDelete({ clientId });
    if (!deleted) return res.status(404).json({ error: 'Class not found' });
    console.log('Deleted class:', clientId);
    res.json({ success: true, clientId });
  } catch (err) {
    console.error('DELETE /api/classes error:', err);
    res.status(500).json({ error: 'Server error deleting class' });
  }
});

// Get a single class by clientId
app.get('/api/classes/:clientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const cls = await ClassModel.findOne({ clientId }).lean();
    if (!cls) return res.status(404).json({ error: 'Class not found' });
    res.json(cls);
  } catch (err) {
    console.error('GET /api/classes/:clientId error:', err);
    res.status(500).json({ error: 'Server error fetching class' });
  }
});

// Add a subject to a class
app.post('/api/classes/:clientId/subjects', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const { clientId: subjectClientId, name } = req.body;
    if (!name) return res.status(400).json({ error: 'name required' });

    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $push: { subjects: { clientId: subjectClientId || Date.now(), name, topics: [] } } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Added subject to class:', clientId);
    res.json(updated);
  } catch (err) {
    console.error('POST /api/classes/:clientId/subjects error:', err);
    res.status(500).json({ error: 'Server error adding subject' });
  }
});

// Delete a subject
app.delete('/api/classes/:clientId/subjects/:subjectClientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const subjectClientId = Number(req.params.subjectClientId);

    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $pull: { subjects: { clientId: subjectClientId } } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Deleted subject:', subjectClientId);
    res.json(updated);
  } catch (err) {
    console.error('DELETE subject error:', err);
    res.status(500).json({ error: 'Server error deleting subject' });
  }
});

// Add a topic to a subject
app.post('/api/classes/:clientId/subjects/:subjectClientId/topics', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const subjectClientId = Number(req.params.subjectClientId);
    const { clientId: topicClientId, title, description, duration } = req.body;
    if (!title || !description || !duration) {
      return res.status(400).json({ error: 'title/description/duration required' });
    }

    const updated = await ClassModel.findOneAndUpdate(
      { clientId, 'subjects.clientId': subjectClientId },
      { 
        $push: { 
          'subjects.$.topics': { 
            clientId: topicClientId || Date.now(), 
            title, 
            description, 
            duration, 
            completed: false 
          } 
        } 
      },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class or subject not found' });
    console.log('Added topic to subject:', subjectClientId);
    res.json(updated);
  } catch (err) {
    console.error('POST topic error:', err);
    res.status(500).json({ error: 'Server error adding topic' });
  }
});

// Delete a topic
app.delete('/api/classes/:clientId/subjects/:subjectClientId/topics/:topicClientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const subjectClientId = Number(req.params.subjectClientId);
    const topicClientId = Number(req.params.topicClientId);

    const updated = await ClassModel.findOneAndUpdate(
      { clientId, 'subjects.clientId': subjectClientId },
      { $pull: { 'subjects.$.topics': { clientId: topicClientId } } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class or subject not found' });
    console.log('Deleted topic:', topicClientId);
    res.json(updated);
  } catch (err) {
    console.error('DELETE topic error:', err);
    res.status(500).json({ error: 'Server error deleting topic' });
  }
});

// Toggle topic completion
app.patch('/api/classes/:clientId/subjects/:subjectClientId/topics/:topicClientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const subjectClientId = Number(req.params.subjectClientId);
    const topicClientId = Number(req.params.topicClientId);

    // First, get the class
    const cls = await ClassModel.findOne({ clientId });
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    // Find the subject and topic
    const subject = cls.subjects.find(s => s.clientId === subjectClientId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const topic = subject.topics.find(t => t.clientId === topicClientId);
    if (!topic) return res.status(404).json({ error: 'Topic not found' });

    // Toggle completion
    topic.completed = !topic.completed;
    await cls.save();

    console.log('Toggled topic completion:', topicClientId);
    res.json(cls.toObject());
  } catch (err) {
    console.error('PATCH topic error:', err);
    res.status(500).json({ error: 'Server error updating topic' });
  }
});

// Add assignment to class
app.post('/api/classes/:clientId/assignments', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const assignment = req.body;
    if (!assignment || !assignment.title) {
      return res.status(400).json({ error: 'assignment.title required' });
    }

    assignment.clientId = assignment.clientId || Date.now();
    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $push: { assignments: assignment } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Added assignment to class:', clientId);
    res.json(updated);
  } catch (err) {
    console.error('POST assignment error:', err);
    res.status(500).json({ error: 'Server error adding assignment' });
  }
});

// Delete assignment
app.delete('/api/classes/:clientId/assignments/:assignmentClientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const assignmentClientId = Number(req.params.assignmentClientId);

    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $pull: { assignments: { clientId: assignmentClientId } } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Deleted assignment:', assignmentClientId);
    res.json(updated);
  } catch (err) {
    console.error('DELETE assignment error:', err);
    res.status(500).json({ error: 'Server error deleting assignment' });
  }
});

// Add tracker entry to class
app.post('/api/classes/:clientId/tracker', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const entry = req.body;
    if (!entry || !entry.date || !entry.subject) {
      return res.status(400).json({ error: 'date and subject required' });
    }

    entry.clientId = entry.clientId || Date.now();
    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $push: { tracker: entry } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Added tracker entry to class:', clientId);
    res.json(updated);
  } catch (err) {
    console.error('POST tracker error:', err);
    res.status(500).json({ error: 'Server error adding tracker entry' });
  }
});

// Delete tracker entry
app.delete('/api/classes/:clientId/tracker/:trackerClientId', async (req, res) => {
  try {
    const clientId = Number(req.params.clientId);
    const trackerClientId = Number(req.params.trackerClientId);

    const updated = await ClassModel.findOneAndUpdate(
      { clientId },
      { $pull: { tracker: { clientId: trackerClientId } } },
      { new: true }
    ).lean();

    if (!updated) return res.status(404).json({ error: 'Class not found' });
    console.log('Deleted tracker entry:', trackerClientId);
    res.json(updated);
  } catch (err) {
    console.error('DELETE tracker error:', err);
    res.status(500).json({ error: 'Server error deleting tracker entry' });
  }
});

/* Serve static frontend after API routes */
app.use(express.static('public'));

// Default route
app.get('/', (req, res) => {
  res.redirect('/tec.html');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
  console.log(`MongoDB URI: ${MONGO_URI.substring(0, 20)}...`);
});