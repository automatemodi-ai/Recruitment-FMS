import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import mongoose from 'mongoose';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import mammoth from 'mammoth';

import Vacancy from './models/Vacancy.js';
import Candidate from './models/Candidate.js';
import { User } from './models/User.js';
import bcrypt from 'bcryptjs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.get('/favicon.ico', (req, res) => res.status(204).end());

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
    const extension = path.extname(originalname).slice(1).toLowerCase();
    const imageFormats = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff']);
    const isImage = imageFormats.has(extension) || extension === 'pdf';
    const publicId = isImage
      ? `${Date.now()}_${cleanName}`
      : `${Date.now()}_${cleanName}${extension ? `.${extension}` : ''}`;

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder || 'recruitment_fms',
        resource_type: isImage ? 'image' : 'raw',
        public_id: publicId
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

const getSignedCloudinaryUrl = (sourceUrl) => {
  const parsed = new URL(sourceUrl);
  if (parsed.hostname !== 'res.cloudinary.com') {
    throw new Error('Only Cloudinary document URLs are supported');
  }

  const parts = parsed.pathname.split('/').filter(Boolean);
  const uploadIndex = parts.indexOf('upload');
  if (uploadIndex < 1 || !parts[uploadIndex - 1]) {
    throw new Error('Invalid Cloudinary document URL');
  }

  const resourceType = parts[uploadIndex - 1];
  const deliveryParts = parts.slice(uploadIndex + 1);
  if (deliveryParts[0] && /^v\d+$/.test(deliveryParts[0])) deliveryParts.shift();
  const publicPath = deliveryParts.join('/');
  const extensionIndex = publicPath.lastIndexOf('.');
  
  let publicId = publicPath;
  let format = undefined;
  if (resourceType !== 'raw' && extensionIndex > 0) {
    publicId = publicPath.slice(0, extensionIndex);
    format = publicPath.slice(extensionIndex + 1);
  }

  return cloudinary.utils.private_download_url(decodeURIComponent(publicId), format, {
    resource_type: resourceType,
    type: 'upload',
    attachment: false
  });
};

// Document & file helpers for previewing Word, PDF, and binary files
const detectFileType = (buffer, url = '') => {
  if (!buffer || buffer.length < 4) {
    return { ext: 'bin', mime: 'application/octet-stream' };
  }

  // PDF: %PDF (0x25 0x50 0x44 0x46)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { ext: 'pdf', mime: 'application/pdf', isPdf: true };
  }

  // OpenXML (DOCX, XLSX, etc.): PK.. (0x50 0x4B 0x03 0x04)
  if (buffer[0] === 0x50 && buffer[1] === 0x4B && (buffer[2] === 0x03 || buffer[2] === 0x05 || buffer[2] === 0x07)) {
    const lowerUrl = (url || '').toLowerCase();
    if (lowerUrl.includes('.xlsx')) {
      return { ext: 'xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', isXlsx: true };
    }
    return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', isDocx: true };
  }

  // Legacy MS Office (DOC, XLS): 0xD0 0xCF 0x11 0xE0
  if (buffer[0] === 0xD0 && buffer[1] === 0xCF && buffer[2] === 0x11 && buffer[3] === 0xE0) {
    const lowerUrl = (url || '').toLowerCase();
    if (lowerUrl.includes('.xls')) {
      return { ext: 'xls', mime: 'application/vnd.ms-excel', isXls: true };
    }
    return { ext: 'doc', mime: 'application/msword', isDoc: true };
  }

  // PNG: 0x89 0x50 0x4E 0x47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return { ext: 'png', mime: 'image/png', isImage: true };
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return { ext: 'jpg', mime: 'image/jpeg', isImage: true };
  }

  // GIF: GIF8
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return { ext: 'gif', mime: 'image/gif', isImage: true };
  }

  // Fallback to URL extension
  const extMatch = (url || '').split('?')[0].match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : '';
  if (ext === 'docx') return { ext: 'docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', isDocx: true };
  if (ext === 'doc') return { ext: 'doc', mime: 'application/msword', isDoc: true };
  if (ext === 'pdf') return { ext: 'pdf', mime: 'application/pdf', isPdf: true };
  if (['png', 'jpg', 'jpeg', 'webp'].includes(ext)) return { ext, mime: `image/${ext === 'jpg' ? 'jpeg' : ext}`, isImage: true };

  return { ext: ext || 'bin', mime: 'application/octet-stream' };
};

