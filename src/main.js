import './style.css'

const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') && window.location.port === '5173' ? 'http://localhost:3000' : '';

const positions = ["Executive Assistant","Process Coordinator","Business Operations Intern","Production Planner / Order Manager","Sales Executive - Retail","Sales Executive - Project Sales","Sales Manager","Sales Coordinator","CRM Executive","Showroom Receptionist","Furniture Designer","AutoCAD Draftsman","SolidWorks Draftsman","Design Manager","Production Drawing Designer","Product Development Designer","Finance & Accounts Manager","Senior Accountant","Accounts Executive","Accountant & Cashier","Cost Analyst","HR Manager","Recruitment Executive","Back Office Executive","Data Entry Operator","Office Assistant","Inventory Manager","Inventory Executive","Warehouse In-Charge","Storekeeper","Material Inward Supervisor","Purchase Manager","Purchase Executive","Vendor Development Executive","MIS Executive","IT Support Executive","AI Automation Engineer","Marketing Manager","Marketing Executive","Digital Marketing Executive","Graphic Designer","Production Head","Production Manager - Wooden","Production Supervisor - Wooden","Production Manager - Metal","Production Supervisor - Metal","Production Supervisor - Chair","QC Executive","Dispatch Supervisor","Logistics Coordinator","Project Manager","Project Coordinator","Site Supervisor","Maintenance Executive","Electrical Technician","Hotel Manager","Hotel Operations Supervisor","Front Office Manager","Front Office Executive","Hotel Receptionist","Guest Service Executive","Housekeeping Supervisor","Housekeeping Staff","F&B Manager","Restaurant Supervisor","Chef"];
const departments = ["Admin & Back Office","Design & Engineering","Finance & Accounts","Human Resources","Inventory Management","IT & Automation","Marketing","MDO","Operations","Production","Projects & Installation","Sales & CRM","Front Office - Hotel","Maintenance","Hotel Operations / Front Office","Housekeeping","Food & Beverage"];
const locations = ["Showroom","Factory","Miracle"];
const priorities = ["Urgent","High","Medium","Low"];
const experiences = ["Fresher (0-2 years)",">2 Years",">3 Years",">5 Years",">10 Years"];
const salaries = ["10,000-15,000","15,000-20,000","20,000-25,000","25,000-30,000","30,000-40,000","40,000-50000","50,000 - 75,000","75,000 - 1,00,000","1,00,000 - 2,00,000","2,00,000 & Above"];
const managers = ["Prateek Sir","Ayushi Mam","Divyansh Sir","Vishnu Sir","Ravi Sir"];
const stages = ["Application Received (New)","CV Screened & Shortlisted","Interview Scheduled","Interview Completed (Under Evaluation)","Final Selection (HOD Approval)","Offer Released","Offer Accepted (Pre-Onboarding)","Candidate Joined (Closed - Won)","Rejected","Dropped / Ghosted","On Hold"]
const vacancyStages = ["Manpower Requirement Raised","Requirement Review","Vacancy Published / Sourcing Started","Candidate Pipeline Active","Final Candidate Selected","Offer Released","Offer Accepted","Candidate Joined","Vacancy Closed"];
const vacancyStatuses = ['Open', 'On-Hold', 'Cancelled', 'Closed'];
const vacancyStageLabels = {
  'Manpower Requirement Raised': 'Manpower',
  'Requirement Review': 'Review',
  'Vacancy Published / Sourcing Started': 'Sourcing',
  'Candidate Pipeline Active': 'Pipeline',
  'Final Candidate Selected': 'Selected',
  'Offer Released': 'Offer Out',
  'Offer Accepted': 'Accepted',
  'Candidate Joined': 'Joined',
  'Vacancy Closed': 'Closed'
};
const vacancyWorkflow = {
  'Manpower Requirement Raised': { owner: 'Department HOD', output: 'Approved manpower requisition', tat: 0 },
  'Requirement Review': { owner: 'HR Head', output: 'Final JD, KRA and KPI', tat: 1 },
  'Vacancy Published / Sourcing Started': { owner: 'HR Recruiter', output: 'Published vacancy and sourcing plan', tat: 1 },
  'Candidate Pipeline Active': { owner: 'HR Recruiter', output: 'Screened candidate pipeline', tat: null },
  'Final Candidate Selected': { owner: 'HOD + Management', output: 'Selection approval', tat: 1 },
  'Offer Released': { owner: 'HR', output: 'Offer letter issued', tat: 0 },
  'Offer Accepted': { owner: 'Candidate + HR', output: 'Signed acceptance and joining date', tat: 3 },
  'Candidate Joined': { owner: 'HR', output: 'Joining confirmed', tat: null },
  'Vacancy Closed': { owner: 'HR Head', output: 'Closure and onboarding handover', tat: 0 }
};
const candidateWorkflow = {
  'Application Received (New)': { owner: 'HR Recruiter', output: 'Candidate record created', tat: 7 },
  'CV Screened & Shortlisted': { owner: 'HR Recruiter', output: 'Eligibility decision and screening notes', tat: 1 },
  'Interview Scheduled': { owner: 'HR', output: 'Interview date and interviewer confirmed', tat: 1 },
  'Interview Completed (Under Evaluation)': { owner: 'HOD / Interviewer', output: 'Rating and evaluation remarks', tat: 3 },
  'Final Selection (HOD Approval)': { owner: 'Management', output: 'Final approval', tat: 3 },
  'Offer Released': { owner: 'HR', output: 'Salary approval and offer letter', tat: 1 },
  'Offer Accepted (Pre-Onboarding)': { owner: 'Candidate + HR', output: 'Expected joining date confirmed', tat: null },
  'Candidate Joined (Closed - Won)': { owner: 'HR', output: 'Actual joining recorded', tat: 0 },
  'Rejected': { owner: 'HR', output: 'Rejection reason recorded', tat: 0 },
  'Dropped / Ghosted': { owner: 'HR', output: 'Drop reason recorded', tat: 0 },
  'On Hold': { owner: 'HR', output: 'Follow-up date and reason', tat: null }
};



document.querySelector('#app').innerHTML = `
<div class="shell">
  <aside class="sidebar">
    <div class="brand">
      <div class="brand-mark">MF</div>
      <div>
        <strong>Modi Furniture</strong>
        <small>Recruitment FMS</small>
      </div>
    </div>
    <nav>
      <button class="nav-item active" data-view="Dashboard"><span class="nav-icon">◱</span> Dashboard</button>
      <button class="nav-item" data-view="Vacancies"><span class="nav-icon">○</span> Vacancies</button>
      <button class="nav-item" data-view="CV Screening"><span class="nav-icon">◇</span> CV Screening</button>
      <button class="nav-item" data-view="Candidates"><span class="nav-icon">◒</span> Candidate Pipeline</button>
      <button class="nav-item" data-view="Reports"><span class="nav-icon">📊</span> Reports</button>
    </nav>
    <div class="sidebar-bottom">
      <div class="sync-dot"></div>
      System<br>Online
    </div>
  </aside>
  <div style="flex:1; display:flex; flex-direction:column; height:100vh;">
    <header class="topbar" style="padding: 16px 24px; border-bottom: 1px solid var(--line); margin-bottom: 0; align-items:center; flex-wrap:wrap; gap:12px;">
      <div class="search">
        <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><path d="M21 21l-4.35-4.35"></path></svg>
        <input type="search" id="search" placeholder="Search candidates...">
      </div>
      <div class="top-actions">
        <a href="/apply.html" target="_blank" style="color:var(--green); font-weight:600; text-decoration:none; font-size: 14px; margin-right:15px;">Open Candidate Form ↗</a>
        <button class="primary" data-action="new-candidate">+ Add Candidate</button>
      </div>
    </header>
    <main class="main" style="overflow-y:auto; padding: 24px; flex:1; width:100%; box-sizing:border-box;"></main>
  </div>
</div>
`;

let data = { vacancies: [], candidates: [] };
const legacyStageMap = { 'Manpower Requirement': 'Application Received (New)', 'Manpower Review': 'CV Screened & Shortlisted', 'Publish Vacancy': 'Application Received (New)', 'CV Screening': 'Application Received (New)', 'Candidate Shortlist': 'CV Screened & Shortlisted', 'Telephonic Screening': 'Interview Scheduled', 'Technical Assessment / Test': 'Interview Completed (Under Evaluation)', 'HR Interview Completed': 'Interview Completed (Under Evaluation)', 'Final Management Interview': 'Final Selection (HOD Approval)', 'Reference Check / Document Check': 'Final Selection (HOD Approval)', 'Selected - Job Offer Released': 'Offer Released', 'Offer Accepted — Joining Awaited': 'Offer Accepted (Pre-Onboarding)', 'Joined / Rejected / Dropped / On Hold': 'Candidate Joined (Closed - Won)' };
const nowIso = () => new Date().toISOString();
const toIsoDateTime = value => {
  if (!value) return '';
  const text = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};
