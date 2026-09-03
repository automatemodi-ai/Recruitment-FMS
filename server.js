import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import Vacancy from './models/Vacancy.js';
import Candidate from './models/Candidate.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer Storage Configuration (In-Memory for direct upload to Cloudinary)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Cloudinary Upload Stream Helper
const uploadStreamToCloudinary = (fileBuffer, folder, originalname) => {
  return new Promise((resolve, reject) => {
    const cleanName = path.parse(originalname).name.replace(/[^a-zA-Z0-9]/g, '_');
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'recruitment_fms',
        resource_type: 'auto',
        public_id: `${Date.now()}_${cleanName}`
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const ensureInitialStageTimeline = (record, fallbackStage) => {
  const stamp = record.stage_updated_at || record.timestamp || new Date().toISOString();
  const stage = record.stage || fallbackStage;
  record.timestamp = record.timestamp || stamp;
  record.stage_updated_at = record.stage_updated_at || stamp;
  record.stage_history = record.stage_history || [];
  record.stage_timestamps = record.stage_timestamps || {};
  record.stage_timestamps[stage] = {
    ...(record.stage_timestamps[stage] || {}),
    entered_at: record.stage_timestamps[stage]?.entered_at || stamp
  };
  return record;
};

// Cached MongoDB Atlas Connection for Serverless & Local
let cachedConnection = null;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('MONGODB_URI is not defined in environment variables.');
    return;
  }
  if (!cachedConnection) {
    cachedConnection = mongoose.connect(uri)
      .then(async (conn) => {
        console.log('Successfully connected to MongoDB Atlas');
        return conn;
      })
      .catch(err => {
        cachedConnection = null;
        console.error('MongoDB Atlas Connection Error:', err);
        throw err;
      });
  }
  return cachedConnection;
};

// Initiate connection
connectDB().catch(() => {});

// Middleware to ensure DB connection before handling requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database connection middleware error:', err);
  }
  next();
});

// API Routes Router (Mounted on both /api and / so all paths match)
const router = express.Router();

// 1. Get all Data
router.get('/data', async (req, res) => {
  try {
    const vacancies = await Vacancy.find().sort({ createdAt: -1 }).lean();
    const candidates = await Candidate.find().sort({ createdAt: -1 }).lean();

    res.json({ vacancies, candidates });
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

// 2. Sync / Bulk Save Data
router.post('/sync', async (req, res) => {
  try {
    const { vacancies, candidates } = req.body;

    if (vacancies && Array.isArray(vacancies)) {
      for (const v of vacancies) {
        if (!v.id) continue;
        ensureInitialStageTimeline(v, 'Manpower Requirement Raised');
        await Vacancy.findOneAndUpdate({ id: v.id }, v, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }

    if (candidates && Array.isArray(candidates)) {
      for (const c of candidates) {
        if (!c.id) continue;
        ensureInitialStageTimeline(c, 'Application Received (New)');
        await Candidate.findOneAndUpdate({ id: c.id }, c, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }

    res.json({ message: 'Sync complete with MongoDB Atlas' });
  } catch (error) {
    console.error('Error syncing to MongoDB:', error);
    res.status(500).json({ error: error.message });
  }
});

// 3. Dedicated File Upload Endpoint (Upload file to Cloudinary)
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const folder = req.body.folder || 'recruitment_fms/files';
    const result = await uploadStreamToCloudinary(req.file.buffer, folder, req.file.originalname);

    res.json({
      url: result.secure_url || result.url,
      public_id: result.public_id,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 4. Create / Update Vacancy
router.post('/vacancies', upload.single('jd'), async (req, res) => {
  try {
    const vacancyData = req.body;
    ensureInitialStageTimeline(vacancyData, 'Manpower Requirement Raised');
    
    if (req.file) {
      const uploadResult = await uploadStreamToCloudinary(req.file.buffer, 'recruitment_fms/jds', req.file.originalname);
      vacancyData.jd_url = uploadResult.secure_url;
      vacancyData.jd_public_id = uploadResult.public_id;
    }

    const updated = await Vacancy.findOneAndUpdate(
      { id: vacancyData.id },
      vacancyData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ message: 'Vacancy saved successfully', vacancy: updated });
  } catch (error) {
    console.error('Error saving vacancy:', error);
    res.status(500).json({ error: error.message });
  }
});

// 5. Create / Update Candidate (with CV Upload to Cloudinary)
router.post('/candidates', upload.single('cv'), async (req, res) => {
  try {
    const candidateData = req.body;
    ensureInitialStageTimeline(candidateData, 'Application Received (New)');

    if (req.file) {
      const uploadResult = await uploadStreamToCloudinary(req.file.buffer, 'recruitment_fms/cvs', req.file.originalname);
      candidateData.cv_url = uploadResult.secure_url;
      candidateData.cv_public_id = uploadResult.public_id;
    }

    const updated = await Candidate.findOneAndUpdate(
      { id: candidateData.id },
      candidateData,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Increment vacancy application count if new candidate
    if (candidateData.requirement_id) {
      await Vacancy.findOneAndUpdate(
        { id: candidateData.requirement_id },
        { $inc: { applications: 1 } }
      );
    }

    res.json({ message: 'Candidate saved successfully', candidate: updated });
  } catch (error) {
    console.error('Error saving candidate:', error);
    res.status(500).json({ error: error.message });
  }
});

// Mount router on both /api and / so it works regardless of Vercel path rewriting
app.use('/api', router);
app.use('/', router);

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
}

export default app;
