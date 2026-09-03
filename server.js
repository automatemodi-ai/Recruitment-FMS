import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';

import Vacancy from './models/Vacancy.js';
import Candidate from './models/Candidate.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';

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

const seedSuperadmin = async () => {
  try {
    const adminEmail = 'automate.modi@gmail.com';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'Superadmin'
      });
      console.log('Default superadmin seeded: automate.modi@gmail.com');
    }
  } catch (err) {
    console.error('Error seeding superadmin:', err);
  }
};

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
        await seedSuperadmin();
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

// 6. Auth - Login
router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    let user = await User.findOne({ email: cleanEmail });

    // Fallback seed if superadmin doesn't exist yet
    if (!user && cleanEmail === 'automate.modi@gmail.com') {
      await seedSuperadmin();
      user = await User.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
});

// 7. Auth - List Users
router.get('/auth/users', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ created_at: -1 }).lean();
    res.json(users);
  } catch (err) {
    console.error('Fetch users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// 8. Auth - Create User
router.post('/auth/users', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name: String(name).trim(),
      email: cleanEmail,
      password: hashedPassword,
      role: role && ['Superadmin', 'Admin', 'Recruiter'].includes(role) ? role : 'Admin'
    });

    res.json({
      message: 'User created successfully',
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        created_at: newUser.created_at
      }
    });
  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: err.message || 'Failed to create user' });
  }
});

// 9. Auth - Delete User
router.delete('/auth/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.email === 'automate.modi@gmail.com') {
      return res.status(403).json({ error: 'Cannot delete primary superadmin account' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
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
