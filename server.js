import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
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

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB Atlas');
    await seedDatabaseIfNeeded();
  })
  .catch(err => {
    console.error('MongoDB Atlas Connection Error:', err);
  });

// Seed Initial Data from database.json if MongoDB collections are empty
const seedDatabaseIfNeeded = async () => {
  try {
    const vacancyCount = await Vacancy.countDocuments();
    const candidateCount = await Candidate.countDocuments();
    const dbPath = path.join(process.cwd(), 'database.json');

    if (vacancyCount === 0 && candidateCount === 0 && fs.existsSync(dbPath)) {
      console.log('Seeding MongoDB Atlas from local database.json...');
      const rawData = fs.readFileSync(dbPath, 'utf8');
      const data = JSON.parse(rawData);

      if (data.vacancies && data.vacancies.length > 0) {
        await Vacancy.insertMany(data.vacancies);
        console.log(`Seeded ${data.vacancies.length} vacancies into MongoDB Atlas.`);
      }

      if (data.candidates && data.candidates.length > 0) {
        await Candidate.insertMany(data.candidates);
        console.log(`Seeded ${data.candidates.length} candidates into MongoDB Atlas.`);
      }
    }
  } catch (err) {
    console.error('Failed to seed database:', err);
  }
};

// API Routes

// 1. Get all Data
app.get('/api/data', async (req, res) => {
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
app.post('/api/sync', async (req, res) => {
  try {
    const { vacancies, candidates } = req.body;

    if (vacancies && Array.isArray(vacancies)) {
      for (const v of vacancies) {
        if (!v.id) continue;
        await Vacancy.findOneAndUpdate({ id: v.id }, v, { upsert: true, new: true, setDefaultsOnInsert: true });
      }
    }

    if (candidates && Array.isArray(candidates)) {
      for (const c of candidates) {
        if (!c.id) continue;
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
app.post('/api/upload', upload.single('file'), async (req, res) => {
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
app.post('/api/vacancies', upload.single('jd'), async (req, res) => {
  try {
    const vacancyData = req.body;
    
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
app.post('/api/candidates', upload.single('cv'), async (req, res) => {
  try {
    const candidateData = req.body;

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

const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Backend API running on http://localhost:${PORT}`));
}

export default app;