const sanitizeDownloadFilename = (sourceUrl, detectedExt, customName) => {
  let name = '';
  if (customName) {
    name = customName.replace(/[^\w\s.-]/gi, '_').replace(/\s+/g, ' ').trim();
  }
  if (!name) {
    try {
      const parsed = new URL(sourceUrl);
      const segments = parsed.pathname.split('/').filter(Boolean);
      let base = segments[segments.length - 1] || 'document';
      base = decodeURIComponent(base).replace(/^\d{10,14}_/, '');
      name = base;
    } catch {
      name = 'document';
    }
  }
  const cleanExt = (detectedExt || '').toLowerCase().replace(/^\./, '');
  if (cleanExt && !name.toLowerCase().endsWith(`.${cleanExt}`)) {
    name = `${name}.${cleanExt}`;
  }
  return name || `document.${cleanExt || 'bin'}`;
};

const buildWordHtmlPreview = ({ title, htmlContent, downloadUrl, fileName }) => {
  const safeTitle = (title || 'Document').replace(/[<>&"]/g, '');
  const safeFileName = (fileName || 'document.docx').replace(/[<>&"]/g, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
    :root {
      --bg: #f3f5f7;
      --paper: #ffffff;
      --text: #1a202c;
      --text-muted: #718096;
      --heading: #111827;
      --border: #e2e8f0;
      --green: #287b64;
      --green-dark: #1f624f;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 20px 16px 40px;
      background: var(--bg);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: var(--text);
      line-height: 1.65;
      font-size: 14px;
      -webkit-font-smoothing: antialiased;
    }
    .preview-header-bar {
      max-width: 860px;
      margin: 0 auto 16px;
      background: #ffffff;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 12px 18px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
      flex-wrap: wrap;
      gap: 10px;
    }
    .preview-badge-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .file-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 12px;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 6px;
      border: 1px solid #bfdbfe;
    }
    .file-name-text {
      font-weight: 600;
      color: var(--heading);
      font-size: 13px;
      max-width: 420px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .preview-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .btn-download-original {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--green);
      color: #ffffff;
      text-decoration: none;
      padding: 7px 14px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      box-shadow: 0 1px 2px rgba(0,0,0,0.06);
      transition: background 0.15s ease;
    }
    .btn-download-original:hover {
      background: var(--green-dark);
    }
    .btn-print {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background: #f8fafc;
      color: #334155;
      border: 1px solid var(--border);
      padding: 7px 12px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 12px;
      cursor: pointer;
    }
    .btn-print:hover {
      background: #f1f5f9;
    }
    .document-container {
      max-width: 860px;
      margin: 0 auto;
      background: var(--paper);
      padding: 48px 56px;
      border-radius: 8px;
      border: 1px solid var(--border);
      box-shadow: 0 4px 14px rgba(0,0,0,0.05);
      min-height: 800px;
    }
    h1, h2, h3, h4, h5, h6 {
      color: var(--heading);
      margin-top: 1.4em;
      margin-bottom: 0.6em;
      line-height: 1.3;
    }
    h1 { font-size: 22px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; }
    h2 { font-size: 18px; border-bottom: 1px solid #edf2f7; padding-bottom: 4px; }
    h3 { font-size: 15px; }
    p { margin: 0.7em 0; }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 16px 0;
      font-size: 13.5px;
    }
    table th, table td {
      border: 1px solid #cbd5e1;
      padding: 8px 12px;
      text-align: left;
      vertical-align: top;
    }
    table th {
      background: #f8fafc;
      font-weight: 700;
      color: #0f172a;
    }
    table tr:nth-child(even) td {
      background: #fcfdfd;
    }
    ul, ol {
      padding-left: 24px;
      margin: 0.8em 0;
    }
    li { margin-bottom: 4px; }
    a { color: var(--green); text-decoration: underline; }
    img { max-width: 100%; height: auto; border-radius: 4px; }
    @media (max-width: 700px) {
      .document-container { padding: 24px 18px; }
      body { padding: 12px 8px; }
      .preview-header-bar { padding: 10px 12px; flex-direction: column; align-items: flex-start; }
    }
    @media print {
      body { background: #fff; padding: 0; }
      .preview-header-bar { display: none; }
      .document-container { border: none; box-shadow: none; padding: 0; }
    }
  </style>
</head>
<body>
  <div class="preview-header-bar">
    <div class="preview-badge-group">
      <span class="file-badge">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        Word (.docx) Preview
      </span>
      <span class="file-name-text" title="${safeFileName}">${safeFileName}</span>
    </div>
    <div class="preview-actions">
      <button type="button" class="btn-print" onclick="window.print()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
        Print
      </button>
      <a href="${downloadUrl}" class="btn-download-original" download>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        Download Original Document
      </a>
    </div>
  </div>
  <main class="document-container">
    ${htmlContent || '<p style="color:#64748b; font-style:italic;">No readable text found in this document.</p>'}
  </main>
</body>
</html>`;
};

const buildDocFallbackHtml = ({ title, downloadUrl, fileName, message }) => {
  const safeTitle = (title || 'Document').replace(/[<>&"]/g, '');
  const safeFileName = (fileName || 'document.doc').replace(/[<>&"]/g, '');
  const safeMessage = (message || 'This document cannot be previewed directly in the browser.').replace(/[<>&"]/g, '');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <style>
    body {
      margin: 0;
      padding: 40px 16px;
      background: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 80vh;
      box-sizing: border-box;
    }
    .card {
      background: #ffffff;
      max-width: 480px;
      width: 100%;
      padding: 36px 28px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 16px rgba(0,0,0,0.06);
      text-align: center;
    }
    .icon-box {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      background: #eff6ff;
      color: #2563eb;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    h2 {
      font-size: 19px;
      color: #0f172a;
      margin: 0 0 8px;
      font-weight: 700;
    }
    .filename {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 16px;
      word-break: break-all;
    }
    p {
      font-size: 14px;
      color: #475569;
      line-height: 1.55;
      margin: 0 0 24px;
    }
    .btn-download {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #287b64;
      color: #ffffff;
      text-decoration: none;
      font-weight: 600;
      font-size: 14px;
      padding: 10px 22px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(40,123,100,0.25);
    }
    .btn-download:hover { background: #1f624f; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon-box">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
    </div>
    <h2>Microsoft Word Document</h2>
    <div class="filename">${safeFileName}</div>
    <p>${safeMessage}</p>
    <a href="${downloadUrl}" class="btn-download" download>
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      Download Original Document
    </a>
  </div>
</body>
</html>`;
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

// Candidate phone & email normalization and duplicate helpers
const normalizePhone = (phone) => {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
  if (digits.length >= 10) return digits.slice(-10);
  return digits;
};

const normalizeEmail = (email) => {
  if (!email) return '';
  return String(email).trim().toLowerCase();
};

const escapeRegex = (str) => {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const findDuplicateCandidate = async ({ phone, email, excludeId = null }) => {
  const normPhone = normalizePhone(phone);
  const normEmail = normalizeEmail(email);

  if (!normPhone && !normEmail) {
    return null;
  }

  const conditions = [];
  if (normPhone && normPhone.length >= 10) {
    conditions.push({ phone: { $regex: new RegExp(`${escapeRegex(normPhone)}$`) } });
  }
  if (normEmail) {
    conditions.push({ email: { $regex: new RegExp(`^${escapeRegex(normEmail)}$`, 'i') } });
  }

  if (conditions.length === 0) return null;

  const query = { $or: conditions };
  if (excludeId) {
    query.id = { $ne: excludeId };
  }

  const existingList = await Candidate.find(query).lean();
  if (!existingList || existingList.length === 0) return null;

  for (const existing of existingList) {
    const existingNormPhone = normalizePhone(existing.phone);
    const existingNormEmail = normalizeEmail(existing.email);

    const matchedPhone = Boolean(normPhone && existingNormPhone && normPhone === existingNormPhone);
    const matchedEmail = Boolean(normEmail && existingNormEmail && normEmail === existingNormEmail);

    if (matchedPhone || matchedEmail) {
      let field = 'both';
      if (matchedPhone && !matchedEmail) field = 'phone';
      else if (!matchedPhone && matchedEmail) field = 'email';

      return {
        candidate: existing,
        field,
        matchedPhone,
        matchedEmail
      };
    }
  }

  return null;
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
    const [vacancies, candidates] = await Promise.all([
      Vacancy.find().sort({ createdAt: -1 }).lean(),
      Candidate.find().sort({ createdAt: -1 }).lean()
    ]);

    res.setHeader('Cache-Control', 'private, no-cache');
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
        
        // Prevent creating new records with duplicate phone or email
        const existingRecord = await Candidate.findOne({ id: c.id }).lean();
        if (!existingRecord && (c.phone || c.email)) {
          const duplicate = await findDuplicateCandidate({ phone: c.phone, email: c.email, excludeId: c.id });
          if (duplicate) {
            console.warn(`Sync skipped duplicate candidate: ${c.name} (${c.phone} / ${c.email}) matches ${duplicate.candidate.id}`);
            continue;
          }
        }
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
    const url = result.secure_url || result.url;

    res.json({
      url,
      preview_url: `/api/file?url=${encodeURIComponent(url)}`,
      public_id: result.public_id,
      originalname: req.file.originalname
    });
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Stream signed Cloudinary files through the app so restricted assets do not expose a 401 in the browser.
// Supports inline Word document (.docx) rendering via Mammoth, legacy .doc fallback, and direct downloads.
router.get('/file', async (req, res) => {
  try {
    const sourceUrl = String(req.query.url || '');
    if (!sourceUrl) {
      return res.status(400).json({ error: 'Missing url parameter' });
    }

    const signedUrl = getSignedCloudinaryUrl(sourceUrl);
    const fileResponse = await fetch(signedUrl);
    if (!fileResponse.ok) {
      return res.status(fileResponse.status).json({ error: 'Document could not be loaded from Cloudinary' });
    }

    const arrayBuf = await fileResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);
    const fileType = detectFileType(buffer, sourceUrl);
    const isDownload = req.query.download === '1' || req.query.download === 'true';
    const customName = req.query.name ? String(req.query.name).trim() : '';
    const downloadFilename = sanitizeDownloadFilename(sourceUrl, fileType.ext, customName);

    // If download explicitly requested, serve original binary file as attachment
    if (isDownload) {
      res.setHeader('Content-Type', fileType.mime || fileResponse.headers.get('content-type') || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${downloadFilename}"`);
      return res.send(buffer);
    }

    // If DOCX and viewed in browser/iframe, render converted HTML preview
    if (fileType.isDocx) {
      try {
        const result = await mammoth.convertToHtml({ buffer });
        const previewHtml = buildWordHtmlPreview({
          title: customName || downloadFilename,
          htmlContent: result.value,
          downloadUrl: `/api/file?url=${encodeURIComponent(sourceUrl)}&download=1${customName ? `&name=${encodeURIComponent(customName)}` : ''}`,
          fileName: downloadFilename
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline');
        return res.send(previewHtml);
      } catch (convErr) {
        console.error('Mammoth conversion error:', convErr);
        const fallbackHtml = buildDocFallbackHtml({
          title: customName || downloadFilename,
          downloadUrl: `/api/file?url=${encodeURIComponent(sourceUrl)}&download=1${customName ? `&name=${encodeURIComponent(customName)}` : ''}`,
          fileName: downloadFilename,
          message: 'Unable to render inline preview for this Word file. You can download and view it directly.'
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Disposition', 'inline');
        return res.send(fallbackHtml);
      }
    }

    // If legacy DOC, render fallback card with download link
    if (fileType.isDoc) {
      const fallbackHtml = buildDocFallbackHtml({
        title: customName || downloadFilename,
        downloadUrl: `/api/file?url=${encodeURIComponent(sourceUrl)}&download=1${customName ? `&name=${encodeURIComponent(customName)}` : ''}`,
        fileName: downloadFilename,
        message: 'Legacy Microsoft Word (.doc) files cannot be rendered directly in web browsers. Please download to view.'
      });
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Disposition', 'inline');
      return res.send(fallbackHtml);
    }

    // For PDF, images, or other browser-renderable files, serve inline
    res.setHeader('Content-Type', fileType.mime || fileResponse.headers.get('content-type') || 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${downloadFilename}"`);
    res.send(buffer);
  } catch (error) {
    console.error('Document proxy error:', error);
    res.status(400).json({ error: error.message || 'Invalid document URL' });
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

// 4.1 Check Duplicate Candidate (by Phone Number or Email)
router.get('/candidates/check-duplicate', async (req, res) => {
  try {
    const { phone, email, excludeId } = req.query;
    const normPhone = normalizePhone(phone);
    const normEmail = normalizeEmail(email);

    if (!normPhone && !normEmail) {
      return res.json({ exists: false });
    }

    const duplicate = await findDuplicateCandidate({ phone, email, excludeId });
    if (duplicate) {
      const fieldDesc = duplicate.field === 'phone' ? 'phone number' : duplicate.field === 'email' ? 'email address' : 'phone number and email address';
      return res.json({
        exists: true,
        duplicateField: duplicate.field,
        candidateId: duplicate.candidate.id,
        candidateName: duplicate.candidate.name,
        appliedDate: duplicate.candidate.timestamp || duplicate.candidate.createdAt,
        message: `An application has already been submitted with this ${fieldDesc}. Each candidate can only apply once.`
      });
    }

    res.json({ exists: false });
  } catch (error) {
    console.error('Error checking duplicate candidate:', error);
    res.status(500).json({ error: 'Failed to verify candidate uniqueness' });
  }
});

// 4.2 Public Candidate Job Application Submission Endpoint
router.post('/apply', upload.single('cv'), async (req, res) => {
  try {
    const candidateData = req.body;
    const name = String(candidateData.name || '').trim();
    const phone = String(candidateData.phone || '').trim();
    const email = String(candidateData.email || '').trim();
    const requirement_id = String(candidateData.requirement_id || '').trim();

    if (!name) {
      return res.status(400).json({ error: 'Candidate name is required' });
    }
    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }
    if (!email) {
      return res.status(400).json({ error: 'Email ID is required' });
    }

    const normPhone = normalizePhone(phone);
    if (normPhone.length < 10) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit phone number' });
    }

    // Check for duplicate phone or email
    const duplicate = await findDuplicateCandidate({ phone, email });
    if (duplicate) {
      const fieldDesc = duplicate.field === 'phone' ? 'phone number' : duplicate.field === 'email' ? 'email address' : 'phone number or email address';
      return res.status(409).json({
        error: `An application has already been submitted with this ${fieldDesc}. Each applicant can only submit the form once.`,
        duplicateField: duplicate.field,
        candidateId: duplicate.candidate.id
      });
    }

    // Upload CV to Cloudinary if provided
    if (req.file) {
      const uploadResult = await uploadStreamToCloudinary(req.file.buffer, 'recruitment_fms/cvs', req.file.originalname);
      candidateData.cv_url = uploadResult.secure_url;
      candidateData.cv_public_id = uploadResult.public_id;
    }

    // Generate Unique Candidate ID
    const currentYear = new Date().getFullYear();
    const existingCandidates = await Candidate.find({ id: new RegExp(`^CAN-${currentYear}-`) }, { id: 1 }).lean();
    let maxIdNum = 0;
    for (const c of existingCandidates) {
      if (c.id) {
        const parts = c.id.split('-');
        if (parts.length >= 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
        }
      }
    }
    candidateData.id = `CAN-${currentYear}-${String(maxIdNum + 1).padStart(4, '0')}`;

    // Resolve vacancy title if role not set
    let linkedVacancy = null;
    if (requirement_id) {
      linkedVacancy = await Vacancy.findOne({ id: requirement_id });
      if (linkedVacancy && !candidateData.role) {
        candidateData.role = linkedVacancy.title;
      }
    }
    if (!candidateData.role) {
      candidateData.role = 'Not Specified';
    }

    candidateData.stage = 'Application Received (New)';
    candidateData.screening_status = 'Pending Review';
    const submittedAt = new Date().toISOString();
    candidateData.timestamp = submittedAt;
    ensureInitialStageTimeline(candidateData, 'Application Received (New)');

    const saved = await Candidate.create(candidateData);

    // Increment vacancy applications count
    if (linkedVacancy) {
      await Vacancy.findOneAndUpdate({ id: linkedVacancy.id }, { $inc: { applications: 1 } });
    }

    res.json({
      message: 'Application submitted successfully',
      candidate: {
        id: saved.id,
        name: saved.name,
        role: saved.role
      }
    });
  } catch (error) {
    console.error('Error submitting job application:', error);
    res.status(500).json({ error: error.message || 'Failed to submit application' });
  }
});

// 5. Create / Update Candidate (with CV Upload to Cloudinary)
router.post('/candidates', upload.single('cv'), async (req, res) => {
  try {
    const candidateData = req.body;
    ensureInitialStageTimeline(candidateData, 'Application Received (New)');

    // Check duplicate phone or email (excluding current candidate ID if updating)
    if (candidateData.phone || candidateData.email) {
      const duplicate = await findDuplicateCandidate({
        phone: candidateData.phone,
        email: candidateData.email,
        excludeId: candidateData.id
      });
      if (duplicate) {
        const fieldDesc = duplicate.field === 'phone' ? 'phone number' : duplicate.field === 'email' ? 'email address' : 'phone number or email';
        return res.status(409).json({
          error: `A candidate with this ${fieldDesc} already exists in the system (${duplicate.candidate.name} - ${duplicate.candidate.id}).`,
          duplicateField: duplicate.field,
          candidateId: duplicate.candidate.id
        });
      }
    }

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

// 5.1 Bulk Create / Import Candidates (with Duplicate Skipping)
router.post('/candidates/bulk', async (req, res) => {
  try {
    const { candidates } = req.body;
    if (!candidates || !Array.isArray(candidates) || candidates.length === 0) {
      return res.status(400).json({ error: 'No candidates provided for bulk import' });
    }

    const currentYear = new Date().getFullYear();
    const existingCandidates = await Candidate.find({ id: new RegExp(`^CAN-${currentYear}-`) }, { id: 1 }).lean();
    let maxIdNum = 0;
    for (const c of existingCandidates) {
      if (c.id) {
        const parts = c.id.split('-');
        if (parts.length >= 3) {
          const num = parseInt(parts[2], 10);
          if (!isNaN(num) && num > maxIdNum) maxIdNum = num;
        }
      }
    }

    const savedCandidates = [];
    const skippedDuplicates = [];
    const vacancyCountMap = {};
    const batchSeenPhones = new Set();
    const batchSeenEmails = new Set();

    for (const rawCandidate of candidates) {
      const candidateData = { ...rawCandidate };
      if (!candidateData.name || !candidateData.phone) continue;

      const normPhone = normalizePhone(candidateData.phone);
      const normEmail = normalizeEmail(candidateData.email);

      // Check within current batch
      if (normPhone && batchSeenPhones.has(normPhone)) {
        skippedDuplicates.push({
          name: candidateData.name,
          phone: candidateData.phone,
          email: candidateData.email,
          reason: 'Duplicate phone in upload file'
        });
        continue;
      }
      if (normEmail && batchSeenEmails.has(normEmail)) {
        skippedDuplicates.push({
          name: candidateData.name,
          phone: candidateData.phone,
          email: candidateData.email,
          reason: 'Duplicate email in upload file'
        });
        continue;
      }

      // Check against database
      const duplicateInDb = await findDuplicateCandidate({
        phone: candidateData.phone,
        email: candidateData.email
      });
      if (duplicateInDb) {
        skippedDuplicates.push({
          name: candidateData.name,
          phone: candidateData.phone,
          email: candidateData.email,
          reason: `Already exists in database (${duplicateInDb.candidate.id})`
        });
        continue;
      }

      if (normPhone) batchSeenPhones.add(normPhone);
      if (normEmail) batchSeenEmails.add(normEmail);

      if (!candidateData.id) {
        maxIdNum++;
        candidateData.id = `CAN-${currentYear}-${String(maxIdNum).padStart(4, '0')}`;
      }

      const defaultStage = candidateData.stage || 'Application Received (New)';
      ensureInitialStageTimeline(candidateData, defaultStage);

      if (!candidateData.requirement_id) {
        candidateData.requirement_id = 'GENERAL';
      }
      if (!candidateData.role) {
        candidateData.role = 'Not Specified';
      }
      if (!candidateData.source) {
        candidateData.source = 'Bulk Import';
      }
      if (!candidateData.screening_status) {
        candidateData.screening_status = defaultStage === 'CV Screened & Shortlisted' ? 'Shortlisted' : 'Pending Review';
      }

      const saved = await Candidate.findOneAndUpdate(
        { id: candidateData.id },
        candidateData,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      savedCandidates.push(saved);

      if (candidateData.requirement_id && candidateData.requirement_id !== 'GENERAL') {
        vacancyCountMap[candidateData.requirement_id] = (vacancyCountMap[candidateData.requirement_id] || 0) + 1;
      }
    }

    // Increment vacancy application counts
    for (const [reqId, count] of Object.entries(vacancyCountMap)) {
      await Vacancy.findOneAndUpdate(
        { id: reqId },
        { $inc: { applications: count } }
      );
    }

    res.json({
      message: `Successfully imported ${savedCandidates.length} candidate(s)${skippedDuplicates.length ? ` (${skippedDuplicates.length} duplicate(s) skipped)` : ''}`,
      count: savedCandidates.length,
      skippedCount: skippedDuplicates.length,
      skippedDuplicates,
      candidates: savedCandidates
    });
  } catch (error) {
    console.error('Error in bulk candidate import:', error);
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