const initialTimestampFor = record => toIsoDateTime(record.timestamp || record.createdAt || record.openedOn || record.stage_updated_at) || nowIso();
const normalizeStageTimestamps = (record, currentStage) => {
  const rawStamps = record.stage_timestamps instanceof Map ? Object.fromEntries(record.stage_timestamps) : (record.stage_timestamps || {});
  const stamps = { ...rawStamps };
  const initialStamp = initialTimestampFor(record);
  (record.stage_history || []).forEach(entry => {
    if (!entry?.stage) return;
    const stageStamp = stamps[entry.stage] || {};
    stageStamp.entered_at = toIsoDateTime(stageStamp.entered_at || entry.entered_at || initialStamp) || initialStamp;
    stageStamp.completed_at = toIsoDateTime(stageStamp.completed_at || entry.completed_at || entry.exited_at) || stageStamp.completed_at || '';
    stamps[entry.stage] = stageStamp;
  });
  const currentStamp = stamps[currentStage] || {};
  currentStamp.entered_at = toIsoDateTime(currentStamp.entered_at || record.stage_updated_at || initialStamp) || initialStamp;
  stamps[currentStage] = currentStamp;
  return stamps;
};
const normalizeCandidate = candidate => {
  const stage = legacyStageMap[candidate.stage] || candidate.stage || 'Application Received (New)';
  const stage_updated_at = toIsoDateTime(candidate.stage_updated_at || candidate.timestamp || candidate.createdAt) || nowIso();
  return { ...candidate, timestamp: toIsoDateTime(candidate.timestamp || candidate.createdAt || stage_updated_at) || stage_updated_at, stage, stage_updated_at, stage_history: candidate.stage_history || [], stage_timestamps: normalizeStageTimestamps({ ...candidate, stage_updated_at }, stage) };
};
const normalizeVacancy = vacancy => {
  const stage = vacancyStages.includes(vacancy.stage) ? vacancy.stage : 'Manpower Requirement Raised';
  const stage_updated_at = toIsoDateTime(vacancy.stage_updated_at || vacancy.createdAt || vacancy.openedOn) || nowIso();
  return { ...vacancy, timestamp: toIsoDateTime(vacancy.timestamp || vacancy.createdAt || vacancy.openedOn || stage_updated_at) || stage_updated_at, stage, stage_updated_at, stage_history: vacancy.stage_history || [], stage_timestamps: normalizeStageTimestamps({ ...vacancy, stage_updated_at }, stage) };
};
fetch(`${API_BASE}/api/data`)
  .then(res => res.json())
  .then(resData => {
    data = { ...resData, vacancies: (resData.vacancies || []).map(normalizeVacancy), candidates: (resData.candidates || []).map(normalizeCandidate) };
    render();
  })
  .catch(err => {
    console.error('Fetch error:', err);
    document.querySelector('main').innerHTML = '<h2 style="text-align:center;margin-top:50px;color:#e53e3e;">⚠ Backend API is not running!</h2><p style="text-align:center;">Make sure you are running <b>npm run dev</b> in the terminal so that both the backend (port 3000) and frontend are running together.</p>';
  })
  .catch(err => {
    console.error('Failed to connect to backend', err);
    render();
  });







let activeView = 'Dashboard';
let activePipelineStage = 'Application Received (New)';
let activeVacancyStage = 'Manpower Requirement Raised';
let search = '';
const filterDefaults = {
  dashboard: { dateField: 'created', from: '', to: '', department: '', location: '', priority: '', owner: '', source: '', status: '' },
  vacancies: { dateField: 'opened', from: '', to: '', department: '', location: '', priority: '', owner: '', status: '' },
  screening: { dateField: 'created', from: '', to: '', department: '', role: '', source: '', location: '', priority: '', owner: '', screening_status: '' },
  candidates: { dateField: 'updated', from: '', to: '', department: '', role: '', source: '', location: '', priority: '', owner: '' },
  reports: { dateField: 'created', from: '', to: '', department: '', location: '', priority: '', owner: '', source: '', status: '' }
};
let filters = Object.fromEntries(Object.entries(filterDefaults).map(([key, value]) => [key, { ...value }]));

const priorityClass = (p) => p === 'Urgent' ? 'red' : p === 'High' ? 'orange' : 'green';
const stageClass = (s) => s.includes('Interview') || s.includes('Assessment') ? 'orange' : s.includes('Joined') ? 'green' : s.includes('Rejected') ? 'red' : 'blue';
const countStage = (stage, list = data.candidates) => list.filter(candidate => candidate.stage === stage).length;
const daysInStage = candidate => Math.max(0, Math.floor((Date.now() - new Date(candidate.stage_updated_at || candidate.timestamp || Date.now())) / 86400000));
const daysOpen = vacancy => Math.max(0, Math.floor(((vacancy.filledOn ? new Date(vacancy.filledOn) : new Date()) - new Date(vacancy.openedOn || vacancy.created_at || Date.now())) / 86400000));
const stageMeta = candidate => candidateWorkflow[candidate.stage] || { owner: 'HR', output: 'Stage update required', tat: null };
const isStageOverdue = candidate => stageMeta(candidate).tat !== null && daysInStage(candidate) > stageMeta(candidate).tat;
const activeCandidates = (list = data.candidates) => list.filter(item => !['Candidate Joined (Closed - Won)', 'Rejected', 'Dropped / Ghosted'].includes(item.stage));
const getVacancyStage = vacancy => vacancyStages.includes(vacancy.stage) ? vacancy.stage : 'Manpower Requirement Raised';
const vacancyStageMeta = stage => vacancyWorkflow[stage] || vacancyWorkflow['Manpower Requirement Raised'];
const nextVacancyStage = stage => {
  const index = vacancyStages.indexOf(stage);
  return index >= 0 && index < vacancyStages.length - 1 ? vacancyStages[index + 1] : null;
};
const commonDateOptions = [
  { value: 'created', label: 'Created / Added' },
  { value: 'updated', label: 'Stage Updated' },
  { value: 'due', label: 'Deadline / Next Action' },
  { value: 'closed', label: 'Closed / Joined' }
];
const vacancyDateOptions = [
  { value: 'opened', label: 'Opening Date' },
  { value: 'deadline', label: 'Deadline' },
  { value: 'updated', label: 'Stage Updated' },
  { value: 'closed', label: 'Filled Date' }
];
const candidateDateOptions = [
  { value: 'created', label: 'Application Date' },
  { value: 'updated', label: 'Stage Updated' },
  { value: 'interview', label: 'Interview Date' },
  { value: 'offer', label: 'Offer Date' },
  { value: 'joining', label: 'Joining Date' },
  { value: 'due', label: 'Next Action Date' }
];

const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const uniqueValues = values => [...new Set(values.filter(value => value !== undefined && value !== null && String(value).trim() !== '').map(value => String(value).trim()))].sort((a, b) => a.localeCompare(b));
const sameFilterValue = (actual, expected) => String(actual ?? '').trim().toLowerCase() === String(expected ?? '').trim().toLowerCase();
const linkedVacancy = candidate => data.vacancies.find(vacancy => sameFilterValue(vacancy.id, candidate.requirement_id) || sameFilterValue(vacancy.title, candidate.role)) || {};

