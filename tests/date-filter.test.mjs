import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source = fs.readFileSync('src/main.js', 'utf8');

test('date filtering and range logic in Recruitment FMS', async (t) => {
  // Extract date helper functions and renderFilterPanel from main.js
  const helperCode = `
    ${source.slice(source.indexOf('const filterDefaults ='), source.indexOf('const priorityClass ='))}
    globalThis.filterDefaults = filterDefaults;
    globalThis.filters = filters;
    ${source.slice(source.indexOf('const commonDateOptions ='), source.indexOf('const escapeHtml ='))}
    globalThis.commonDateOptions = commonDateOptions;
    globalThis.vacancyDateOptions = vacancyDateOptions;
    globalThis.candidateDateOptions = candidateDateOptions;
    globalThis.getDatePresetRange = getDatePresetRange;
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
  `;

  const ctx = {
    data: {
      candidates: [
        { id: 'CAN-1', name: 'Aarav Patel', role: 'Sales Executive', timestamp: '2026-10-10T10:00:00Z', stage: 'Application Received (New)', screening_status: 'Pending Review' },
        { id: 'CAN-2', name: 'Pooja Sharma', role: 'Store Manager', timestamp: '2026-10-13T08:30:00Z', interview_date: '2026-10-14T11:00:00', stage: 'Interview Scheduled', screening_status: 'Shortlisted' },
        { id: 'CAN-3', name: 'Rohan Verma', role: 'Accountant', timestamp: '2026-09-15T09:00:00Z', stage: 'Application Received (New)', screening_status: 'Pending Review' }
      ],
      vacancies: [
        { id: 'VAC-1', title: 'Sales Executive', openedOn: '2026-10-01', deadline: '2026-10-31', status: 'Open' },
        { id: 'VAC-2', title: 'Store Manager', openedOn: '2026-09-01', deadline: '2026-09-30', status: 'Closed', filledOn: '2026-09-28' }
      ]
    },
    departments: ['Sales', 'Accounts'],
    vacancyStatuses: ['Open', 'Closed'],
    activeReportTab: 'vacancy',
    escapeHtml: value => String(value ?? ''),
    uniqueValues: values => [...new Set(values.filter(Boolean))],
    sameFilterValue: (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase(),
    linkedVacancy: () => ({ id: 'VAC-1', department: 'Sales', status: 'Open' }),
    window: { matchMedia: () => ({ matches: false }) }
  };

  vm.createContext(ctx);
  vm.runInContext(helperCode, ctx);

  await t.test('filterDefaults contains dateField, from, to across all views', () => {
    const filterDefaults = vm.runInContext('filterDefaults', ctx);
    assert.ok(filterDefaults.dashboard);
    assert.equal(filterDefaults.dashboard.dateField, 'created');
    assert.equal(filterDefaults.dashboard.from, '');
    assert.equal(filterDefaults.dashboard.to, '');

    assert.ok(filterDefaults.vacancies);
    assert.equal(filterDefaults.vacancies.dateField, 'opened');
    assert.equal(filterDefaults.vacancies.from, '');
    assert.equal(filterDefaults.vacancies.to, '');

    assert.ok(filterDefaults.screening);
    assert.equal(filterDefaults.screening.dateField, 'created');
    assert.equal(filterDefaults.screening.from, '');
    assert.equal(filterDefaults.screening.to, '');

    assert.ok(filterDefaults.candidates);
    assert.equal(filterDefaults.candidates.dateField, 'created');
    assert.equal(filterDefaults.candidates.from, '');
    assert.equal(filterDefaults.candidates.to, '');

    assert.ok(filterDefaults.reports);
    assert.equal(filterDefaults.reports.dateField, 'created');
    assert.equal(filterDefaults.reports.from, '');
    assert.equal(filterDefaults.reports.to, '');
  });

  await t.test('parseDateValue handles YYYY-MM-DD, ISO string, and DD/MM/YYYY formats', () => {
    const parseDateValue = vm.runInContext('parseDateValue', ctx);
    const d1 = parseDateValue('2026-10-13');
    assert.ok(d1 && typeof d1.getTime === 'function');
    assert.equal(d1.getFullYear(), 2026);
    assert.equal(d1.getMonth(), 9); // October (0-indexed)
    assert.equal(d1.getDate(), 13);

    const d2 = parseDateValue('2026-10-13T14:30:00Z');
    assert.ok(d2 && typeof d2.getTime === 'function');

    const d3 = parseDateValue('13/10/2026');
    assert.ok(d3 && typeof d3.getTime === 'function');
    assert.equal(d3.getFullYear(), 2026);
    assert.equal(d3.getMonth(), 9);
    assert.equal(d3.getDate(), 13);

    assert.equal(parseDateValue(''), null);
    assert.equal(parseDateValue(null), null);
  });

  await t.test('matchesDateRange correctly filters boundary dates', () => {
    const matchesDateRange = vm.runInContext('matchesDateRange', ctx);
    // Empty range always matches
    assert.equal(matchesDateRange('2026-10-13', '', ''), true);

    // Within range
    assert.equal(matchesDateRange('2026-10-10', '2026-10-01', '2026-10-15'), true);
    assert.equal(matchesDateRange('2026-10-01', '2026-10-01', '2026-10-15'), true);
    assert.equal(matchesDateRange('2026-10-15', '2026-10-01', '2026-10-15'), true);

    // Outside range
    assert.equal(matchesDateRange('2026-09-30', '2026-10-01', '2026-10-15'), false);
    assert.equal(matchesDateRange('2026-10-16', '2026-10-01', '2026-10-15'), false);

    // From only
    assert.equal(matchesDateRange('2026-10-10', '2026-10-01', ''), true);
    assert.equal(matchesDateRange('2026-09-30', '2026-10-01', ''), false);

    // To only
    assert.equal(matchesDateRange('2026-10-10', '', '2026-10-15'), true);
    assert.equal(matchesDateRange('2026-10-20', '', '2026-10-15'), false);
  });

  await t.test('getDatePresetRange computes valid date ranges', () => {
    const getDatePresetRange = vm.runInContext('getDatePresetRange', ctx);
    const today = getDatePresetRange('today');
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(today.from));
    assert.equal(today.from, today.to);

    const week = getDatePresetRange('week');
    assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(week.from));
    assert.ok(week.from <= week.to);

    const month = getDatePresetRange('month');
    assert.ok(month.from.endsWith('-01'));

    const clear = getDatePresetRange('clear');
    assert.equal(clear.from, '');
    assert.equal(clear.to, '');
  });

  await t.test('applyVacancyFilters filters vacancies by date range', () => {
    const applyVacancyFilters = vm.runInContext('applyVacancyFilters', ctx);
    const { data } = ctx;
    const all = applyVacancyFilters(data.vacancies, { dateField: 'opened', from: '', to: '' });
    assert.equal(all.length, 2);

    const octOnly = applyVacancyFilters(data.vacancies, { dateField: 'opened', from: '2026-10-01', to: '2026-10-31' });
    assert.equal(octOnly.length, 1);
    assert.equal(octOnly[0].id, 'VAC-1');
  });

  await t.test('applyCandidateFilters filters candidates by date range and date field', () => {
    const applyCandidateFilters = vm.runInContext('applyCandidateFilters', ctx);
    const { data } = ctx;
    // Oct 2026 applications
    const octCandidates = applyCandidateFilters(data.candidates, { dateField: 'created', from: '2026-10-01', to: '2026-10-31' });
    assert.equal(octCandidates.length, 2);
    assert.equal(octCandidates.some(c => c.id === 'CAN-3'), false);

    // Filter by interview date
    const interviewCandidates = applyCandidateFilters(data.candidates, { dateField: 'interview', from: '2026-10-14', to: '2026-10-14' });
    assert.equal(interviewCandidates.length, 1);
    assert.equal(interviewCandidates[0].id, 'CAN-2');
  });

  await t.test('renderFilterPanel generates date filter controls and preset chips', () => {
    const renderFilterPanel = vm.runInContext('renderFilterPanel', ctx);
    const commonDateOptions = vm.runInContext('commonDateOptions', ctx);
    const html = renderFilterPanel('dashboard', { title: 'Dashboard data view', dateOptions: commonDateOptions, department: true });

    assert.ok(html.includes('data-filter-key="dateField"'), 'HTML includes Date By selector');
    assert.ok(html.includes('data-filter-key="from"'), 'HTML includes From Date input');
    assert.ok(html.includes('data-filter-key="to"'), 'HTML includes To Date input');
    assert.ok(html.includes('data-date-preset="today"'), 'HTML includes Today preset chip');
    assert.ok(html.includes('data-date-preset="week"'), 'HTML includes 7D preset chip');
    assert.ok(html.includes('data-date-preset="month"'), 'HTML includes Month preset chip');
    assert.ok(html.includes('data-date-preset="clear"'), 'HTML includes Clear preset chip');
  });

  await t.test('isDateInTabPeriod and date filter mutual exclusivity on reports', () => {
    const isDateInTabPeriod = vm.runInContext('isDateInTabPeriod', ctx);
    const candidateMatchesStageInPeriod = vm.runInContext('candidateMatchesStageInPeriod', ctx);
    const filters = vm.runInContext('filters', ctx);

    // 1. Standard Daily Report: Past date is excluded
    filters.reports.from = '';
    filters.reports.to = '';
    const isPastDateDaily = isDateInTabPeriod('2026-08-15', 'daily');
    assert.equal(isPastDateDaily, false, 'Daily report excludes past dates when no custom date is applied');

    // 2. When custom date filter is applied: daily period restriction does NOT block candidates
    filters.reports.from = '2026-08-01';
    filters.reports.to = '2026-08-31';
    const isPastDateWithCustomFilter = isDateInTabPeriod('2026-08-15', 'daily');
    assert.equal(isPastDateWithCustomFilter, true, 'Daily report period restriction is deactivated when date filter is applied');

    const candidate = {
      id: 'CAN-99',
      stage: 'CV Screened & Shortlisted',
      timestamp: '2026-08-15T10:00:00Z',
      stage_updated_at: '2026-08-15T10:00:00Z'
    };
    const matchesStage = candidateMatchesStageInPeriod(candidate, ['CV Screened & Shortlisted'], 'daily');
    assert.equal(matchesStage, true, 'candidateMatchesStageInPeriod succeeds under custom date filter');

    // 3. When report tab is selected, clearing date filter restores standard daily behavior
    filters.reports.from = '';
    filters.reports.to = '';
    assert.equal(isDateInTabPeriod('2026-08-15', 'daily'), false, 'Standard daily behavior restored after clearing');
  });

  await t.test('computeReportMetrics calculates latestUpdate timestamp for roles and totals', () => {
    const computeReportMetrics = vm.runInContext('computeReportMetrics', ctx);
    const formatDateTime = vm.runInContext('formatDateTime', ctx);

    const testCandidates = [
      { id: 'C-1', role: 'Sales Executive', timestamp: '2026-10-10T10:00:00Z', stage: 'Application Received (New)', screening_status: 'Shortlisted', stage_updated_at: '2026-10-12T14:30:00Z' },
      { id: 'C-2', role: 'Sales Executive', timestamp: '2026-10-11T11:00:00Z', stage: 'Interview Scheduled', stage_updated_at: '2026-10-13T09:15:00Z' }
    ];
    const testVacancies = [
      { id: 'V-1', title: 'Sales Executive', department: 'Sales', status: 'Open' }
    ];

    const { rows, totals } = computeReportMetrics('daily', testVacancies, testCandidates);
    const salesRow = rows.find(r => r.role === 'Sales Executive');
    assert.ok(salesRow, 'Sales Executive row found');
    assert.equal(salesRow.latestUpdate, '2026-10-13T09:15:00Z', 'Role latestUpdate matches most recent candidate update');
    assert.equal(totals.latestUpdate, '2026-10-13T09:15:00Z', 'Totals latestUpdate matches overall most recent candidate update');
    assert.ok(formatDateTime(salesRow.latestUpdate).includes('2026'), 'formatDateTime renders valid human readable timestamp');
  });

  await t.test('computeReportMetrics accurately counts candidates in Telephonic Round in telephonic metric', () => {
    const computeReportMetrics = vm.runInContext('computeReportMetrics', ctx);

    const testCandidates = [
      { id: 'C-10', role: 'Relationship Manager', timestamp: '2026-10-13T10:00:00Z', stage: 'Telephonic Round', screening_status: 'Shortlisted', stage_updated_at: '2026-10-13T10:30:00Z' },
      { id: 'C-11', role: 'Relationship Manager', timestamp: '2026-10-13T11:00:00Z', stage: 'CV Screened & Shortlisted', screening_status: 'Shortlisted', stage_updated_at: '2026-10-13T11:30:00Z' }
    ];
    const testVacancies = [
      { id: 'V-10', title: 'Relationship Manager', department: 'Sales', status: 'Open' }
    ];

    const { rows, totals } = computeReportMetrics('daily', testVacancies, testCandidates);
    const rmRow = rows.find(r => r.role === 'Relationship Manager');
    assert.ok(rmRow, 'Relationship Manager row found');
    assert.equal(rmRow.telephonic, 1, 'Candidate in Telephonic Round is counted in telephonic metric');
    assert.equal(rmRow.shortlisted, 2, 'Both candidates count in shortlisted');
    assert.equal(totals.telephonic, 1, 'Totals telephonic count matches 1');
  });
});

