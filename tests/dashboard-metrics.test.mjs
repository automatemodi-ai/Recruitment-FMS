import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('src/main.js', 'utf8');

test('Recruitment Dashboard specific metrics: Reached, Shortlisted, Interviewed', async (t) => {
  // Extract helpers and dashboard function from main.js into isolated VM context
  const helperCode = `
    ${source.slice(source.indexOf('const positions ='), source.indexOf('let currentUser ='))}
    globalThis.stages = stages;
    globalThis.vacancyStages = vacancyStages;
    globalThis.candidateWorkflow = candidateWorkflow;

    ${source.slice(source.indexOf('const priorityClass ='), source.indexOf('const getVacancyStage ='))}
    globalThis.isCandidateShortlisted = isCandidateShortlisted;
    globalThis.isShortlistedCandidate = isShortlistedCandidate;
    globalThis.isCandidateInterviewed = isCandidateInterviewed;
    globalThis.activeCandidates = activeCandidates;
    globalThis.isStageOverdue = isStageOverdue;
    globalThis.daysInStage = daysInStage;
    globalThis.daysOpen = daysOpen;
    globalThis.stageClass = stageClass;
    globalThis.countStage = countStage;

    ${source.slice(source.indexOf('function renderOpenVacanciesShortlistedCards('), source.indexOf('function dashboard('))}
    globalThis.renderOpenVacanciesShortlistedCards = renderOpenVacanciesShortlistedCards;

    ${source.slice(source.indexOf('function dashboard('), source.indexOf('function renderVacancyWorkflowTabs('))}
    globalThis.dashboard = dashboard;
  `;

  const sampleCandidates = [
    // 1. New application (Reached only, not shortlisted, not interviewed)
    {
      id: 'CAN-101',
      name: 'Amit Patel',
      role: 'Sales Executive',
      stage: 'Application Received (New)',
      screening_status: 'Pending Review',
      timestamp: '2026-10-20T10:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 2. Shortlisted in CV screening (Reached, Shortlisted, not yet interviewed)
    {
      id: 'CAN-102',
      name: 'Neha Sharma',
      role: 'Sales Executive',
      stage: 'CV Screened & Shortlisted',
      screening_status: 'Shortlisted',
      timestamp: '2026-10-20T11:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 3. Interview Scheduled (Reached, Shortlisted, Interviewed)
    {
      id: 'CAN-103',
      name: 'Rohan Gupta',
      role: 'Sales Executive',
      stage: 'Interview Scheduled',
      screening_status: 'Shortlisted',
      interview_date: '2026-10-24',
      interviewer: 'Divyansh Sir',
      timestamp: '2026-10-18T10:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 4. Interview Completed (Reached, Shortlisted, Interviewed)
    {
      id: 'CAN-104',
      name: 'Pooja Verma',
      role: 'Sales Executive',
      stage: 'Interview Completed (Under Evaluation)',
      screening_status: 'Shortlisted',
      interview_rating: 8,
      interview_remarks: 'Strong product knowledge and good communication',
      timestamp: '2026-10-15T09:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 5. Offer Released (Reached, Shortlisted, Interviewed)
    {
      id: 'CAN-105',
      name: 'Karan Malhotra',
      role: 'Sales Executive',
      stage: 'Offer Released',
      screening_status: 'Shortlisted',
      offer_date: '2026-10-22',
      timestamp: '2026-10-10T10:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 6. Rejected after interview (Reached, Shortlisted, Interviewed)
    {
      id: 'CAN-106',
      name: 'Suresh Kumar',
      role: 'Sales Executive',
      stage: 'Rejected',
      screening_status: 'Shortlisted',
      interview_date: '2026-10-16',
      interview_remarks: 'Salary expectation too high',
      rejection_reason: 'High salary expectation',
      timestamp: '2026-10-12T10:00:00Z',
      requirement_id: 'VAC-01'
    },
    // 7. Rejected at CV Screening (Reached only, neither shortlisted nor interviewed)
    {
      id: 'CAN-107',
      name: 'Vikas Rao',
      role: 'Sales Executive',
      stage: 'Rejected',
      screening_status: 'Rejected',
      rejection_reason: 'Lack of skills',
      timestamp: '2026-10-19T10:00:00Z',
      requirement_id: 'VAC-01'
    }
  ];

  const sampleVacancies = [
    {
      id: 'VAC-01',
      title: 'Sales Executive',
      department: 'Sales & CRM',
      status: 'Open',
      openedOn: '2026-10-01'
    }
  ];

  const ctx = {
    data: {
      candidates: sampleCandidates,
      vacancies: sampleVacancies
    },
    activeDashboardPreset: 'all',
    commonDateOptions: [],
    escapeHtml: str => String(str ?? ''),
    belongsToVacancy: (c, v) => c.requirement_id === v.id || c.role === v.title,
    isDateInTabPeriod: () => true,
    renderFilterPanel: () => '<div class="filter-panel-mock"></div>',
    renderPaginationControls: () => '',
    paginate: items => ({ items, totalItems: items.length, totalPages: 1 }),
    formatDateTime: dt => String(dt ?? ''),
    console
  };

  vm.createContext(ctx);
  vm.runInContext(helperCode, ctx);

  await t.test('isShortlistedCandidate classification accuracy', () => {
    const isShortlisted = vm.runInContext('isShortlistedCandidate', ctx);

    assert.equal(isShortlisted(sampleCandidates[0]), false, 'CAN-101 (Pending Review) is NOT shortlisted');
    assert.equal(isShortlisted(sampleCandidates[1]), true, 'CAN-102 (CV Screened & Shortlisted) is shortlisted');
    assert.equal(isShortlisted(sampleCandidates[2]), true, 'CAN-103 (Interview Scheduled) is shortlisted');
    assert.equal(isShortlisted(sampleCandidates[3]), true, 'CAN-104 (Interview Completed) is shortlisted');
    assert.equal(isShortlisted(sampleCandidates[4]), true, 'CAN-105 (Offer Released) is shortlisted');
    assert.equal(isShortlisted(sampleCandidates[5]), true, 'CAN-106 (Rejected after being shortlisted) is shortlisted in funnel');
    assert.equal(isShortlisted(sampleCandidates[6]), false, 'CAN-107 (Rejected at CV stage) is NOT shortlisted');
  });

  await t.test('isCandidateInterviewed classification accuracy', () => {
    const isInterviewed = vm.runInContext('isCandidateInterviewed', ctx);

    assert.equal(isInterviewed(sampleCandidates[0]), false, 'CAN-101 (New app) is NOT interviewed');
    assert.equal(isInterviewed(sampleCandidates[1]), false, 'CAN-102 (CV Screened only) is NOT interviewed');
    assert.equal(isInterviewed(sampleCandidates[2]), true, 'CAN-103 (Interview Scheduled) IS interviewed');
    assert.equal(isInterviewed(sampleCandidates[3]), true, 'CAN-104 (Interview Completed) IS interviewed');
    assert.equal(isInterviewed(sampleCandidates[4]), true, 'CAN-105 (Offer Released) IS interviewed');
    assert.equal(isInterviewed(sampleCandidates[5]), true, 'CAN-106 (Rejected after interview) IS interviewed');
    assert.equal(isInterviewed(sampleCandidates[6]), false, 'CAN-107 (Rejected at screening) is NOT interviewed');
  });

  await t.test('dashboard() renders exact numbers for Reached, Shortlisted, Interviewed', () => {
    const dashboardHtml = vm.runInContext('dashboard(data.vacancies, data.candidates)', ctx);

    // Candidates Reached: all 7 candidates
    assert.ok(dashboardHtml.includes('Candidates Reached'), 'HTML contains "Candidates Reached" label');
    assert.ok(dashboardHtml.includes('>7</strong>') || dashboardHtml.includes('>${candidatesReached}</strong>') || dashboardHtml.includes('Candidates Reached <span class="badge">7</span>'), 'Candidates Reached count is 7');

    // Candidates Shortlisted: 5 candidates (102, 103, 104, 105, 106)
    assert.ok(dashboardHtml.includes('Candidates Shortlisted'), 'HTML contains "Candidates Shortlisted" label');
    assert.ok(dashboardHtml.includes('Candidates Shortlisted <span class="badge">5</span>'), 'Quick preset shows 5 shortlisted');

    // Candidates Interviewed: 4 candidates (103, 104, 105, 106)
    assert.ok(dashboardHtml.includes('Candidates Interviewed'), 'HTML contains "Candidates Interviewed" label');
    assert.ok(dashboardHtml.includes('Candidates Interviewed <span class="badge">4</span>'), 'Quick preset shows 4 interviewed');

    // Verify requisition pipeline summary header
    assert.ok(dashboardHtml.includes('Reached: <strong>7</strong>'), 'Pipeline header contains Reached: 7');
    assert.ok(dashboardHtml.includes('Shortlisted: <strong style="color:#2563eb;">5</strong>'), 'Pipeline header contains Shortlisted: 5');
    assert.ok(dashboardHtml.includes('Interviewed: <strong style="color:#047857;">4</strong>'), 'Pipeline header contains Interviewed: 4');
  });

  await t.test('dashboard presets for reached, shortlisted, and interviews work cleanly', () => {
    // 1. Preset reached
    ctx.activeDashboardPreset = 'reached';
    const reachedHtml = vm.runInContext('dashboard(data.vacancies, data.candidates)', ctx);
    assert.ok(reachedHtml.includes('Candidates Reached (All Received Applications)'), 'Preset table opens for reached');

    // 2. Preset shortlisted
    ctx.activeDashboardPreset = 'shortlisted';
    const shortlistedHtml = vm.runInContext('dashboard(data.vacancies, data.candidates)', ctx);
    assert.ok(shortlistedHtml.includes('Candidates Screened &amp; Shortlisted') || shortlistedHtml.includes('Candidates Screened & Shortlisted'), 'Preset table opens for shortlisted');

    // 3. Preset interviews
    ctx.activeDashboardPreset = 'interviews';
    const interviewedHtml = vm.runInContext('dashboard(data.vacancies, data.candidates)', ctx);
    assert.ok(interviewedHtml.includes('Candidates Interviewed (Scheduled or Evaluated)'), 'Preset table opens for interviewed');
  });
});
