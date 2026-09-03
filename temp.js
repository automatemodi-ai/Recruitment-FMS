
const window = { addEventListener: () => {} };
const document = {
  querySelector: (sel) => {
    if(sel === 'main') return { innerHTML: '', appendChild: () => {} };
    if(sel === '#search') return { addEventListener: () => {} };
    return { addEventListener: () => {} };
  },
  querySelectorAll: () => [],
  createElement: () => ({ classList: {add:()=>{}}, style: {}, appendChild: () => {}, append: () => {}, innerHTML: '', addEventListener: () => {} })
};
const fetch = () => Promise.resolve({ json: () => Promise.resolve({ vacancies: [], candidates: [] }) });
const alert = console.log;
const confirm = () => true;


const positions = ["Executive Assistant","Process Coordinator","Business Operations Intern","Production Planner / Order Manager","Sales Executive - Retail","Sales Executive - Project Sales","Sales Manager","Sales Coordinator","CRM Executive","Showroom Receptionist","Furniture Designer","AutoCAD Draftsman","SolidWorks Draftsman","Design Manager","Production Drawing Designer","Product Development Designer","Finance & Accounts Manager","Senior Accountant","Accounts Executive","Accountant & Cashier","Cost Analyst","HR Manager","Recruitment Executive","Back Office Executive","Data Entry Operator","Office Assistant","Inventory Manager","Inventory Executive","Warehouse In-Charge","Storekeeper","Material Inward Supervisor","Purchase Manager","Purchase Executive","Vendor Development Executive","MIS Executive","IT Support Executive","AI Automation Engineer","Marketing Manager","Marketing Executive","Digital Marketing Executive","Graphic Designer","Production Head","Production Manager - Wooden","Production Supervisor - Wooden","Production Manager - Metal","Production Supervisor - Metal","Production Supervisor - Chair","QC Executive","Dispatch Supervisor","Logistics Coordinator","Project Manager","Project Coordinator","Site Supervisor","Maintenance Executive","Electrical Technician","Hotel Manager","Hotel Operations Supervisor","Front Office Manager","Front Office Executive","Hotel Receptionist","Guest Service Executive","Housekeeping Supervisor","Housekeeping Staff","F&B Manager","Restaurant Supervisor","Chef"];
const departments = ["Admin & Back Office","Design & Engineering","Finance & Accounts","Human Resources","Inventory Management","IT & Automation","Marketing","MDO","Operations","Production","Projects & Installation","Sales & CRM","Front Office - Hotel","Maintenance","Hotel Operations / Front Office","Housekeeping","Food & Beverage"];
const locations = ["Showroom","Factory","Miracle"];
const priorities = ["Urgent","High","Medium","Low"];
const experiences = ["Fresher (0-2 years)",">2 Years",">3 Years",">5 Years",">10 Years"];
const salaries = ["10,000-15,000","15,000-20,000","20,000-25,000","25,000-30,000","30,000-40,000","40,000-50000","50,000 - 75,000","75,000 - 1,00,000","1,00,000 - 2,00,000","2,00,000 & Above"];
const managers = ["Prateek Sir","Ayushi Mam","Divyansh Sir","Vishnu Sir","Ravi Sir"];
const stages = ["Manpower Requirement","Manpower Review","Publish Vacancy","CV Screening","Candidate Shortlist","Telephonic Screening","HR Interview Completed","Technical Assessment / Test","Final Management Interview","Reference / Document Check","Selected - Job Offer Released","Offer Accepted — Joining Awaited","Joined / Rejected / Dropped / On Hold"]
const vacancyStages = ["Manpower Requirement Raised","Requirement Review","Vacancy Published / Sourcing Started","Candidate Pipeline Active","Final Candidate Selected","Offer Released","Offer Accepted","Candidate Joined","Vacancy Closed"];
const vacancyStatuses = ['Open', 'On-Hold', 'Cancelled', 'Closed'];