function parseDateValue(value) {
  if (!value) return null;
  const text = String(value);
  const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(text) ? `${text}T00:00:00` : text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function matchesDateRange(value, from, to) {
  if (!from && !to) return true;
  const date = parseDateValue(value);
  if (!date) return false;
  if (from && date < new Date(`${from}T00:00:00`)) return false;
  if (to && date > new Date(`${to}T23:59:59`)) return false;
  return true;
}

function getVacancyDate(vacancy, field) {
  if (field === 'deadline' || field === 'due') return vacancy.deadline;
  if (field === 'updated') return vacancy.stage_updated_at;
  if (field === 'closed') return vacancy.filledOn;
  return vacancy.openedOn || vacancy.created_at || vacancy.stage_updated_at;
}

function getCandidateDate(candidate, field) {
  if (field === 'updated') return candidate.stage_updated_at || candidate.timestamp;
  if (field === 'interview') return candidate.interview_date;
  if (field === 'offer') return candidate.offer_date;
  if (field === 'joining') return candidate.joining_date;
  if (field === 'due') return candidate.next_action_date || candidate.interview_date || candidate.joining_date;
  if (field === 'closed') return candidate.joining_date || (candidate.stage === 'Candidate Joined (Closed - Won)' ? candidate.stage_updated_at : '');
  return candidate.timestamp || candidate.created_at || candidate.stage_updated_at;
}

function formatDateTime(value) {
  const date = parseDateValue(value);
  if (!date) return 'Not recorded';
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

function formatDuration(startValue, endValue) {
  const start = parseDateValue(startValue);
  const end = parseDateValue(endValue) || new Date();
  if (!start) return '';
  const diffMs = Math.max(0, end.getTime() - start.getTime());
  const diffMinutes = Math.floor(diffMs / 60000);
  if (diffMinutes < 1) return '< 1 min';
  if (diffMinutes < 60) return `${diffMinutes}m`;
  const diffHours = Math.floor(diffMinutes / 60);
  const remMinutes = diffMinutes % 60;
  if (diffHours < 24) return remMinutes ? `${diffHours}h ${remMinutes}m` : `${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  return remHours ? `${diffDays}d ${remHours}h` : `${diffDays}d`;
}

function getStageTimestamp(record, stage) {
  return (record.stage_timestamps || {})[stage] || {};
}

function ensureStageTimestamp(record, stage, timestamp = nowIso()) {
  record.stage_timestamps = record.stage_timestamps || {};
  const stamp = record.stage_timestamps[stage] || {};
  stamp.entered_at = toIsoDateTime(stamp.entered_at || timestamp) || timestamp;
  record.stage_timestamps[stage] = stamp;
  return stamp;
}

function moveRecordToStage(record, nextStage, fallbackStage, actionNotes = '') {
  const movedAt = nowIso();
  const currentStage = record.stage || fallbackStage;
  if (currentStage) {
    const currentStamp = ensureStageTimestamp(record, currentStage, record.stage_updated_at || record.timestamp || movedAt);
    if (currentStage !== nextStage) {
      currentStamp.completed_at = movedAt;
      record.stage_history = record.stage_history || [];
      record.stage_history.push({
        stage: currentStage,
        to_stage: nextStage,
        entered_at: currentStamp.entered_at,
        exited_at: movedAt,
        completed_at: movedAt,
        duration: formatDuration(currentStamp.entered_at, movedAt),
        notes: actionNotes || ''
      });
    }
  }
  record.stage = nextStage;
  record.stage_updated_at = movedAt;
  record.stage_timestamps = record.stage_timestamps || {};
  record.stage_timestamps[nextStage] = {
    entered_at: movedAt,
    completed_at: ''
  };
}

function renderStageTimeline(record, stageList) {
  return `<div class="stage-timeline">${stageList.map(stage => {
    const stamp = getStageTimestamp(record, stage);
    const isCurrent = record.stage === stage;
    const isDone = Boolean(stamp.completed_at);
    if (!stamp.entered_at && !stamp.completed_at && !isCurrent) return '';
    return `<div class="timeline-step ${isCurrent ? 'active' : ''} ${isDone ? 'done' : ''}">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${escapeHtml(stage)}</strong>
        ${isDone ? '<span style="font-size:10px; color:#287b64; font-weight:700;">✓ Completed</span>' : isCurrent ? '<span style="font-size:10px; color:var(--green); font-weight:700;">▶ In Progress</span>' : ''}
      </div>
      <small>📅 Started: <b>${formatDateTime(stamp.entered_at)}</b></small>
      ${stamp.completed_at ? `<small>⏱️ Sent to Next: <b>${formatDateTime(stamp.completed_at)}</b> (Took ${formatDuration(stamp.entered_at, stamp.completed_at)})</small>` : isCurrent ? `<small style="color:#b45309;">⌛ In Progress: <b>${formatDuration(stamp.entered_at)}</b></small>` : ''}
    </div>`;
  }).join('')}</div>`;
}

function openStepHistoryModal(type, id) {
  const isVacancy = type === 'vacancy';
  const item = isVacancy ? data.vacancies.find(v => v.id === id) : data.candidates.find(c => c.id === id);
  if (!item) return;

  const title = isVacancy ? `${item.title} (${item.id})` : `${item.name} (${item.id})`;
  const subtitle = isVacancy ? `${item.department} · ${item.location}` : `${item.role} · ${item.location || 'Showroom'}`;
  const currentStage = isVacancy ? getVacancyStage(item) : item.stage;
  const currentStamp = getStageTimestamp(item, currentStage);
  const stageList = isVacancy ? vacancyStages : stages;
  const history = item.stage_history || [];

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';

  const rows = [];
  history.forEach((entry, idx) => {
    rows.push({
      stepNum: idx + 1,
      stage: entry.stage,
      entered_at: entry.entered_at,
      completed_at: entry.completed_at || entry.exited_at,
      duration: entry.duration || formatDuration(entry.entered_at, entry.completed_at || entry.exited_at),
      status: 'Completed',
      notes: entry.notes || (entry.to_stage ? `Sent to ${entry.to_stage}` : '')
    });
  });

  rows.push({
    stepNum: rows.length + 1,
    stage: currentStage,
    entered_at: currentStamp.entered_at || item.stage_updated_at || item.timestamp,
    completed_at: currentStamp.completed_at || '',
    duration: formatDuration(currentStamp.entered_at || item.stage_updated_at || item.timestamp),
    status: currentStamp.completed_at ? 'Completed' : 'In Progress (Active)',
    notes: currentStamp.completed_at ? 'Stage finished' : 'Current active stage'
  });

  modal.innerHTML = `
    <section class="modal history-modal">
      <button type="button" class="modal-close">×</button>
      <div class="profile-heading" style="margin-bottom: 18px;">
        <div class="brand-mark" style="width:40px; height:40px; font-size:16px; background:var(--green); color:#fff; display:flex; align-items:center; justify-content:center; border-radius:8px;">🕒</div>
        <div>
          <span class="section-kicker">${isVacancy ? 'VACANCY' : 'CANDIDATE'} STEP TIMELINE & AUDIT LOG</span>
          <h2 style="font-size:22px; margin:2px 0;">${escapeHtml(title)}</h2>
          <p style="margin:0; color:var(--muted); font-size:12px;">${escapeHtml(subtitle)}</p>
        </div>
      </div>

      <div style="display:flex; gap:15px; margin-bottom:20px; background:#f3f8f5; border:1px solid #dcebe4; border-radius:8px; padding:12px 16px; flex-wrap:wrap;">
        <div style="flex:1; min-width:140px;">
          <span style="font-size:11px; color:var(--muted); display:block;">Current Stage</span>
          <strong style="color:var(--green); font-size:14px;">${escapeHtml(currentStage)}</strong>
        </div>
        <div style="flex:1; min-width:140px;">
          <span style="font-size:11px; color:var(--muted); display:block;">Stage Started</span>
          <strong style="color:var(--ink); font-size:13px;">${formatDateTime(currentStamp.entered_at || item.stage_updated_at || item.timestamp)}</strong>
        </div>
        <div style="flex:1; min-width:140px;">
          <span style="font-size:11px; color:var(--muted); display:block;">Time in this Stage</span>
          <strong style="color:#b45309; font-size:13px;">${formatDuration(currentStamp.entered_at || item.stage_updated_at || item.timestamp)}</strong>
        </div>
      </div>

      <div class="detail-section">
        <h3 style="font-size:14px; margin-bottom:10px;">Step-by-Step Transition Log (Date & Time)</h3>
        <table class="history-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr style="background:#f8faf9; border-bottom:1px solid #e1e8e5; text-align:left;">
              <th style="padding:10px 12px; width:40px;">#</th>
              <th style="padding:10px 12px;">Step / Stage</th>
              <th style="padding:10px 12px;">Step Started</th>
              <th style="padding:10px 12px;">Sent to Next Step</th>
              <th style="padding:10px 12px;">Duration</th>
              <th style="padding:10px 12px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(r => `
              <tr style="border-bottom:1px solid #edf2f0;">
                <td style="padding:10px 12px; font-weight:700; color:var(--muted);">${r.stepNum}</td>
                <td style="padding:10px 12px;">
                  <strong style="color:var(--ink);">${escapeHtml(r.stage)}</strong>
                  ${r.notes ? `<small style="display:block; color:var(--muted); font-size:11px; margin-top:2px;">${escapeHtml(r.notes)}</small>` : ''}
                </td>
                <td style="padding:10px 12px; color:#2d3748;">
                  ${formatDateTime(r.entered_at)}
                </td>
                <td style="padding:10px 12px; color:#2d3748;">
                  ${r.completed_at ? formatDateTime(r.completed_at) : '<span style="color:#8a9993;">In Progress</span>'}
                </td>
                <td style="padding:10px 12px; font-weight:600; color:#319795;">
                  ${r.duration || '< 1 min'}
                </td>
                <td style="padding:10px 12px;">
                  <span class="status ${r.status === 'Completed' ? 'filled' : 'active'}" style="font-size:11px; padding:3px 8px; border-radius:12px; white-space:nowrap;">
                    ${r.status === 'Completed' ? '✓ Completed' : '▶ Active'}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="detail-section" style="margin-top:22px;">
        <h3 style="font-size:14px; margin-bottom:10px;">Full Workflow Stepper</h3>
        ${renderStageTimeline(item, stageList)}
      </div>

      <div style="margin-top:24px; text-align:right;">
        <button type="button" class="primary modal-close-btn" style="padding:8px 22px;">Close</button>
      </div>
    </section>
  `;

  document.body.append(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').onclick = close;
  modal.querySelector('.modal-close-btn').onclick = close;
  modal.onclick = e => { if (e.target === modal) close(); };
}

function applyVacancyFilters(list, filter) {
  return list.filter(vacancy => {
    if (filter.department && !sameFilterValue(vacancy.department, filter.department)) return false;
    if (filter.location && !sameFilterValue(vacancy.location, filter.location)) return false;
    if (filter.priority && !sameFilterValue(vacancy.priority, filter.priority)) return false;
    if (filter.owner && !sameFilterValue(vacancy.owner, filter.owner)) return false;
    if (filter.status && !sameFilterValue(vacancy.status, filter.status)) return false;
    return matchesDateRange(getVacancyDate(vacancy, filter.dateField), filter.from, filter.to);
  });
}

function applyCandidateFilters(list, filter) {
  return list.filter(candidate => {
    const vacancy = linkedVacancy(candidate);
    const screeningStatus = candidate.screening_status || 'Pending Review';
    if (filter.department && !sameFilterValue(vacancy.department, filter.department)) return false;
    if (filter.priority && !sameFilterValue(vacancy.priority, filter.priority)) return false;
    if (filter.owner && !sameFilterValue(vacancy.owner, filter.owner)) return false;
    if (filter.status && !sameFilterValue(vacancy.status, filter.status)) return false;
    if (filter.role && !sameFilterValue(candidate.role, filter.role)) return false;
    if (filter.source && !sameFilterValue(candidate.source, filter.source)) return false;
    if (filter.location && !sameFilterValue(candidate.location, filter.location) && !sameFilterValue(vacancy.location, filter.location)) return false;
    if (filter.screening_status && !sameFilterValue(screeningStatus, filter.screening_status)) return false;
    return matchesDateRange(getCandidateDate(candidate, filter.dateField), filter.from, filter.to);
  });
}

function renderSelectFilter(filterKey, label, options, placeholder, selectedValue) {
  return `<label>${label}<select class="filter-control" data-filter-key="${filterKey}"><option value="">${placeholder}</option>${options.map(option => `<option value="${escapeHtml(option)}" ${sameFilterValue(selectedValue, option) ? 'selected' : ''}>${escapeHtml(option)}</option>`).join('')}</select></label>`;
}

function renderFilterPanel(key, settings) {
  const filter = filters[key];
  const candidateRoles = uniqueValues(data.candidates.map(candidate => candidate.role));
  const vacancyTitles = uniqueValues(data.vacancies.map(vacancy => vacancy.title));
  const sourceOptions = uniqueValues([...data.candidates.map(candidate => candidate.source), 'Naukri', 'Indeed', 'Referral', 'Consultant', 'Walk-in', 'Website', 'LinkedIn', 'Other']);
  const fields = [
    `<label>Date By<select class="filter-control" data-filter-key="dateField">${settings.dateOptions.map(option => `<option value="${option.value}" ${filter.dateField === option.value ? 'selected' : ''}>${option.label}</option>`).join('')}</select></label>`,
    `<label>From<input type="date" class="filter-control" data-filter-key="from" value="${filter.from}"></label>`,
    `<label>To<input type="date" class="filter-control" data-filter-key="to" value="${filter.to}"></label>`
  ];
  if (settings.department) fields.push(renderSelectFilter('department', 'Department', departments, 'All departments', filter.department));
  if (settings.location) fields.push(renderSelectFilter('location', 'Location', uniqueValues([...locations, ...data.candidates.map(candidate => candidate.location)]), 'All locations', filter.location));
  if (settings.priority) fields.push(renderSelectFilter('priority', 'Priority', priorities, 'All priorities', filter.priority));
  if (settings.owner) fields.push(renderSelectFilter('owner', 'Owner', uniqueValues([...managers, ...data.vacancies.map(vacancy => vacancy.owner)]), 'All owners', filter.owner));
  if (settings.status) fields.push(renderSelectFilter('status', 'Status', vacancyStatuses, 'All statuses', filter.status));
  if (settings.role) fields.push(renderSelectFilter('role', 'Role', uniqueValues([...vacancyTitles, ...candidateRoles]), 'All roles', filter.role));
  if (settings.source) fields.push(renderSelectFilter('source', 'Source', sourceOptions, 'All sources', filter.source));
  if (settings.screeningStatus) fields.push(renderSelectFilter('screening_status', 'Screening', ['Pending Review', 'Shortlisted', 'Rejected', 'Hold'], 'All screening', filter.screening_status));
  const activeCount = Object.entries(filter).filter(([field, value]) => field !== 'dateField' && value).length;
  return `<section class="filter-panel" data-filter-view="${key}">
    <div class="filter-head"><div><span class="section-kicker">FILTERS</span><strong>${settings.title}</strong></div><button type="button" class="text-button filter-reset" data-filter-reset="${key}">Reset${activeCount ? ` (${activeCount})` : ''}</button></div>
    <div class="filter-grid">${fields.join('')}</div>
  </section>`;
}

function save() {
  fetch(`${API_BASE}/api/sync`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error('Sync failed', err));
}

function render() {
  const main = document.querySelector('main');
  if (activeView === 'Dashboard') {
    const dashboardVacancies = applyVacancyFilters(data.vacancies, filters.dashboard);
    const dashboardCandidates = applyCandidateFilters(data.candidates, filters.dashboard);
    main.innerHTML = dashboard(dashboardVacancies, dashboardCandidates);
  } else if (activeView === 'Vacancies') {
    main.innerHTML = vacancies();
  } else if (activeView === 'Candidates' || activeView === 'CV Screening') {
    const filterKey = activeView === 'CV Screening' ? 'screening' : 'candidates';
    let list = applyCandidateFilters(data.candidates, filters[filterKey]);
    if (search) list = list.filter(c => `${c.name || ''} ${c.phone || ''} ${c.role || ''}`.toLowerCase().includes(search.toLowerCase()));
    main.innerHTML = candidates(list);
  } else if (activeView === 'Reports') {
    main.innerHTML = reports();
  }
  
  document.querySelectorAll('.nav-item').forEach(a => {
    a.classList.toggle('active', a.dataset.view === activeView || (a.dataset.view === 'Candidates' && activeView === 'CV Screening'));
  });
  
  bindEvents();
}


function dashboard(vacancyList = data.vacancies, candidateList = data.candidates) {
  const openRoles = vacancyList.filter(v => v.status === 'Open');
  const open = openRoles.length;
  const averageDays = openRoles.length ? Math.round(openRoles.reduce((sum, v) => sum + daysOpen(v), 0) / openRoles.length) : 0;
  const activeList = activeCandidates(candidateList);
  const overdue = activeList.filter(isStageOverdue);
  const latestActivity = [...candidateList].sort((a,b) => new Date(b.stage_updated_at || 0) - new Date(a.stage_updated_at || 0)).slice(0, 4);
  return `${renderFilterPanel('dashboard', { title: 'Dashboard data view', dateOptions: commonDateOptions, department: true, location: true, priority: true, owner: true, source: true, status: true })}
  <section class="welcome"><div><span class="section-kicker">OPERATIONS OVERVIEW</span><p>Live recruitment control room with workflow ownership and TAT tracking.</p></div><button class="primary" data-action="new-vacancy">+ New vacancy</button></section><div class="stats"><div class="stat"><span>Open vacancies</span><strong>${open}</strong><em>Filtered live requisitions</em></div><div class="stat"><span>Total applications</span><strong>${candidateList.length}</strong><em>Filtered candidate records</em></div><div class="stat"><span>In active pipeline</span><strong>${activeList.length}</strong><em>Across ${open} open roles</em></div><div class="stat"><span>Average days open</span><strong>${averageDays}</strong><em class="${averageDays > 30 ? 'warn' : 'up'}">${averageDays > 30 ? 'Needs attention' : 'Within control'}</em></div></div><div class="grid-two"><section class="panel pipeline"><div class="panel-head"><div><span class="section-kicker">LIVE PIPELINE</span><h3>Candidate movement</h3></div><button class="text-button" data-view="Candidates">View all →</button></div><div class="pipeline-bars">${stages.slice(1, 8).map(stage => `<div class="bar-row"><span>${stage}</span><div class="bar-track"><div class="bar-fill ${stageClass(stage)}" style="width:${Math.min(100, Math.max(8, countStage(stage, candidateList) * 14))}%"></div></div><strong>${countStage(stage, candidateList)}</strong></div>`).join('')}</div></section><section class="panel urgent"><div class="panel-head"><div><span class="section-kicker">TAT WATCHLIST</span><h3>${overdue.length} overdue candidate${overdue.length === 1 ? '' : 's'}</h3></div><button class="text-button" data-view="Candidates">Take action →</button></div>${overdue.slice(0, 5).map(item => `<div class="mini-row"><span class="priority urgent"></span><div><strong>${item.name}</strong><small>${item.stage} · ${daysInStage(item)} days · Owner: ${stageMeta(item).owner}</small></div><b>${item.next_action || 'Follow up'}</b></div>`).join('') || '<p class="empty-note">No candidate stage is beyond its target TAT.</p>'}</section></div><section class="panel activity"><div class="panel-head"><div><span class="section-kicker">RECENT ACTIVITY</span><h3>Latest candidate updates</h3></div><button class="text-button" data-view="Candidates">Open tracker →</button></div>${latestActivity.map(item => `<div class="activity-row"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</span><div><strong>${item.name}</strong><span>${item.next_action || `Applied for ${item.role}`}</span></div><span class="stage ${stageClass(item.stage)}">${item.stage}</span><time>${daysInStage(item)}d</time></div>`).join('') || '<p class="empty-note">No candidate activity in the selected filters.</p>'}</section>`;
}

function renderVacancyWorkflowTabs(items) {
  if (!vacancyStages.includes(activeVacancyStage)) activeVacancyStage = 'Manpower Requirement Raised';
  return `<div class="vacancy-workflow-tabs" role="tablist" aria-label="Vacancy workflow stages">
    ${vacancyStages.map((stage, index) => {
      const count = items.filter(item => getVacancyStage(item) === stage).length;
      const isActive = activeVacancyStage === stage;
      return `<button type="button" role="tab" aria-selected="${isActive}" title="${stage}" class="vacancy-workflow-tab ${isActive ? 'active' : ''}" data-stage="${stage}">
        <span class="stage-number">${index + 1}</span><span>${vacancyStageLabels[stage] || stage}</span><b>${count}</b>
      </button>`;
    }).join('')}
  </div>`;
}

function vacancies() {
  const filtered = applyVacancyFilters(data.vacancies, filters.vacancies);
  if (!vacancyStages.includes(activeVacancyStage)) activeVacancyStage = 'Manpower Requirement Raised';
  const rows = filtered.filter(item => getVacancyStage(item) === activeVacancyStage);
  const activeWorkflow = vacancyStageMeta(activeVacancyStage);

  return `<div class="page-intro"><div><span class="section-kicker">VACANCY FMS</span><p>Master Control Room: Track every job opening from requisition to closure.</p></div><button class="primary" data-action="new-vacancy">+ Add vacancy</button></div>
  ${renderFilterPanel('vacancies', { title: 'Vacancy data view', dateOptions: vacancyDateOptions, department: true, location: true, priority: true, owner: true, status: true })}
  <section class="toolbar vacancy-toolbar">
    ${renderVacancyWorkflowTabs(filtered)}
  </section>
  <section class="workflow-card vacancy-workflow-summary">
    <span>Active tab</span><strong>${activeVacancyStage}</strong>
    <span>Responsible</span><strong>${activeWorkflow.owner}</strong>
    <span>Output</span><strong>${activeWorkflow.output}${activeWorkflow.tat === null ? '' : ` · TAT ${activeWorkflow.tat === 0 ? 'same day' : activeWorkflow.tat + 'd'}`}</strong>
  </section>
  <section class="table-panel">
    <table>
      <thead>
        <tr>
          <th>Vacancy Details</th>
          <th>Owner & Dept</th>
          <th>Dates</th>
          <th>Pipeline Metrics</th>
          <th>Workflow Step</th>
          <th>Step Action</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(item => {
          const totalC = data.candidates.filter(c => c.requirement_id === item.id || c.role === item.title).length;
          const interviewC = data.candidates.filter(c => (c.requirement_id === item.id || c.role === item.title) && c.stage.includes('Interview')).length;
          const offerC = data.candidates.filter(c => (c.requirement_id === item.id || c.role === item.title) && c.stage.includes('Offer')).length;
          const currentStage = getVacancyStage(item);
          const workflow = vacancyStageMeta(currentStage);
          const upcomingStage = nextVacancyStage(currentStage);
          const currentStamp = getStageTimestamp(item, currentStage);
          return `<tr>
            <td><strong>${item.title}</strong><small>${item.id} · ${item.location}</small>
              <span class="priority-label ${priorityClass(item.priority)}" style="margin-top:6px">${item.priority}</span>
            </td>
            <td><strong>${item.owner}</strong><small>${item.department}</small></td>
            <td><small>Opened: ${item.openedOn || '2026-09-02'}</small><small>Deadline: ${item.deadline}</small>${item.filledOn ? `<small>Filled: ${item.filledOn}</small>` : ''}</td>
            <td>
              <div style="display:flex;gap:10px;font-size:10px;">
                <div style="text-align:center;"><b>${totalC}</b><br><span style="color:#8a9993">Sourced</span></div>
                <div style="text-align:center;"><b>${interviewC}</b><br><span style="color:#8a9993">Interview</span></div>
                <div style="text-align:center;"><b>${offerC}</b><br><span style="color:#8a9993">Offers</span></div>
              </div>
            </td>
            <td class="vacancy-stage-cell">
              <strong>${currentStage}</strong>
              <small class="workflow-note"><b>${workflow.owner}</b><span>${workflow.output}${workflow.tat === null ? '' : ` · TAT ${workflow.tat === 0 ? 'same day' : workflow.tat + 'd'}`}</span></small>
              <div class="step-timestamp-badge" style="margin:6px 0;">
                <span class="pulse-dot"></span>
                <span>Active Step Started: <b>${formatDateTime(currentStamp.entered_at || item.stage_updated_at || item.timestamp)}</b></span>
              </div>
              <button type="button" class="text-button open-step-history" data-type="vacancy" data-id="${item.id}" style="padding:0; font-size:11px; margin-bottom:8px; color:var(--green); text-align:left; font-weight:700; cursor:pointer; display:block;">
                🕒 Step Timestamps & Log (${(item.stage_history || []).length} completed) →
              </button>
              ${renderStageTimeline(item, vacancyStages)}
            </td>
            <td>
              ${upcomingStage ? `<div class="vacancy-step-action"><button type="button" class="vacancy-complete-btn" data-id="${item.id}" data-next="${upcomingStage}">Complete Step</button><small>Next: ${vacancyStageLabels[upcomingStage] || upcomingStage}</small></div>` : '<span class="status filled">Workflow complete</span>'}
            </td>
            <td>
              <select class="vacancy-status-select" data-id="${item.id}">
                ${vacancyStatuses.map(s => `<option ${item.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>`;
        }).join('')}
        ${rows.length === 0 ? `<tr><td colspan="7" style="text-align:center; padding:40px; color:#9aa6a2;">No vacancies in this workflow stage</td></tr>` : ''}
      </tbody>
    </table>
  </section>`
}

function renderCandidateStageCell(candidate) {
  const stamp = getStageTimestamp(candidate, candidate.stage);
  const historyCount = (candidate.stage_history || []).length;
  return `<td>
    <strong>${stageMeta(candidate).owner}</strong>
    <small>${stageMeta(candidate).output}</small>
    <div class="step-timestamp-badge" style="margin:4px 0;">
      <span class="pulse-dot"></span>
      <span>Step Started: <b>${formatDateTime(stamp.entered_at || candidate.stage_updated_at || candidate.timestamp)}</b></span>
    </div>
    <button type="button" class="text-button open-step-history" data-type="candidate" data-id="${candidate.id}" style="padding:0; font-size:11px; margin-top:3px; color:var(--green); text-align:left; font-weight:700; cursor:pointer; display:block;">
      🕒 Step Timestamps & Log (${historyCount} completed) →
    </button>
  </td>`;
}

function candidates(list) { 
  if (activeView === 'CV Screening') {
    const rows = filters.screening.screening_status ? list : list.filter(x => x.screening_status === 'Pending Review' || x.screening_status === 'Hold' || !x.screening_status);
    const screeningSummary = filters.screening.screening_status ? `${rows.length} ${filters.screening.screening_status} application${rows.length === 1 ? '' : 's'}` : `${rows.length} applications pending review`;
    return `<div class="page-intro"><div><span class="section-kicker">CV SCREENING & INTAKE</span><p>Staging Area · ${screeningSummary}</p></div><button class="primary" data-action="new-candidate">+ Add application</button></div>
    ${renderFilterPanel('screening', { title: 'CV screening view', dateOptions: candidateDateOptions, department: true, location: true, priority: true, owner: true, role: true, source: true, screeningStatus: true })}
    <section class="table-panel"><table><thead><tr><th>Candidate</th><th>Applied role</th><th>Source</th><th>Experience</th><th>Expected CTC</th><th>Screening Action</th></tr></thead><tbody>${rows.map(item => `<tr><td><button class="candidate-profile-link" data-action="view-candidate" data-id="${item.id}"><div class="candidate-cell"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>${item.name}</strong><small>${item.id} · ${item.location}</small><small>Applied: ${formatDateTime(item.timestamp || getStageTimestamp(item, 'Application Received (New)').entered_at)}</small></div></div></button></td><td>${item.role}</td><td>${item.source}</td><td>${item.experience}</td><td>₹ ${item.expected}</td><td><select class="screening-select" data-id="${item.id}">
      <option ${item.screening_status === 'Pending Review' || !item.screening_status ? 'selected' : ''}>Pending Review</option>
      <option ${item.screening_status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
      <option ${item.screening_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
      <option ${item.screening_status === 'Hold' ? 'selected' : ''}>Hold</option>
    </select></td></tr>`).join('')}${rows.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:40px; color:#9aa6a2;">No applications match the selected filters</td></tr>` : ''}</tbody></table></section>`;
  } else {
    // Pipeline View
    // Filter to only shortlisted candidates first
    const shortlisted = list.filter(x => x.screening_status === 'Shortlisted');
    
    // Group into Active Pipeline tabs
    const tabStages = stages.filter(s => s !== 'Application Received (New)');
    
    // Auto-select first tab if current is invalid
    if (!tabStages.includes(activePipelineStage)) activePipelineStage = 'CV Screened & Shortlisted';
    
    // Filter rows for the active tab
    const rows = shortlisted.filter(x => x.stage === activePipelineStage);
    
    // Build tabs HTML
    const tabsHtml = `<div class="pipeline-tabs" style="display:flex; gap:10px; margin-bottom:20px; overflow-x:auto; padding-bottom:10px;">
      ${tabStages.map(stage => {
        const count = shortlisted.filter(c => c.stage === stage).length;
        const isActive = stage === activePipelineStage;
        return `<button class="tab-btn ${isActive ? 'active' : ''}" data-stage="${stage}" style="padding:10px 16px; border:none; background:${isActive ? '#287b64' : '#fff'}; color:${isActive ? '#fff' : '#71807d'}; border-radius:6px; font-weight:600; cursor:pointer; box-shadow:0 1px 2px rgba(0,0,0,0.05); white-space:nowrap;">
          ${stage} <span style="background:${isActive ? 'rgba(255,255,255,0.2)' : '#f0f4f2'}; padding:2px 8px; border-radius:12px; margin-left:6px; font-size:12px;">${count}</span>
        </button>`;
      }).join('')}
    </div>`;

    return `<div class="page-intro"><div><span class="section-kicker">TALENT DATABASE</span><p>Candidate Pipeline Tracker · ${shortlisted.length} shortlisted candidates</p></div></div>
    ${renderFilterPanel('candidates', { title: 'Candidate pipeline view', dateOptions: candidateDateOptions, department: true, location: true, priority: true, owner: true, role: true, source: true })}
    ${tabsHtml}
    <section class="table-panel"><table><thead><tr><th>Candidate</th><th>Applied role</th><th>Stage control</th><th>Next action</th><th>Expected CTC</th><th>Action</th></tr></thead><tbody>${rows.map(item => `<tr><td><button class="candidate-profile-link" data-action="view-candidate" data-id="${item.id}"><div class="candidate-cell"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>${item.name}</strong><small>${item.id} · ${item.location}</small><small>Applied: ${formatDateTime(item.timestamp || getStageTimestamp(item, 'Application Received (New)').entered_at)}</small><small class="stage-age ${isStageOverdue(item) ? 'overdue' : ''}">${daysInStage(item)} day${daysInStage(item) === 1 ? '' : 's'} in stage${isStageOverdue(item) ? ' · TAT overdue' : ''}</small></div></div></button></td><td>${item.role}<small>${item.source} · ${item.experience}</small></td>${renderCandidateStageCell(item)}<td>${item.next_action || 'Update candidate'}${item.next_action_date ? `<small>Due ${item.next_action_date}</small>` : ''}</td><td>₹ ${item.expected}</td>
    <td>
      ${renderActionButtons(item)}
    </td></tr>`).join('')}
    ${rows.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:40px; color:#9aa6a2;">No candidates in this stage</td></tr>` : ''}
    </tbody></table></section>`;
  }
}

function renderActionButtons(candidate) {
  const currentIndex = stages.indexOf(candidate.stage);
  const nextStage = currentIndex >= 0 && currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
  
  let html = `<div style="display:flex; gap:8px;">`;
  
  if (['Candidate Joined (Closed - Won)', 'Rejected', 'Dropped / Ghosted'].includes(candidate.stage)) {
    return `<span style="color:#71807d; font-size:13px; font-weight:600;">${candidate.stage}</span>`;
  }

  if (nextStage) {
    html += `<button class="advance-btn" data-id="${candidate.id}" data-next="${nextStage}" style="background:#287b64; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer;">Move to ${nextStage.split(' ')[0]}</button>`;
  }
  
  html += `<button class="hold-btn" data-id="${candidate.id}" data-next="On Hold" style="background:#fff8e8; color:#9b6a1d; border:1px solid #f6e5bd; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer;">Hold</button>`;
  html += `<button class="drop-btn" data-id="${candidate.id}" data-next="Dropped / Ghosted" style="background:#f4f5f4; color:#71807d; border:1px solid #dfe7e2; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer;">Drop</button>`;
  html += `<button class="reject-btn" data-id="${candidate.id}" style="background:#fef2f2; color:#e53e3e; border:1px solid #fee2e2; padding:6px 12px; border-radius:4px; font-size:12px; font-weight:600; cursor:pointer;">Reject</button>`;
  html += `</div>`;
  return html;
}


function reports() {
  const reportVacancies = applyVacancyFilters(data.vacancies, filters.reports);
  const reportCandidates = applyCandidateFilters(data.candidates, filters.reports);
  const interviews = reportCandidates.filter(c => c.interview_date || c.interview_rating || ['Interview Completed (Under Evaluation)','Final Selection (HOD Approval)','Offer Released','Offer Accepted (Pre-Onboarding)','Candidate Joined (Closed - Won)'].includes(c.stage)).length;
  const offers = reportCandidates.filter(c => c.offer_date || ['Offer Released','Offer Accepted (Pre-Onboarding)','Candidate Joined (Closed - Won)'].includes(c.stage)).length;
  const joined = countStage('Candidate Joined (Closed - Won)', reportCandidates);
  const screened = reportCandidates.filter(c => c.screening_status && c.screening_status !== 'Pending Review').length;
  const overdue = activeCandidates(reportCandidates).filter(isStageOverdue).length;

  return `<div class="page-intro"><div><span class="section-kicker">FMS REPORTING</span><p>Recruitment performance at a glance.</p></div><button class="secondary" data-action="export">Download report ↓</button></div>
  ${renderFilterPanel('reports', { title: 'Report data view', dateOptions: commonDateOptions, department: true, location: true, priority: true, owner: true, source: true, status: true })}
  <div class="report-grid">
    <div class="report-card accent-card"><span>Selection rate</span><strong>${Math.round((joined / Math.max(1, reportCandidates.length)) * 100)}%</strong><small>Joined / filtered applicants</small></div>
    <div class="report-card"><span>Candidates screened</span><strong>${screened}</strong><small>${reportCandidates.length - screened} pending review</small></div>
    <div class="report-card"><span>Interviews / offers</span><strong>${interviews} / ${offers}</strong><small>Recorded workflow outcomes</small></div>
    <div class="report-card"><span>TAT overdue</span><strong>${overdue}</strong><small>Active candidates needing action</small></div>
  </div>
  <section class="panel report-table">
    <div class="panel-head"><div><span class="section-kicker">VACANCY REPORT</span><h3>Role-wise conversion</h3></div></div>
    <table>
      <thead><tr><th>Role</th><th>Applications</th><th>Shortlisted</th><th>Interviews</th><th>Joined</th><th>Days open</th></tr></thead>
      <tbody>${reportVacancies.map(v => {
        const cands = reportCandidates.filter(c => c.requirement_id === v.id || c.role === v.title);
        const apps = cands.length;
        const short = cands.filter(c => c.screening_status === 'Shortlisted').length;
        const ints = cands.filter(c => c.stage.includes('Interview') || c.stage.includes('Assessment')).length;
        const jo = cands.filter(c => c.stage.includes('Joined')).length;
        
        let days = 0;
        if(v.openedOn) {
          const start = new Date(v.openedOn);
          const end = v.filledOn ? new Date(v.filledOn) : new Date();
          days = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
        } else { days = daysOpen(v); }

        return `<tr><td><strong>${v.title}</strong></td><td>${apps}</td><td>${short}</td><td>${ints}</td><td>${jo}</td><td>${days}</td></tr>`;
      }).join('')}${reportVacancies.length === 0 ? `<tr><td colspan="6" style="text-align:center; padding:40px; color:#9aa6a2;">No report data matches the selected filters</td></tr>` : ''}</tbody>
    </table>
  </section>`
}


function bindEvents() {
  document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { activeView = button.dataset.view; render(); });
  document.querySelector('#search')?.addEventListener('input', event => { search = event.target.value; if (activeView === 'Candidates' || activeView === 'CV Screening') render(); });
  document.querySelectorAll('.filter-control').forEach(control => control.onchange = event => {
    const panel = event.target.closest('[data-filter-view]');
    if (!panel) return;
    filters[panel.dataset.filterView][event.target.dataset.filterKey] = event.target.value;
    render();
  });
  document.querySelectorAll('.filter-reset').forEach(button => button.onclick = () => {
    const key = button.dataset.filterReset;
    filters[key] = { ...filterDefaults[key] };
    render();
  });
  document.querySelectorAll('.stage-select').forEach(select => select.onchange = event => openStageUpdate(event.target.dataset.id, event.target.value, event.target));
  document.querySelectorAll('.advance-btn').forEach(button => button.onclick = () => openStageUpdate(button.dataset.id, button.dataset.next));
  document.querySelectorAll('.hold-btn, .drop-btn').forEach(button => button.onclick = () => openStageUpdate(button.dataset.id, button.dataset.next));
  document.querySelectorAll('.reject-btn').forEach(button => button.onclick = () => openStageUpdate(button.dataset.id, 'Rejected'));
  document.querySelectorAll('.tab-btn').forEach(button => button.onclick = () => { activePipelineStage = button.dataset.stage; render(); });
  document.querySelectorAll('.screening-select').forEach(select => select.onchange = event => { 
    const candidate = data.candidates.find(item => item.id === event.target.dataset.id); 
    const screeningStatus = event.target.value;
    if (screeningStatus === 'Rejected') {
      openStageUpdate(candidate.id, 'Rejected', select, () => { candidate.screening_status = 'Rejected'; });
      return;
    }
    candidate.screening_status = screeningStatus; 
    if (screeningStatus === 'Shortlisted') {
      moveRecordToStage(candidate, 'CV Screened & Shortlisted', 'Application Received (New)');
      alert(candidate.name + ' has been shortlisted and moved to the Candidate Pipeline.');
    } else if (screeningStatus === 'Hold') {
      moveRecordToStage(candidate, 'On Hold', 'Application Received (New)');
    }
    save(); render(); 
  });
  document.querySelectorAll('.vacancy-workflow-tab').forEach(button => button.onclick = () => { activeVacancyStage = button.dataset.stage; render(); });
  document.querySelectorAll('.vacancy-complete-btn').forEach(button => button.onclick = () => updateVacancyStage(button.dataset.id, button.dataset.next));
  document.querySelectorAll('.vacancy-status-select').forEach(select => select.onchange = event => { 
    const v = data.vacancies.find(item => item.id === event.target.dataset.id); 
    if (!v) return;
    v.status = event.target.value;
    if (v.status === 'Closed' && getVacancyStage(v) !== 'Vacancy Closed') {
      updateVacancyStage(v.id, 'Vacancy Closed');
      return;
    }
    save(); render(); 
  });
  document.querySelectorAll('[data-action="new-vacancy"]').forEach(button => button.onclick = () => openModal('vacancy'));
  document.querySelectorAll('[data-action="new-candidate"]').forEach(button => button.onclick = () => openModal('candidate'));
  document.querySelectorAll('[data-action="view-candidate"]').forEach(button => button.onclick = () => openCandidateDetails(button.dataset.id));
  document.querySelectorAll('.open-step-history').forEach(button => button.onclick = event => {
    event.stopPropagation();
    openStepHistoryModal(button.dataset.type, button.dataset.id);
  });
  document.querySelector('[data-action="export"]')?.addEventListener('click', () => alert('Report ready. Connect this action to your preferred export format.'));
}

function openCandidateDetails(candidateId) {
  const candidate = data.candidates.find(item => item.id === candidateId);
  if (!candidate) return;

  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  const detail = (label, value) => `<div class="detail-item"><span>${label}</span><strong>${value || 'Not provided'}</strong></div>`;
  modal.innerHTML = `<section class="modal profile-modal"><button type="button" class="modal-close">×</button><div class="profile-heading"><span class="initials profile-avatar">${candidate.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</span><div><span class="section-kicker">CANDIDATE PROFILE</span><h2>${candidate.name}</h2><p>${candidate.id}</p></div></div><div class="profile-status"><span>Screening: <b>${candidate.screening_status || 'Pending Review'}</b></span><span>Stage: <b>${candidate.stage || 'CV Screening'}</b></span></div><div class="detail-section"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;"><h3 style="margin:0;">Stage timestamps & Step Movement History</h3><button type="button" class="text-button open-step-history" data-type="candidate" data-id="${candidate.id}" style="font-size:11px; font-weight:700; color:var(--green); cursor:pointer;">Full Audit Log ↗</button></div>${renderStageTimeline(candidate, stages)}</div><div class="detail-section"><h3>Contact & personal details</h3><div class="detail-grid">${detail('Phone number', candidate.phone)}${detail('Email ID', candidate.email)}${detail('Date of birth', candidate.dob)}${detail('Gender', candidate.gender)}${detail('Marital status', candidate.marital_status)}${detail('Current location', candidate.location)}${detail('Residential address', candidate.address)}</div></div><div class="detail-section"><h3>Application details</h3><div class="detail-grid">${detail('Applied position', candidate.role)}${detail('Requirement ID', candidate.requirement_id)}${detail('Source / platform', candidate.source)}${detail('Referred by', candidate.referrer)}${detail('Current salary', candidate.current_ctc ? `₹ ${candidate.current_ctc}` : '')}${detail('Expected salary', candidate.expected ? `₹ ${candidate.expected}` : '')}${detail('Experience', candidate.experience)}${detail('Notice period', candidate.notice_period ? `${candidate.notice_period} days` : '')}${detail('Top skills', candidate.skills)}${detail('CV / Resume', candidate.cv_url ? `<a href="${candidate.cv_url}" target="_blank" style="color:var(--green); font-weight:600; text-decoration:underline;">View CV / Resume ↗</a>` : 'Not uploaded')}</div></div><div class="detail-section"><h3>Screening notes</h3><p class="profile-notes">${candidate.remarks || 'No screening notes added yet.'}</p></div><button type="button" class="primary profile-close">Close profile</button></section>`;
  document.body.append(modal);
  const close = () => modal.remove();
  modal.querySelector('.modal-close').onclick = close;
  modal.querySelector('.profile-close').onclick = close;
  modal.onclick = event => { if (event.target === modal) close(); };
}

function openStageUpdate(candidateId, nextStage, select, onSave) {
  const candidate = data.candidates.find(item => item.id === candidateId);
  if (!candidate) return;
  const needsInterview = nextStage === 'Interview Scheduled';
  const needsEvaluation = nextStage === 'Interview Completed (Under Evaluation)';
  const needsOffer = nextStage === 'Offer Released';
  const needsJoining = nextStage === 'Offer Accepted (Pre-Onboarding)';
  const needsRejection = nextStage === 'Rejected';
  if (!needsInterview && !needsEvaluation && !needsOffer && !needsJoining && !needsRejection) {
    updateCandidateStage(candidate, nextStage);
    return;
  }
  const modal = document.createElement('div');
  modal.className = 'modal-backdrop';
  const fields = needsInterview ? '<label>Interview date<input type="date" name="interview_date" required></label><label>Interview time<input type="time" name="interview_time" required></label><label>Interviewer name<input name="interviewer" required></label>' : needsEvaluation ? '<label>Interview rating (out of 10)<input type="number" name="interview_rating" min="0" max="10" required></label><label>Interview remarks<textarea name="interview_remarks" rows="3" required></textarea></label>' : needsOffer ? '<label>Offer release date<input type="date" name="offer_date" required></label><label>Offered CTC<input type="number" name="offered_ctc" required></label>' : needsJoining ? '<label>Expected joining date<input type="date" name="joining_date" required></label>' : '<label>Reason for rejection<select name="rejection_reason" required><option value="">Select reason</option><option>High salary expectation</option><option>Lack of skills</option><option>Culture fit</option><option>Notice period</option><option>Other</option></select></label>';
  modal.innerHTML = `<form class="modal stage-update-modal"><button type="button" class="modal-close">×</button><span class="section-kicker">PIPELINE UPDATE</span><h2>${nextStage}</h2><p class="modal-subtitle">${candidate.name} · ${candidate.role}</p>${fields}<label>Next action<input name="next_action" value="${candidate.next_action || ''}" placeholder="e.g. Call candidate for confirmation"></label><label>Next action due date<input type="date" name="next_action_date" value="${candidate.next_action_date || ''}"></label><label>Additional remarks<textarea name="remarks" rows="2">${candidate.remarks || ''}</textarea></label><button class="primary" type="submit">Save stage update</button></form>`;
  document.body.append(modal);
  const close = () => { if (select) select.value = candidate.screening_status || candidate.stage; modal.remove(); };
  modal.querySelector('.modal-close').onclick = close;
  modal.querySelector('form').onsubmit = event => { event.preventDefault(); const values = new FormData(event.target); Object.assign(candidate, Object.fromEntries(values)); if (onSave) onSave(); updateCandidateStage(candidate, nextStage); modal.remove(); };
}

function updateCandidateStage(candidate, nextStage) {
  moveRecordToStage(candidate, nextStage, 'Application Received (New)');
  if (nextStage === 'Candidate Joined (Closed - Won)') {
    const vacancy = data.vacancies.find(item => item.id === candidate.requirement_id || item.title === candidate.role);
    if (vacancy) {
      moveRecordToStage(vacancy, 'Vacancy Closed', 'Manpower Requirement Raised');
      vacancy.status = 'Closed';
      vacancy.filledOn = new Date().toISOString().split('T')[0];
    }
  }
  save();
  render();
}

function updateVacancyStage(vacancyId, nextStage) {
  const vacancy = data.vacancies.find(item => item.id === vacancyId);
  if (!vacancy) return;
  moveRecordToStage(vacancy, nextStage, 'Manpower Requirement Raised');
  if (nextStage === 'Vacancy Closed') {
    vacancy.status = 'Closed';
    vacancy.filledOn = new Date().toISOString().split('T')[0];
  }
  activeVacancyStage = nextStage;
  save();
  render();
}


function openModal(type) {
    const vacancy = type === 'vacancy';
    const modal = document.createElement('div');
    modal.className = 'modal-backdrop';
    
    // Candidate fields HTML
    const candidateHtml = `
      <label>Requirement ID (Link to Vacancy)
        <select name="requirement_id" required>
          <option value="">Select an open vacancy...</option>
          ${data.vacancies.filter(v => v.status === 'Open').map(v => "<option value='" + v.id + "'>" + v.id + " - " + v.title + " (" + v.department + ")</option>").join('')}
        </select>
      </label>
      <label>Candidate ID<input value="CAN-${new Date().getFullYear()}-${String(data.candidates.length + 1).padStart(4, '0')}" disabled></label>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
        <label>Candidate Name<input name="name" required></label>
        <label>Gender<select name="gender"><option>Male</option><option>Female</option><option>Other</option></select></label>
        <label>Date of Birth<input type="date" name="dob"></label>
        <label>Mobile Number<input type="tel" name="phone" required></label>
        <label>Email ID<input type="email" name="email"></label>
        <label>Marital Status<select name="marital_status"><option>Single</option><option>Married</option><option>Other</option></select></label>
      </div>
      <label>Residential Address<textarea name="address" rows="2"></textarea></label>
      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
        <label>Current Location of Job<input name="location"></label>
        <label>Current Salary (CTC)<input type="number" name="current_ctc"></label>
        <label>Expected Salary<input type="number" name="expected_ctc"></label>
        <label>Notice Period (in days)<input type="number" name="notice_period"></label>
        <label>Total Working Experience (Years)<input type="number" step="0.1" name="experience_years"></label>
        <label>Platform applied through (Source)<select name="source"><option value="">Select (Optional)...</option><option>Apna</option><option>LinkedIn</option><option>Indeed</option><option>Naukri</option><option>Facebook</option><option>Referral</option><option>Consultant</option><option>Walk-in</option><option>Other</option></select></label>
      </div>
      <label>Top Skills<input name="skills" placeholder="e.g. Sales, Marketing, AutoCAD"></label>
      <label>Referred By / Consultant Name<input name="referrer"></label>
      <label>Attach CV/Resume<input type="file" name="cv" accept=".pdf,.doc,.docx"></label>
      <label>Any Other Information<textarea name="remarks" rows="2"></textarea></label>
    `;

    const vacancyHtml = `<label>Date of Opening<input value="${new Date().toISOString().split('T')[0]}" disabled></label><label>Position Code<input placeholder="(Autofill)" disabled></label><label>Job Title<select name="title">${positions.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Department<select name="department">${departments.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Location<select name="location">${locations.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Priority<select name="priority">${priorities.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Job Description<input type="file" name="jd" accept=".pdf,.doc,.docx"></label><label>Minimum Experience<select name="experience">${experiences.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Salary Range<select name="salary">${salaries.map(p => "<option>" + p + "</option>").join('')}</select></label><label>Deadline<input type="date" name="deadline" required></label><label>Employee Responsible To<select name="owner">${managers.map(p => "<option>" + p + "</option>").join('')}</select></label>`;

    modal.innerHTML = `<form class="modal"><button type="button" class="modal-close">×</button><span class="section-kicker">NEW RECORD</span><h2>${vacancy ? 'Create vacancy' : 'Add candidate'}</h2>${vacancy ? vacancyHtml : candidateHtml}<button class="primary" type="submit">Save record</button></form>`;
    
    document.body.append(modal);
    modal.querySelector('.modal-close').onclick = () => modal.remove();
    modal.querySelector('form').onsubmit = async event => {
      event.preventDefault();
      const submitBtn = event.target.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Uploading & Saving...';
      }
      const form = new FormData(event.target);
      if (vacancy) {
        let jd_url = '';
        const jdFile = form.get('jd');
        if (jdFile && jdFile.name && jdFile.size > 0) {
          const uploadData = new FormData();
          uploadData.append('file', jdFile);
          uploadData.append('folder', 'recruitment_fms/jds');
          try {
            const uploadRes = await fetch(`${API_BASE}/api/upload`, {
              method: 'POST',
              body: uploadData
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.url) jd_url = uploadJson.url;
          } catch (err) {
            console.error('JD upload error:', err);
          }
        }

        const createdAt = nowIso();
        data.vacancies.unshift({
          id: `${form.get('department').substring(0, 2).toUpperCase()}-${form.get('title').split(/[\s-]+/).filter(w => w).map(w => w[0]).join('').toUpperCase()}-${String(data.vacancies.length + 1).padStart(2, '0')}`,
          title: form.get('title'),
          department: form.get('department'),
          location: form.get('location'),
          priority: form.get('priority'),
          owner: form.get('owner') || 'Prateek Sir',
          deadline: form.get('deadline') || '2026-09-30',
          experience: form.get('experience'),
          salary: form.get('salary'),
          applications: 0,
          status: 'Open',
          stage: 'Manpower Requirement Raised',
          timestamp: createdAt,
          openedOn: createdAt.split('T')[0],
          stage_updated_at: createdAt,
          stage_history: [],
          stage_timestamps: { 'Manpower Requirement Raised': { entered_at: createdAt } },
          jd_url: jd_url
        });
        activeVacancyStage = 'Manpower Requirement Raised';
      } else {
        const reqId = form.get('requirement_id');
        const linkedVacancy = data.vacancies.find(v => v.id === reqId);
        let cv_url = '';
        const cvFile = form.get('cv');
        if (cvFile && cvFile.name && cvFile.size > 0) {
          const uploadData = new FormData();
          uploadData.append('file', cvFile);
          uploadData.append('folder', 'recruitment_fms/cvs');
          try {
            const uploadRes = await fetch(`${API_BASE}/api/upload`, {
              method: 'POST',
              body: uploadData
            });
            const uploadJson = await uploadRes.json();
            if (uploadJson.url) cv_url = uploadJson.url;
          } catch (err) {
            console.error('CV upload error:', err);
          }
        }

        const createdAt = nowIso();
        data.candidates.unshift({
          id: `CAN-${new Date().getFullYear()}-${String(data.candidates.length + 1).padStart(4, '0')}`,
          requirement_id: reqId,
          name: form.get('name'),
          role: linkedVacancy ? linkedVacancy.title : 'Not Specified',
          phone: form.get('phone'),
          email: form.get('email'),
          source: form.get('source') || 'Direct',
          location: form.get('location'),
          experience: form.get('experience_years') ? form.get('experience_years') + ' Years' : 'Not specified',
          expected: form.get('expected_ctc') || 'Not specified',
          notice_period: form.get('notice_period') ? form.get('notice_period') + ' Days' : '',
          stage: 'Application Received (New)',
          screening_status: 'Pending Review',
          timestamp: createdAt,
          stage_updated_at: createdAt,
          stage_history: [],
          stage_timestamps: { 'Application Received (New)': { entered_at: createdAt } },
          reason_for_leaving: form.get('reason_for_leaving'),
          remarks: form.get('remarks'),
          cv_url: cv_url
        });
        if(linkedVacancy) linkedVacancy.applications++;
      }
      save();
      modal.remove();
      render();
    };
  }


window.addEventListener('storage', e => { 
  if (e.key === 'recruitment-fms-data') { 
    // Handled by API now
  }
});
render();
