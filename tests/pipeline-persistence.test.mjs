import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=fs.readFileSync('src/main.js','utf8');
const stage=source.slice(source.indexOf('async function updateCandidateStage('),source.indexOf('\nfunction updateVacancyStage('));
function setup(){
 const candidate={id:'test',stage:'Interview Scheduled',requirement_id:'VAC',role:'CRM',updatedAt:'2026-10-09T12:00:00Z'};
 const context={structuredClone, candidate,_pendingStageUpdates:0,_dataRevision:0,moveRecordToStage:(c,s)=>c.stage=s,data:{vacancies:[{id:'VAC',stage:'Candidate Pipeline Active',status:'Open'}]},activePipelineStage:'Interview Scheduled',API_BASE:'',normalizeCandidate:c=>c,render:()=>{},alerts:[],requests:[]};
 context.alert=m=>context.alerts.push(m);
 context.fetch=async(url,options)=>{context.requests.push(url);return {ok:true,json:async()=>({candidate:JSON.parse(options.body)})};};
 vm.createContext(context);vm.runInContext(stage,context);return context;
}
let c=setup();await vm.runInContext("updateCandidateStage(candidate,'Final Selection (HOD Approval)')",c);assert.equal(c.candidate.stage,'Final Selection (HOD Approval)');assert.equal(c.requests.length,1);
c=setup();c.fetch=async()=>({ok:false,json:async()=>({error:'Conflict'})});await vm.runInContext("updateCandidateStage(candidate,'Rejected',{...candidate,remarks:'unsaved',remarks_history:[{text:'unsaved'}]})",c);assert.equal(c.candidate.stage,'Interview Scheduled');assert.equal('remarks' in c.candidate,false);assert.equal(c.activePipelineStage,'Interview Scheduled');assert.equal(c._pendingStageUpdates,0);assert.match(c.alerts[0],/Conflict/);
c=setup();let release;c.fetch=()=>new Promise(resolve=>release=resolve);const first=vm.runInContext("updateCandidateStage(candidate,'Final Selection (HOD Approval)')",c);assert.equal(await vm.runInContext("updateCandidateStage(candidate,'Rejected')",c),false);release({ok:true,json:async()=>({candidate:c.candidate})});await first;
c=setup();let calls=0;c.fetch=async()=>{if(++calls===2)throw Error('Network');return {ok:true,json:async()=>({candidate:c.candidate})};};await vm.runInContext("updateCandidateStage(candidate,'Candidate Joined (Closed - Won)')",c);assert.equal(c.candidate.stage,'Candidate Joined (Closed - Won)');assert.match(c.alerts[0],/stage saved/);
const server=fs.readFileSync('server.js','utf8');const start=server.indexOf("router.post('/sync', async (req, res) => {");const end=server.indexOf('\n});',start);let handler,writes=0;
const ctx={router:{post:(_,h)=>handler=h},Candidate:{findOne:()=>({lean:async()=>({id:'test',stage:'Offer Released',stage_updated_at:'2026-10-09T12:00:00Z',updatedAt:'2026-10-09T12:00:00Z'})}),findOneAndUpdate:async()=>writes++},Vacancy:{},ensureInitialStageTimeline:()=>{},console};vm.createContext(ctx);vm.runInContext(server.slice(start,end+4),ctx);
const response={json:()=>{},status:()=>({json:()=>{}})};
await handler({body:{candidates:[{id:'test',stage:'Interview Scheduled',stage_updated_at:'2026-10-08T12:00:00Z'}]}},response);assert.equal(writes,0);
await handler({body:{candidates:[{id:'test',stage:'Offer Released',stage_updated_at:'2026-10-09T12:00:00Z',updatedAt:'2026-10-08T12:00:00Z'}]}},response);assert.equal(writes,0);
console.log('PASS: targeted stage save, complete rollback, duplicate submission guard, vacancy network failure, stale stage sync, stale profile sync');