let data = { vacancies: [], candidates: [] };
fetch('http://localhost:3000/api/data')
  .then(res => res.json())
  .then(resData => {
    data = resData;
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
let search = '';
let vacancyFilterDepartment = '';
let vacancyFilterPriority = '';

const priorityClass = (p) => p === 'Urgent' ? 'red' : p === 'High' ? 'orange' : 'green';
const stageClass = (s) => s.includes('Interview') || s.includes('Assessment') ? 'orange' : s.includes('Joined') ? 'green' : s.includes('Rejected') ? 'red' : 'blue';
const countStage = stage => data.candidates.filter(candidate => candidate.stage === stage && (candidate.screening_status === 'Shortlisted' || !candidate.screening_status)).length;

function save() {
  fetch('http://localhost:3000/api/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }).catch(err => console.error('Sync failed', err));
}

function render() {
  const main = document.querySelector('main');
  if (activeView === 'Dashboard') {
    const open = data.vacancies.filter(x => x.status === 'Open').length;
    main.innerHTML = dashboard(open);
  } else if (activeView === 'Vacancies') {
    main.innerHTML = vacancies();
  } else if (activeView === 'Candidates' || activeView === 'CV Screening') {
    let list = data.candidates;
    if (search) list = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));
    main.innerHTML = candidates(list);
  } else if (activeView === 'Reports') {
    main.innerHTML = reports();
  }
  
  document.querySelectorAll('nav a').forEach(a => {
    a.classList.toggle('active', a.dataset.view === activeView || (a.dataset.view === 'Candidates' && activeView === 'CV Screening'));
  });
  
  bindEvents();
}


function dashboard(open) { return `<section class="welcome"><div><span class="section-kicker">OPERATIONS OVERVIEW</span><p>Here is the current pulse of your hiring pipeline.</p></div><button class="primary" data-action="new-vacancy">+ New vacancy</button></section><div class="stats"><div class="stat"><span>Open vacancies</span><strong>${open}</strong><em class="up">+2 this month</em></div><div class="stat"><span>Total applications</span><strong>${data.candidates.length}</strong><em class="up">+18% vs last month</em></div><div class="stat"><span>In active pipeline</span><strong>${data.candidates.filter(item => !['Joined / Rejected / Dropped / On Hold'].includes(item.stage)).length}</strong><em>Across ${open} roles</em></div><div class="stat"><span>Average days open</span><strong>12.4</strong><em class="warn">Needs attention</em></div></div><div class="grid-two"><section class="panel pipeline"><div class="panel-head"><div><span class="section-kicker">LIVE PIPELINE</span><h3>Candidate movement</h3></div><button class="text-button" data-view="Candidates">View all →</button></div><div class="pipeline-bars">${stages.slice(3, 9).map(stage => `<div class="bar-row"><span>${stage}</span><div class="bar-track"><div class="bar-fill ${stageClass(stage)}" style="width:${Math.max(8, countStage(stage) * 14)}%"></div></div><strong>${countStage(stage)}</strong></div>`).join('')}</div></section><section class="panel urgent"><div class="panel-head"><div><span class="section-kicker">NEEDS ATTENTION</span><h3>Priority vacancies</h3></div><button class="text-button" data-view="Vacancies">Manage →</button></div>${data.vacancies.filter(item => item.priority === 'Urgent' || item.priority === 'High').slice(0, 3).map(item => `<div class="mini-row"><span class="priority ${priorityClass(item.priority)}"></span><div><strong>${item.title}</strong><small>${item.department} · ${item.location}</small></div><b>${item.applications} <small>apps</small></b></div>`).join('')}</section></div><section class="panel activity"><div class="panel-head"><div><span class="section-kicker">RECENT ACTIVITY</span><h3>Latest candidate updates</h3></div><button class="text-button" data-view="Candidates">Open tracker →</button></div>${data.candidates.slice(0, 4).map(item => `<div class="activity-row"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2)}</span><div><strong>${item.name}</strong><span>applied for <b>${item.role}</b></span></div><span class="stage ${stageClass(item.stage)}">${item.stage}</span><time>Today</time></div>`).join('')}</section>` }

