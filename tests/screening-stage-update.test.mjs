import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

// 1. Verify server PATCH /candidates/:id/stage handles requests with or without updatedAt
const server = fs.readFileSync('server.js', 'utf8');
const start = server.indexOf("router.patch('/candidates/:id/stage'");
const end = server.indexOf('\n});', start);
const serverSlice = server.slice(start, end + 4);

{
  let handler;
  let updatedFilter = null;
  let updatedDoc = null;
  const ctx = {
    router: { patch: (_, h) => handler = h },
    Candidate: {
      findOneAndUpdate: (filter, update) => {
        updatedFilter = filter;
        updatedDoc = update;
        return { lean: async () => ({ id: filter.id, stage: update.$set.stage, updatedAt: new Date().toISOString() }) };
      },
      findOne: () => ({ lean: async () => null })
    }
  };
  vm.createContext(ctx);
  vm.runInContext(serverSlice, ctx);

  // Test PATCH without updatedAt in body (must succeed, not return 400 error)
  let statusCalled = null;
  let responseData = null;
  const res = {
    status: (code) => { statusCalled = code; return { json: (d) => responseData = d }; },
    json: (d) => responseData = d
  };

  await handler({ params: { id: 'CAN-001' }, body: { stage: 'CV Screened & Shortlisted', screening_status: 'Shortlisted' } }, res);
  assert.equal(statusCalled, null, 'Should not return error status for missing updatedAt');
  assert.equal(responseData.candidate.stage, 'CV Screened & Shortlisted');
  assert.equal(updatedFilter.id, 'CAN-001');
}

// 2. Test updateCandidateStage in main.js handles candidate without initial updatedAt
const source = fs.readFileSync('src/main.js', 'utf8');
const stageFn = source.slice(source.indexOf('async function updateCandidateStage('), source.indexOf('\nfunction updateVacancyStage('));

{
  const candidate = { id: 'CAN-NEW', stage: 'Application Received (New)', screening_status: 'Pending Review' };
  let patchPayload = null;
  const context = {
    structuredClone,
    candidate,
    _pendingStageUpdates: 0,
    _dataRevision: 0,
    moveRecordToStage: (c, s) => { c.stage = s; },
    data: { vacancies: [] },
    activePipelineStage: 'CV Screened & Shortlisted',
    API_BASE: '',
    normalizeCandidate: c => c,
    render: () => {},
    alerts: [],
    fetch: async (url, options) => {
      patchPayload = JSON.parse(options.body);
      return {
        ok: true,
        json: async () => ({ candidate: { ...candidate, ...patchPayload, updatedAt: new Date().toISOString() } })
      };
    }
  };
  context.alert = m => context.alerts.push(m);
  vm.createContext(context);
  vm.runInContext(stageFn, context);

  const ok = await vm.runInContext("updateCandidateStage(candidate, 'CV Screened & Shortlisted', { ...candidate, screening_status: 'Shortlisted' })", context);
  assert.equal(ok, true);
  assert.equal(candidate.stage, 'CV Screened & Shortlisted');
  assert.equal(candidate.screening_status, 'Shortlisted');
  assert.ok(patchPayload.updatedAt, 'Payload must automatically provide updatedAt timestamp');
  assert.equal(context.alerts.length, 0, 'No error alerts should be triggered');
}

console.log('PASS: screening stage update without refresh');
