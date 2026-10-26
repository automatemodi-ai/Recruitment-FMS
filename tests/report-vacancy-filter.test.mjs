import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('src/main.js', 'utf8');

test('Vacancy filter in Report module and interview metrics calculation', async (t) => {
  const helperCode = `
    ${source.slice(source.indexOf('const filterDefaults ='), source.indexOf('const priorityClass ='))}
    globalThis.filterDefaults = filterDefaults;
    globalThis.filters = filters;
    ${source.slice(source.indexOf('const commonDateOptions ='), source.indexOf('const escapeHtml ='))}
    globalThis.commonDateOptions = commonDateOptions;
    globalThis.reportDateOptions = reportDateOptions;
    ${source.slice(source.indexOf('function parseDateValue('), source.indexOf('function formatDateTime('))}
    globalThis.parseDateValue = parseDateValue;
    globalThis.matchesDateRange = matchesDateRange;
    globalThis.getVacancyDate = getVacancyDate;
    globalThis.getCandidateDate = getCandidateDate;
    ${source.slice(source.indexOf('function formatDateTime('), source.indexOf('function formatDuration('))}
    globalThis.formatDateTime = formatDateTime;
    ${source.slice(source.indexOf('function applyVacancyFilters('), source.indexOf('function save()'))}
    globalThis.applyVacancyFilters = applyVacancyFilters;
    globalThis.applyCandidateFilters = applyCandidateFilters;
    globalThis.renderFilterPanel = renderFilterPanel;
    ${source.slice(source.indexOf('function isDateInTabPeriod('), source.indexOf('function computeReportMetrics('))}
    globalThis.isDateInTabPeriod = isDateInTabPeriod;
    globalThis.candidateMatchesStageInPeriod = candidateMatchesStageInPeriod;
    ${source.slice(source.indexOf('function computeReportMetrics('), source.indexOf('function computeClosedJobsReport('))}
    globalThis.computeReportMetrics = computeReportMetrics;
    ${source.slice(source.indexOf('function computeClosedJobsReport('), source.indexOf('function exportClosedJobsToCsv('))}
    globalThis.computeClosedJobsReport = computeClosedJobsReport;
  `;

  const sampleVacancies = [
    { id: 'VAC-CAD-01', title: 'AutoCAD Draftsman', department: 'Design & Engineering', status: 'Open', openedOn: '2026-10-01' },
    { id: 'VAC-SALES-02', title: 'Sales Executive', department: 'Sales & CRM', status: 'Open', openedOn: '2026-10-05' },
    { id: 'VAC-ACCT-03', title: 'Senior Accountant', department: 'Finance & Accounts', status: 'Closed', openedOn: '2026-09-01', filledOn: '2026-09-25' }
  ];

  const sampleCandidates = [
    // AutoCAD candidates
    { id: 'CAN-101', name: 'Ravi Sharma', role: 'AutoCAD Draftsman', requirement_id: 'VAC-CAD-01', timestamp: '2026-10-02T10:00:00Z', stage: 'Interview Completed (Under Evaluation)', screening_status: 'Shortlisted', interview_date: '2026-10-10' },
    { id: 'CAN-102', name: 'Pooja Verma', role: 'AutoCAD Draftsman', requirement_id: 'VAC-CAD-01', timestamp: '2026-10-03T11:00:00Z', stage: 'Interview Scheduled', screening_status: 'Shortlisted', interview_date: '2026-10-15' },
    { id: 'CAN-103', name: 'Amit Kumar', role: 'AutoCAD Draftsman', requirement_id: 'VAC-CAD-01', timestamp: '2026-10-04T12:00:00Z', stage: 'CV Screened & Shortlisted', screening_status: 'Shortlisted' },
    { id: 'CAN-104', name: 'Deepak Singh', role: 'AutoCAD Draftsman', requirement_id: 'VAC-CAD-01', timestamp: '2026-10-05T09:00:00Z', stage: 'Application Received (New)', screening_status: 'Pending Review' },
    // Sales candidates
    { id: 'CAN-201', name: 'Sunil Rao', role: 'Sales Executive', requirement_id: 'VAC-SALES-02', timestamp: '2026-10-06T10:00:00Z', stage: 'Interview Completed (Under Evaluation)', screening_status: 'Shortlisted', interview_date: '2026-10-12' },
    { id: 'CAN-202', name: 'Neha Gupta', role: 'Sales Executive', requirement_id: 'VAC-SALES-02', timestamp: '2026-10-07T14:00:00Z', stage: 'Final Selection (HOD Approval)', screening_status: 'Shortlisted', interview_date: '2026-10-14' }
  ];

  const ctx = {
    data: {
      candidates: sampleCandidates,
      vacancies: sampleVacancies
    },
    departments: ['Design & Engineering', 'Sales & CRM', 'Finance & Accounts'],
    vacancyStatuses: ['Open', 'Closed', 'On-Hold', 'Cancelled'],
    activeReportTab: 'vacancy',
    escapeHtml: value => String(value ?? ''),
    uniqueValues: values => [...new Set(values.filter(Boolean))],
    sameFilterValue: (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase(),
    linkedVacancy: (c) => sampleVacancies.find(v => v.id === c.requirement_id || v.title === c.role) || {},
    window: { matchMedia: () => ({ matches: false }) }
  };

  vm.createContext(ctx);
  vm.runInContext(helperCode, ctx);

  await t.test('filterDefaults.reports includes vacancy filter property', () => {
    const filterDefaults = vm.runInContext('filterDefaults', ctx);
    assert.ok('vacancy' in filterDefaults.reports, 'filterDefaults.reports must have vacancy key');
    assert.equal(filterDefaults.reports.vacancy, '');
  });

  await t.test('renderFilterPanel for reports generates Vacancy dropdown with options', () => {
    const renderFilterPanel = vm.runInContext('renderFilterPanel', ctx);
    const reportDateOptions = vm.runInContext('reportDateOptions', ctx);
    const html = renderFilterPanel('reports', {
      title: 'Filter Report View',
      dateOptions: reportDateOptions,
      department: true,
      vacancy: true,
      role: true,
      source: true,
      status: true
    });

    assert.ok(html.includes('data-filter-key="vacancy"'), 'Filter panel must include vacancy select control');
    assert.ok(html.includes('All vacancies'), 'Must have All vacancies placeholder');
    assert.ok(html.includes('VAC-CAD-01'), 'Must include AutoCAD vacancy option');
    assert.ok(html.includes('VAC-SALES-02'), 'Must include Sales vacancy option');
  });

  await t.test('applyVacancyFilters isolates the selected AutoCAD vacancy', () => {
    const applyVacancyFilters = vm.runInContext('applyVacancyFilters', ctx);
    const { data } = ctx;

    const filtered = applyVacancyFilters(data.vacancies, { vacancy: 'VAC-CAD-01' });
    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, 'VAC-CAD-01');
    assert.equal(filtered[0].title, 'AutoCAD Draftsman');
  });

  await t.test('applyCandidateFilters isolates candidates for AutoCAD vacancy', () => {
    const applyCandidateFilters = vm.runInContext('applyCandidateFilters', ctx);
    const { data } = ctx;

    const filtered = applyCandidateFilters(data.candidates, { vacancy: 'VAC-CAD-01' });
    assert.equal(filtered.length, 4, 'Should return all 4 AutoCAD candidates');
    assert.ok(filtered.every(c => c.role === 'AutoCAD Draftsman'));
  });

  await t.test('computeReportMetrics accurately calculates total profiles and interviews for AutoCAD vacancy', () => {
    const applyVacancyFilters = vm.runInContext('applyVacancyFilters', ctx);
    const applyCandidateFilters = vm.runInContext('applyCandidateFilters', ctx);
    const computeReportMetrics = vm.runInContext('computeReportMetrics', ctx);
    const { data } = ctx;

    const filter = { vacancy: 'VAC-CAD-01' };
    const filteredVacancies = applyVacancyFilters(data.vacancies, filter);
    const filteredCandidates = applyCandidateFilters(data.candidates, filter, true);

    const { rows, totals } = computeReportMetrics('vacancy', filteredVacancies, filteredCandidates);

    assert.equal(rows.length, 1, 'Only 1 role row should be returned for AutoCAD');
    assert.equal(rows[0].role, 'AutoCAD Draftsman');
    assert.equal(rows[0].formsFilled, 4, 'AutoCAD should have 4 total candidates reached');
    assert.equal(rows[0].shortlisted, 3, 'AutoCAD should have 3 shortlisted candidates');
    // CAN-101 (Interview Completed) and CAN-102 (Interview Scheduled)
    assert.equal(rows[0].hrInterview, 2, 'AutoCAD should have 2 candidates in Interview stage');
    assert.equal(totals.hrInterview + totals.finalInterview, 2, 'Total interviews for AutoCAD must be exactly 2');
    assert.equal(rows[0].candidates.length, 4, 'Tracking list must contain all 4 candidates');
  });

  await t.test('computeReportMetrics with Sales vacancy calculates exact Sales interviews', () => {
    const applyVacancyFilters = vm.runInContext('applyVacancyFilters', ctx);
    const applyCandidateFilters = vm.runInContext('applyCandidateFilters', ctx);
    const computeReportMetrics = vm.runInContext('computeReportMetrics', ctx);
    const { data } = ctx;

    const filter = { vacancy: 'VAC-SALES-02' };
    const filteredVacancies = applyVacancyFilters(data.vacancies, filter);
    const filteredCandidates = applyCandidateFilters(data.candidates, filter, true);

    const { rows, totals } = computeReportMetrics('vacancy', filteredVacancies, filteredCandidates);

    assert.equal(rows.length, 1);
    assert.equal(rows[0].role, 'Sales Executive');
    assert.equal(rows[0].formsFilled, 2);
    // CAN-201 (Interview Completed) and CAN-202 (Final Selection)
    // Funnel logic: CAN-201 and CAN-202 reached HR round (2), and CAN-202 reached Final round (1)
    assert.equal(totals.hrInterview, 2);
    assert.equal(totals.finalInterview, 1);
    assert.equal(totals.hrInterview + totals.finalInterview, 3);
  });
});