function vacancies() {
  let filtered = data.vacancies;
  if (vacancyFilterPriority) filtered = filtered.filter(v => v.priority === vacancyFilterPriority);
  if (vacancyFilterDepartment) filtered = filtered.filter(v => v.department === vacancyFilterDepartment);

  return `<div class="page-intro"><div><span class="section-kicker">VACANCY FMS</span><p>Master Control Room: Track every job opening from requisition to closure.</p></div><button class="primary" data-action="new-vacancy">+ Add vacancy</button></div>
  <section class="toolbar">
    <div class="tabs">
      <button class="selected">All <b>${data.vacancies.length}</b></button>
      <button>Open <b>${data.vacancies.filter(x => x.status === 'Open').length}</b></button>
      <button>Closed <b>${data.vacancies.filter(x => x.status === 'Closed').length}</b></button>
    </div>
    <div style="display:flex;gap:10px;">
      <select id="department-filter"><option value="">All departments</option>${departments.map(d => "<option "+ (vacancyFilterDepartment === d ? "selected" : "") +">" + d + "</option>").join('')}</select>
      <select id="priority-filter"><option value="">All priorities</option>${priorities.map(p => "<option "+ (vacancyFilterPriority === p ? "selected" : "") +">" + p + "</option>").join('')}</select>
    </div>
  </section>
  <section class="table-panel">
    <table>
      <thead>
        <tr>
          <th>Vacancy Details</th>
          <th>Owner & Dept</th>
          <th>Dates</th>
          <th>Pipeline Metrics</th>
          <th>Workflow Stage</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${filtered.map(item => {
          const totalC = data.candidates.filter(c => c.requirement_id === item.id || c.role === item.title).length;
          const interviewC = data.candidates.filter(c => (c.requirement_id === item.id || c.role === item.title) && c.stage.includes('Interview')).length;
          const offerC = data.candidates.filter(c => (c.requirement_id === item.id || c.role === item.title) && c.stage.includes('Offer')).length;
          const currentStage = item.stage || 'Manpower Requirement Raised';
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
            <td>
              <select class="vacancy-stage-select" data-id="${item.id}">
                ${vacancyStages.map(s => `<option ${currentStage === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
            <td>
              <select class="vacancy-status-select" data-id="${item.id}">
                ${vacancyStatuses.map(s => `<option ${item.status === s ? 'selected' : ''}>${s}</option>`).join('')}
              </select>
            </td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>
  </section>`
}

function candidates(list) { 
  if (activeView === 'CV Screening') {
    const rows = list.filter(x => x.screening_status === 'Pending Review' || x.screening_status === 'Hold' || !x.screening_status);
    return `<div class="page-intro"><div><span class="section-kicker">CV SCREENING & INTAKE</span><p>Staging Area · ${rows.length} applications pending review</p></div><button class="primary" data-action="new-candidate">+ Add application</button></div>
    <section class="table-panel"><table><thead><tr><th>Candidate</th><th>Applied role</th><th>Source</th><th>Experience</th><th>Expected CTC</th><th>Screening Action</th></tr></thead><tbody>${rows.map(item => `<tr><td><div class="candidate-cell"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>${item.name}</strong><small>${item.id} · ${item.location}</small></div></div></td><td>${item.role}</td><td>${item.source}</td><td>${item.experience}</td><td>₹ ${item.expected}</td><td><select class="screening-select" data-id="${item.id}">
      <option ${item.screening_status === 'Pending Review' || !item.screening_status ? 'selected' : ''}>Pending Review</option>
      <option ${item.screening_status === 'Shortlisted' ? 'selected' : ''}>Shortlisted</option>
      <option ${item.screening_status === 'Rejected' ? 'selected' : ''}>Rejected</option>
      <option ${item.screening_status === 'Hold' ? 'selected' : ''}>Hold</option>
    </select></td></tr>`).join('')}</tbody></table></section>`;
  } else {
    const rows = list.filter(x => x.screening_status === 'Shortlisted');
    return `<div class="page-intro"><div><span class="section-kicker">TALENT DATABASE</span><p>Candidate Pipeline Tracker · ${rows.length} shortlisted candidates</p></div></div>
    <section class="stage-summary" style="grid-template-columns: repeat(4, 1fr);">${stages.slice(3, 7).map(stage => `<div><span>${stage}</span><strong>${countStage(stage)}</strong></div>`).join('')}</section>
    <section class="table-panel"><table><thead><tr><th>Candidate</th><th>Applied role</th><th>Source</th><th>Experience</th><th>Expected CTC</th><th>Pipeline Stage</th></tr></thead><tbody>${rows.map(item => `<tr><td><div class="candidate-cell"><span class="initials">${item.name.split(' ').map(word => word[0]).join('').slice(0, 2).toUpperCase()}</span><div><strong>${item.name}</strong><small>${item.id} · ${item.location}</small></div></div></td><td>${item.role}</td><td>${item.source}</td><td>${item.experience}</td><td>₹ ${item.expected}</td><td><select class="stage-select" data-id="${item.id}">${stages.map(stage => `<option ${stage === item.stage ? 'selected' : ''}>${stage}</option>`).join('')}</select></td></tr>`).join('')}</tbody></table></section>`;
  }
}

function reports() {
  const hrInterview = countStage('HR Interview Completed');
  const techAsses = countStage('Technical Assessment / Test');
  const mgmtInterview = countStage('Final Management Interview');
  const offers = countStage('Selected - Job Offer Released');
  const joined = countStage('Joined / Rejected / Dropped / On Hold'); // Approximate for joined

  return `<div class="page-intro"><div><span class="section-kicker">FMS REPORTING</span><p>Recruitment performance at a glance.</p></div><button class="secondary" data-action="export">Download report ↓</button></div>
  <div class="report-grid">
    <div class="report-card accent-card"><span>Selection rate</span><strong>${Math.round((joined / Math.max(1, data.candidates.length)) * 100)}%</strong><small>Joined / total applicants</small></div>
    <div class="report-card"><span>Interviews conducted</span><strong>${hrInterview + techAsses + mgmtInterview}</strong><small>Across current vacancies</small></div>
    <div class="report-card"><span>Offers released</span><strong>${offers}</strong><small>Awaiting joining</small></div>
    <div class="report-card"><span>Active Roles</span><strong>${data.vacancies.filter(v=>v.status==='Open').length}</strong><small>Currently sourcing</small></div>
  </div>
  <section class="panel report-table">
    <div class="panel-head"><div><span class="section-kicker">VACANCY REPORT</span><h3>Role-wise conversion</h3></div></div>
    <table>
      <thead><tr><th>Role</th><th>Applications</th><th>Shortlisted</th><th>Interviews</th><th>Joined</th><th>Days open</th></tr></thead>
      <tbody>${data.vacancies.map(v => {
        const cands = data.candidates.filter(c => c.requirement_id === v.id || c.role === v.title);
        const apps = cands.length;
        const short = cands.filter(c => c.screening_status === 'Shortlisted').length;
        const ints = cands.filter(c => c.stage.includes('Interview') || c.stage.includes('Assessment')).length;
        const jo = cands.filter(c => c.stage.includes('Joined')).length;
        
        let days = 0;
        if(v.openedOn) {
          const start = new Date(v.openedOn);
          const end = v.filledOn ? new Date(v.filledOn) : new Date();
          days = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
        } else { days = v.status === 'Closed' ? 26 : 12; }

        return `<tr><td><strong>${v.title}</strong></td><td>${apps}</td><td>${short}</td><td>${ints}</td><td>${jo}</td><td>${days}</td></tr>`;
      }).join('')}</tbody>
    </table>
  </section>`
}


function bindEvents() {
  document.querySelectorAll('[data-view]').forEach(button => button.onclick = () => { activeView = button.dataset.view; render(); });
  document.querySelector('#search')?.addEventListener('input', event => { search = event.target.value; if (activeView === 'Candidates' || activeView === 'CV Screening') render(); });
  document.querySelectorAll('.stage-select').forEach(select => select.onchange = event => { const candidate = data.candidates.find(item => item.id === event.target.dataset.id); candidate.stage = event.target.value; save(); render(); });
  document.querySelectorAll('.screening-select').forEach(select => select.onchange = event => { 
    const candidate = data.candidates.find(item => item.id === event.target.dataset.id); 
    candidate.screening_status = event.target.value; 
    if (candidate.screening_status === 'Shortlisted') {
      candidate.stage = 'CV Screening';
      alert(candidate.name + ' has been shortlisted and moved to the Candidate Pipeline.');
    } else if (candidate.screening_status === 'Rejected') {
      alert('Auto-reject email triggered for ' + candidate.name);
    }
    save(); render(); 
  });
  document.querySelectorAll('.vacancy-stage-select').forEach(select => select.onchange = event => { 
    const v = data.vacancies.find(item => item.id === event.target.dataset.id); 
    v.stage = event.target.value; 
    if (v.stage === 'Vacancy Closed') {
      v.status = 'Closed';
      v.filledOn = new Date().toISOString().split('T')[0];
    }
    save(); render(); 
  });
  document.querySelectorAll('.vacancy-status-select').forEach(select => select.onchange = event => { 
    const v = data.vacancies.find(item => item.id === event.target.dataset.id); 
    v.status = event.target.value; 
    save(); render(); 
  });
  document.querySelectorAll('[data-action="new-vacancy"]').forEach(button => button.onclick = () => openModal('vacancy'));
  document.querySelectorAll('[data-action="new-candidate"]').forEach(button => button.onclick = () => openModal('candidate'));
  document.querySelector('[data-action="export"]')?.addEventListener('click', () => alert('Report ready. Connect this action to your preferred export format.'));
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
      <label>Candidate ID<input value="CAN-${new Date().getFullYear()}-${String(data.candidates.length + 53).padStart(4, '0')}" disabled></label>
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
        <label>Source<select name="source"><option>Naukri</option><option>Indeed</option><option>Referral</option><option>Consultant</option><option>Walk-in</option><option>Other</option></select></label>
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
    modal.querySelector('form').onsubmit = event => {
      event.preventDefault();
      const form = new FormData(event.target);
      if (vacancy) {
        data.vacancies.unshift({
          id: `${form.get('department').substring(0, 2).toUpperCase()}-${form.get('title').split(/[\\s-]+/).filter(w => w).map(w => w[0]).join('').toUpperCase()}-${String(data.vacancies.length + 1).padStart(2, '0')}`,
          title: form.get('title'),
          department: form.get('department'),
          location: form.get('location'),
          priority: form.get('priority'),
          owner: form.get('owner') || 'Prateek Sir',
          deadline: form.get('deadline') || '2026-09-30',
          experience: form.get('experience'),
          salary: form.get('salary'),
          applications: 0,
          status: 'Open'
        });
      } else {
        const reqId = form.get('requirement_id');
        const linkedVacancy = data.vacancies.find(v => v.id === reqId);
        data.candidates.unshift({
          id: `CAN-${new Date().getFullYear()}-${String(data.candidates.length + 53).padStart(4, '0')}`,
          requirement_id: reqId,
          name: form.get('name'),
          role: linkedVacancy ? linkedVacancy.title : 'Not Specified',
          phone: form.get('phone'),
          email: form.get('email'),
          source: form.get('source'),
          location: form.get('location'),
          experience: form.get('experience_years') ? form.get('experience_years') + ' Years' : 'Not specified',
          expected: form.get('expected_ctc') || 'Not specified',
          stage: 'CV Screening',
          screening_status: 'Pending Review',
          reason_for_leaving: form.get('reason_for_leaving'),
          remarks: form.get('remarks')
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

// Wait a bit for promises
setTimeout(() => { console.log("Execution finished successfully"); }, 1000);
