import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/main.js', 'utf8');
const stageCode = source.slice(
  source.indexOf('async function updateCandidateStage('),
  source.indexOf('\nfunction updateVacancyStage(')
);

// Test 1: Simulating cold start / Failed to fetch on attempt 1, succeeding on attempt 2
{
  const candidate = {
    id: 'CAN-RETRY-1',
    stage: 'Interview Scheduled',
    updatedAt: '2026-10-20T10:00:00Z'
  };

  let attempts = 0;
  const context = {
    structuredClone,
    candidate,
    _pendingStageUpdates: 0,
    _dataRevision: 0,
    moveRecordToStage: (c, s) => c.stage = s,
    data: { vacancies: [] },
    activePipelineStage: 'Interview Scheduled',
    API_BASE: '',
    normalizeCandidate: c => c,
    render: () => {},
    alerts: [],
    alert: m => context.alerts.push(m),
    setTimeout: (cb) => cb(), // resolve immediately in test
    fetch: async (url, options) => {
      attempts++;
      if (attempts === 1) {
        throw new TypeError('Failed to fetch'); // Network drop / cold start timeout
      }
      return {
        ok: true,
        json: async () => ({
          candidate: { ...candidate, stage: 'Rejected', screening_status: 'Rejected' }
        })
      };
    }
  };

  vm.createContext(context);
  vm.runInContext(stageCode, context);

  const result = await vm.runInContext("updateCandidateStage(candidate, 'Rejected')", context);

  assert.equal(result, true, 'Stage update succeeds after auto-retry');
  assert.equal(attempts, 2, 'fetch was retried on Failed to fetch');
  assert.equal(context.alerts.length, 0, 'No error alert was shown to the user');
  assert.equal(context.candidate.stage, 'Rejected', 'Candidate stage was updated to Rejected');
}

// Test 2: If network is permanently offline (fails 3 times), rolls back and shows friendly error
{
  const candidate = {
    id: 'CAN-OFFLINE-1',
    stage: 'Interview Scheduled',
    updatedAt: '2026-10-20T10:00:00Z'
  };

  let attempts = 0;
  const context = {
    structuredClone,
    candidate,
    _pendingStageUpdates: 0,
    _dataRevision: 0,
    moveRecordToStage: (c, s) => c.stage = s,
    data: { vacancies: [] },
    activePipelineStage: 'Interview Scheduled',
    API_BASE: '',
    normalizeCandidate: c => c,
    render: () => {},
    alerts: [],
    alert: m => context.alerts.push(m),
    setTimeout: (cb) => cb(),
    fetch: async () => {
      attempts++;
      throw new TypeError('Failed to fetch');
    }
  };

  vm.createContext(context);
  vm.runInContext(stageCode, context);

  const result = await vm.runInContext("updateCandidateStage(candidate, 'Rejected')", context);

  assert.equal(result, false, 'Returns false when permanently offline');
  assert.equal(attempts, 3, 'Tried 3 times before giving up');
  assert.equal(context.candidate.stage, 'Interview Scheduled', 'Rolled back to original stage');
  assert.equal(context.alerts.length, 1);
  assert.match(context.alerts[0], /internet/i, 'Shows friendly internet connection message');
}

console.log('PASS: stage network retry and offline fallback tests');
