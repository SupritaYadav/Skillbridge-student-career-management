import { useEffect, useState } from 'react';
import './App.css';

const API = 'http://localhost:8080/api';

const initialProfile = {
  name: 'Suprita Yadav',
  email: 'suprita@gmail.com',
  phone: '9876543210',
  education: 'BCA — Computer Applications',
  careerGoal: 'Full Stack Java Developer',
  github: 'github.com/SupritaYadav',
  linkedin: 'linkedin.com/in/suprita-yadav',
  bio: 'BCA student building skills in Java, React, SQL and Spring Boot.'
};

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers
    }
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function load(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.sbDark === 'true');
  const [toast, setToast] = useState('');

  const [profile, setProfile] = useState(() => load('sbProfile', initialProfile));
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [resources, setResources] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState({
    skills: true, projects: true, certs: true, goals: true,
    resources: true, opportunities: true, students: true
  });
  const [errors, setErrors] = useState({});

  const notify = (message) => {
    setToast(message);
    clearTimeout(window.sbToast);
    window.sbToast = setTimeout(() => setToast(''), 2500);
  };

  const setModuleError = (module, message) => {
    setErrors((previous) => ({ ...previous, [module]: message }));
  };

  const fetchModule = async (module, endpoint, setter) => {
    try {
      setLoading((previous) => ({ ...previous, [module]: true }));
      setModuleError(module, '');
      const data = await apiRequest(endpoint);
      setter(Array.isArray(data) ? data : []);
    } catch (error) {
      setModuleError(module, error.message);
    } finally {
      setLoading((previous) => ({ ...previous, [module]: false }));
    }
  };

  useEffect(() => {
    fetchModule('skills', '/skills', setSkills);
    fetchModule('projects', '/projects', setProjects);
    fetchModule('certs', '/certifications', setCerts);
    fetchModule('goals', '/learning-goals', setGoals);
    fetchModule('resources', '/resources', setResources);
    fetchModule('opportunities', '/opportunities', setOpportunities);
    fetchModule('students', '/students', setStudents);
  }, []);

  useEffect(() => { localStorage.setItem('sbProfile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('sbDark', dark); }, [dark]);

  const nav = (nextPage) => {
    setPage(nextPage);
    setOpen(false);
    window.scrollTo(0, 0);
  };

  const avg = skills.length
    ? Math.round(skills.reduce((total, skill) => total + Number(skill.progress || 0), 0) / skills.length)
    : 0;

  return (
    <div className={'app ' + (dark ? 'dark' : '')}>
      <Sidebar page={page} nav={nav} open={open} close={() => setOpen(false)} />
      <div className="shell">
        <Header p={profile} menu={() => setOpen(true)} dark={dark} setDark={setDark} />
        <main>
          {page === 'Dashboard' && <Dashboard p={profile} skills={skills} avg={avg} projects={projects} goals={goals} nav={nav} loading={loading} />}
          {page === 'My Profile' && <Profile p={profile} setP={setProfile} notify={notify} />}
          {page === 'Skills' && <Skills skills={skills} setSkills={setSkills} notify={notify} loading={loading.skills} error={errors.skills} setError={setModuleError} />}
          {page === 'Projects' && <Projects data={projects} setData={setProjects} notify={notify} loading={loading.projects} error={errors.projects} setError={setModuleError} />}
          {page === 'Certifications' && <Certs data={certs} setData={setCerts} notify={notify} loading={loading.certs} error={errors.certs} setError={setModuleError} />}
          {page === 'Learning Goals' && <Goals data={goals} setData={setGoals} notify={notify} loading={loading.goals} error={errors.goals} setError={setModuleError} />}
          {page === 'Skill Gap Analyzer' && <Gap profile={profile} />}
          {page === 'Resources' && <Resources data={resources} loading={loading.resources} error={errors.resources} />}
          {page === 'Opportunities' && <Opportunities data={opportunities} loading={loading.opportunities} error={errors.opportunities} />}
          {page === 'Admin / Faculty' && <Admin students={students} setStudents={setStudents} notify={notify} loading={loading.students} error={errors.students} setError={setModuleError} />}
        </main>
        <footer>© 2026 SkillBridge · Student Career & Skill Management System</footer>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function Sidebar({ page, nav, open, close }) {
  const groups = [
    ['MAIN', ['Dashboard']],
    ['MY CAREER', ['My Profile', 'Skills', 'Projects', 'Certifications', 'Learning Goals']],
    ['CAREER TOOLS', ['Skill Gap Analyzer', 'Resources', 'Opportunities']],
    ['MANAGEMENT', ['Admin / Faculty']]
  ];
  const icons = {
    Dashboard: '⌂', 'My Profile': '◯', Skills: '✦', Projects: '▣',
    Certifications: '✓', 'Learning Goals': '◎', 'Skill Gap Analyzer': '⌁',
    Resources: '▤', Opportunities: '↗', 'Admin / Faculty': '⚙'
  };

  return (
    <>
      <div className={open ? 'overlay show' : 'overlay'} onClick={close} />
      <aside className={open ? 'side open' : 'side'}>
        <div className="brand">
          <b>S</b><div><strong>SkillBridge</strong><small>Career & Skill Hub</small></div>
          <button className="x" onClick={close}>×</button>
        </div>
        <nav>
          {groups.map((group) => (
            <section key={group[0]}>
              <label>{group[0]}</label>
              {group[1].map((item) => (
                <button className={page === item ? 'nav active' : 'nav'} key={item} onClick={() => nav(item)}>
                  <i>{icons[item]}</i>{item}
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}

function Header({ p, menu, dark, setDark }) {
  return (
    <header>
      <button className="hamb" onClick={menu}>☰</button>
      <div className="crumb"><b>SkillBridge</b> / {p.careerGoal}</div>
      <div className="actions">
        <button onClick={() => setDark(!dark)}>{dark ? '☀' : '☾'}</button>
        <button>🔔</button>
        <div className="user">
          <span>{initials(p.name)}</span>
          <div><b>{p.name}</b><small>Student</small></div>
        </div>
      </div>
    </header>
  );
}

const initials = (name = '') => name.split(' ').filter(Boolean).map((x) => x[0]).slice(0, 2).join('').toUpperCase();

function Head({ ey, title, sub, action }) {
  return <div className="pageHead"><div><label>{ey}</label><h1>{title}</h1><p>{sub}</p></div>{action}</div>;
}

function Card({ title, action, children }) {
  return <section className="card"><div className="cardHead"><h3>{title}</h3>{action}</div>{children}</section>;
}

function Empty({ text }) {
  return <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>{text}</div>;
}

function ModuleMessage({ loading, error, empty, hasData = true, children }) {
  if (loading) return <p>Loading data...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!hasData) return <Empty text={empty} />;
  return children;
}

function Dashboard({ p, skills, avg, projects, goals, nav, loading }) {
  const list = skills.slice(0, 4);
  return (
    <>
      <section className="hero">
        <div>
          <label>STUDENT DASHBOARD</label>
          <h1>Welcome back, {(p.name || 'Student').split(' ')[0]}! 👋</h1>
          <p>Continue building your skills and achieving your career goals.</p>
          <p>Track your skills, build your profile, and move closer to your career goal.</p>
        </div>
        <button className="primary" onClick={() => nav('Skill Gap Analyzer')}>Analyze Skill Gap →</button>
      </section>
      <div className="stats">
        <Stat icon="✦" label="Skills Tracked" value={loading.skills ? '…' : skills.length} sub="Keep learning" />
        <Stat icon="◒" label="Average Progress" value={loading.skills ? '…' : avg + '%'} sub="Keep improving" />
        <Stat icon="▣" label="Projects" value={loading.projects ? '…' : projects.length} sub="Portfolio items" />
        <Stat icon="◎" label="Learning Goals" value={loading.goals ? '…' : goals.length} sub="Active goals" />
      </div>
      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', marginBottom: '20px', border: '1px solid #e2e8f0' }}>
        <h3>Quick Actions</h3><p>Manage your career development easily.</p>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="primary" onClick={() => nav('My Profile')}>Update Profile</button>
          <button type="button" className="primary" onClick={() => nav('Skills')}>Manage Skills</button>
          <button type="button" className="primary" onClick={() => nav('Projects')}>View Projects</button>
        </div>
      </div>

      <div style={{
  background: "#f8fafc",
  padding: "20px",
  borderRadius: "14px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0"
}}>
  <h3 style={{ color: "#1e293b" }}>Quick Actions</h3>
  <p style={{ color: "#475569" }}>
  Manage your career development easily.
  </p>

  <div style={{
    display: "flex",
    gap: "12px",
    flexWrap: "wrap"
  }}>
    <button
      type="button"
      className="primary"
      onClick={() => nav('My Profile')}
    >
      Update Profile
    </button>

    <button
      type="button"
      className="primary"
      onClick={() => nav('Skills')}
    >
      Manage Skills
    </button>

    <button
      type="button"
      className="primary"
      onClick={() => nav('Projects')}
    >
      View Projects
    </button>
  </div>
</div>

      <div className="grid2">
        <Card title="Skill Progress" action={<button onClick={() => nav('Skills')}>View all →</button>}>
          <ModuleMessage loading={loading.skills} hasData={skills.length > 0} empty="No skills in the database yet. Add your first skill.">
            {list.map((skill) => <Progress key={skill.id} s={skill} />)}
          </ModuleMessage>
        </Card>
        <Card title="Career Goal" action={<button onClick={() => nav('My Profile')}>Edit profile →</button>}>
          <div className="career"><div>🎯</div><section><small>Current target</small><h3>{p.careerGoal}</h3><p>Build the skills required for your target role.</p></section></div>
          <div className="meter"><i style={{ width: Math.min(100, avg + 5) + '%' }} /></div>
          <small className="meterText">Profile readiness <b>{Math.min(100, avg + 5)}%</b></small>
        </Card>
      </div>
    </>
  );
}

function Stat({ icon, label, value, sub }) {
  return <div className="stat"><span>{icon}</span><div><small>{label}</small><strong>{value}</strong><em>{sub}</em></div></div>;
}

function Progress({ s }) {
  return <div className="prog"><div><b>{s.skillName}</b><small>{s.skillLevel}</small><strong>{s.progress}%</strong></div><i><span style={{ width: (s.progress || 0) + '%' }} /></i></div>;
}

function Status({ t }) {
  return <span className={'status ' + (t || 'Planned').toLowerCase().replaceAll(' ', '-')}>{t}</span>;
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return <label className="field"><span>{label}</span><input type={type} value={value ?? ''} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Profile({ p, setP, notify }) {
  const [f, setF] = useState(p);
  const save = (e) => { e.preventDefault(); setP(f); notify('Profile updated successfully'); };
  return (
    <>
      <Head ey="MY CAREER" title="My Profile" sub="Keep your professional information up to date." action={<button className="primary" onClick={save}>Save Changes</button>} />
      <div className="profile">
        <div className="card profileCard">
          <div className="bigAvatar">{initials(f.name)}</div><h2>{f.name}</h2><p>{f.careerGoal}</p>
          <span className="tag">BCA</span><span className="tag">Student</span><hr />
          <small>✉️ {f.email}</small><br /><small>⌕ {f.github}</small><br /><small>in {f.linkedin}</small>
        </div>
        <form className="card form" onSubmit={save}>
          <h3>Personal & Career Information</h3>
          <div className="formGrid">
            <Field label="Full Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
            <Field label="Email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
            <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
            <Field label="Education" value={f.education} onChange={(v) => setF({ ...f, education: v })} />
            <Field label="Career Goal" value={f.careerGoal} onChange={(v) => setF({ ...f, careerGoal: v })} />
            <Field label="GitHub" value={f.github} onChange={(v) => setF({ ...f, github: v })} />
            <Field label="LinkedIn" value={f.linkedin} onChange={(v) => setF({ ...f, linkedin: v })} />
          </div>
          <label className="field full"><span>Bio</span><textarea rows="4" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></label>
          <button className="primary" type="submit">Save Changes</button>
        </form>
      </div>
    </>
  );
}

function Skills({ skills, setSkills, notify, loading, error, setError }) {
  const blank = { skillName: '', skillLevel: 'Intermediate', progress: 50 };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    if (!f.skillName.trim()) return;
    try {
      const payload = { skillName: f.skillName.trim(), skillLevel: f.skillLevel, progress: Number(f.progress) };
      const saved = await apiRequest(edit ? `/skills/${edit}` : '/skills', {
        method: edit ? 'PUT' : 'POST', body: JSON.stringify(payload)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Skill was not saved. Check that the record still exists.');
      setSkills((previous) => edit ? previous.map((s) => s.id === edit ? saved : s) : [...previous, saved]);
      setF(blank); setEdit(null); setError('skills', '');
      notify(edit ? 'Skill updated' : 'Skill added');
    } catch (err) { setError('skills', err.message); notify(err.message); }
  };
  const del = async (id) => {
    try {
      await apiRequest(`/skills/${id}`, { method: 'DELETE' });
      setSkills((previous) => previous.filter((s) => s.id !== id));
      notify('Skill removed');
    } catch (err) { setError('skills', err.message); notify(err.message); }
  };
  return (
    <>
      <Head ey="MY CAREER" title="Skills & Progress" sub="Track technologies and abilities." />
      {error && <p className="error">{error}</p>}
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>{edit ? 'Edit Skill' : 'Add a Skill'}</h3>
          <Field label="Skill Name" value={f.skillName} onChange={(v) => setF({ ...f, skillName: v })} placeholder="e.g. Java" />
          <label className="field"><span>Skill Level</span><select value={f.skillLevel} onChange={(e) => setF({ ...f, skillLevel: e.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          <label className="field"><span>Progress — {f.progress}%</span><input type="range" min="0" max="100" value={f.progress} onChange={(e) => setF({ ...f, progress: Number(e.target.value) })} /></label>
          <button type="submit" className="primary fullBtn">{edit ? 'Update Skill' : 'Add Skill'}</button>
          {edit && <button type="button" className="secondary" onClick={() => { setEdit(null); setF(blank); }}>Cancel Edit</button>}
        </form>
        <Card title="Your Skills">
          <ModuleMessage loading={loading} hasData={skills.length > 0} empty="No skills yet. Add your first skill.">
            {skills.map((skill) => <div className="skillItem" key={skill.id}><Progress s={skill} /><div className="actions">
              <button onClick={() => { setEdit(skill.id); setF({ skillName: skill.skillName, skillLevel: skill.skillLevel, progress: skill.progress }); }}>Edit</button>
              <button onClick={() => del(skill.id)}>Delete</button>
            </div></div>)}
          </ModuleMessage>
        </Card>
      </div>
    </>
  );
}

function Projects({ data, setData, notify, loading, error, setError }) {
  const blank = { title: '', description: '', technologies: '', link: '' };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    try {
      const saved = await apiRequest(edit ? `/projects/${edit}` : '/projects', {
        method: edit ? 'PUT' : 'POST', body: JSON.stringify(f)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Project was not saved. Check that the record still exists.');
      setData((previous) => edit ? previous.map((p) => p.id === edit ? saved : p) : [...previous, saved]);
      setF(blank); setEdit(null); setError('projects', '');
      notify(edit ? 'Project updated' : 'Project added');
    } catch (err) { setError('projects', err.message); notify(err.message); }
  };
  const del = async (id) => {
    try {
      await apiRequest(`/projects/${id}`, { method: 'DELETE' });
      setData((previous) => previous.filter((p) => p.id !== id)); notify('Project removed');
    } catch (err) { setError('projects', err.message); notify(err.message); }
  };
  return (
    <>
      <Head ey="MY CAREER" title="Projects" sub="Showcase your work." />
      {error && <p className="error">{error}</p>}
      <div className="projectGrid">
        <ModuleMessage loading={loading} hasData={data.length > 0} empty="No projects yet. Add your first project below.">
          {data.map((project) => <div className="card project" key={project.id}>
            <div className="projectIcon">▣</div><h3>{project.title}</h3><p>{project.description}</p>
            <div className="tags">{(project.technologies || '').split(',').filter(Boolean).map((t) => <span key={t}>{t.trim()}</span>)}</div>
            <div className="projectFoot"><a href={project.link || '#'} target="_blank" rel="noreferrer">View project ↗️</a>
              <button onClick={() => { setEdit(project.id); setF({ title: project.title, description: project.description, technologies: project.technologies, link: project.link }); }}>Edit</button>
              <button onClick={() => del(project.id)}>Delete</button>
            </div>
          </div>)}
        </ModuleMessage>
      </div>
      <form className="card form" onSubmit={save}>
        <h3>{edit ? 'Edit Project' : 'Add Project'}</h3>
        <div className="formGrid">
          <Field label="Project Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <Field label="Technologies" value={f.technologies} onChange={(v) => setF({ ...f, technologies: v })} />
          <Field label="Project Link" value={f.link} onChange={(v) => setF({ ...f, link: v })} />
        </div>
        <label className="field"><span>Description</span><textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
        <button className="primary">{edit ? 'Update Project' : 'Save Project'}</button>
        {edit && <button type="button" className="secondary" onClick={() => { setEdit(null); setF(blank); }}>Cancel Edit</button>}
      </form>
    </>
  );
}

function Certs({ data, setData, notify, loading, error, setError }) {
  const blank = { name: '', organization: '', date: '', link: '' };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    try {
      const saved = await apiRequest(edit ? `/certifications/${edit}` : '/certifications', {
        method: edit ? 'PUT' : 'POST', body: JSON.stringify(f)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Certification was not saved.');
      setData((previous) => edit ? previous.map((c) => c.id === edit ? saved : c) : [...previous, saved]);
      setF(blank); setEdit(null); setError('certs', ''); notify(edit ? 'Certification updated' : 'Certification added');
    } catch (err) { setError('certs', err.message); notify(err.message); }
  };
  const del = async (id) => {
    try {
      await apiRequest(`/certifications/${id}`, { method: 'DELETE' });
      setData((previous) => previous.filter((c) => c.id !== id)); notify('Certification removed');
    } catch (err) { setError('certs', err.message); notify(err.message); }
  };
  return (
    <>
      <Head ey="MY CAREER" title="Certifications" sub="Manage credentials." />
      {error && <p className="error">{error}</p>}
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>{edit ? 'Edit Certification' : 'Add Certification'}</h3>
          <Field label="Certificate Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
          <Field label="Issuing Organization" value={f.organization} onChange={(v) => setF({ ...f, organization: v })} />
          <Field label="Issue Date" type="date" value={f.date} onChange={(v) => setF({ ...f, date: v })} />
          <Field label="Certificate Link" value={f.link} onChange={(v) => setF({ ...f, link: v })} />
          <button className="primary fullBtn">{edit ? 'Update Certification' : 'Add Certification'}</button>
          {edit && <button type="button" className="secondary" onClick={() => { setEdit(null); setF(blank); }}>Cancel Edit</button>}
        </form>
        <Card title="Your Certifications">
          <ModuleMessage loading={loading} hasData={data.length > 0} empty="No certifications added yet.">
            {data.map((c) => <div className="cert" key={c.id}><b>✓</b><div><strong>{c.name}</strong><small>{c.organization} · {c.date}</small>
              {c.link && <a href={c.link} target="_blank" rel="noreferrer">View certificate</a>}</div>
              <button onClick={() => { setEdit(c.id); setF({ name: c.name, organization: c.organization, date: c.date || '', link: c.link || '' }); }}>Edit</button>
              <button onClick={() => del(c.id)}>×</button></div>)}
          </ModuleMessage>
        </Card>
      </div>
    </>
  );
}

function Goals({ data, setData, notify, loading, error, setError }) {
  const blank = { title: '', description: '', target: '', status: 'Planned' };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    try {
      const payload = { title: f.title, description: f.description, targetDate: f.target || null, status: f.status };
      const saved = await apiRequest(edit ? `/learning-goals/${edit}` : '/learning-goals', {
        method: edit ? 'PUT' : 'POST', body: JSON.stringify(payload)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Learning goal was not saved.');
      const mapped = { ...saved, target: saved.targetDate || '' };
      setData((previous) => edit ? previous.map((g) => g.id === edit ? mapped : g) : [...previous, mapped]);
      setF(blank); setEdit(null); setError('goals', ''); notify(edit ? 'Learning goal updated' : 'Learning goal added');
    } catch (err) { setError('goals', err.message); notify(err.message); }
  };
  const cycle = async (goal) => {
    const nextStatus = goal.status === 'Planned' ? 'In Progress' : goal.status === 'In Progress' ? 'Completed' : 'Planned';
    try {
      const saved = await apiRequest(`/learning-goals/${goal.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: goal.title, description: goal.description, targetDate: goal.target || null, status: nextStatus })
      });
      if (!saved) throw new Error('Unable to update this goal.');
      setData((previous) => previous.map((g) => g.id === goal.id ? { ...saved, target: saved.targetDate || '' } : g));
    } catch (err) { setError('goals', err.message); notify(err.message); }
  };
  const del = async (id) => {
    try {
      await apiRequest(`/learning-goals/${id}`, { method: 'DELETE' });
      setData((previous) => previous.filter((g) => g.id !== id)); notify('Learning goal removed');
    } catch (err) { setError('goals', err.message); notify(err.message); }
  };
  return (
    <>
      <Head ey="MY CAREER" title="Learning Goals" sub="Track learning milestones." />
      {error && <p className="error">{error}</p>}
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>{edit ? 'Edit Goal' : 'Set a Goal'}</h3>
          <Field label="Goal Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <Field label="Target Date" type="date" value={f.target} onChange={(v) => setF({ ...f, target: v })} />
          <label className="field"><span>Description</span><textarea rows="4" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></label>
          <button className="primary fullBtn">{edit ? 'Update Goal' : 'Create Goal'}</button>
          {edit && <button type="button" className="secondary" onClick={() => { setEdit(null); setF(blank); }}>Cancel Edit</button>}
        </form>
        <Card title="My Goals">
          <ModuleMessage loading={loading} hasData={data.length > 0} empty="No learning goals yet. Create your first goal.">
            {data.map((g) => <div className="goal" key={g.id}><div><strong>{g.title}</strong><p>{g.description}</p><small>Target: {g.target || g.targetDate || 'Not set'}</small></div>
              <div className="actions"><button onClick={() => { setEdit(g.id); setF({ title: g.title, description: g.description || '', target: g.target || g.targetDate || '', status: g.status || 'Planned' }); }}>Edit</button>
                <button onClick={() => cycle(g)}><Status t={g.status} /></button><button onClick={() => del(g.id)}>Delete</button></div></div>)}
          </ModuleMessage>
        </Card>
      </div>
    </>
  );
}

function Gap({ profile }) {
  const careerGoal = profile?.careerGoal || 'Full Stack Java Developer';
  const [required, setRequired] = useState([]);
  const [missing, setMissing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        setLoading(true); setError('');
        const data = await apiRequest(`/skill-gap/analyze?careerGoal=${encodeURIComponent(careerGoal)}`);
        setRequired(data.requiredSkills || []); setMissing(data.missingSkills || []);
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    };
    fetchSkillGap();
  }, [careerGoal]);

  return (
    <>
      <Head ey="CAREER TOOLS" title="Skill Gap Analyzer" sub="Compare your skills with your target career role." />
      {loading ? <p>Analyzing your skills...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : <div className="grid2">
        <Card title={`Required for ${careerGoal}`}><div className="tags" style={{ padding: '10px 0' }}>
          {required.map((r) => <span key={r} style={{ margin: '4px', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>{r}</span>)}
        </div></Card>
        <Card title="Missing Skills to Acquire">{missing.length ? <div className="tags" style={{ padding: '10px 0' }}>
          {missing.map((m) => <span key={m} style={{ margin: '4px', padding: '6px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>{m}</span>)}
        </div> : <p style={{ color: 'green', fontWeight: 'bold' }}>Awesome! You have all the core skills for this role.</p>}</Card>
      </div>}
    </>
  );
}

function Resources({ data, loading, error }) {
  return (
    <>
      <Head ey="CAREER TOOLS" title="Resources" sub="Curated learning materials for your growth." />
      {error && <p className="error">{error}</p>}
      <div className="projectGrid"><ModuleMessage loading={loading} hasData={data.length > 0} empty="No resources are available in the database yet.">
        {data.map((res) => <div className="card project" key={res.id}><div className="projectIcon">{res.icon || '▤'}</div>
          <h3>{res.title}</h3><p>Category: {res.category} · {res.type}</p><span className="tag">{res.level}</span></div>)}
      </ModuleMessage></div>
    </>
  );
}

function Opportunities({ data, loading, error }) {
  return (
    <>
      <Head ey="CAREER TOOLS" title="Opportunities" sub="Explore internships and jobs suited for you." />
      {error && <p className="error">{error}</p>}
      <div className="projectGrid"><ModuleMessage loading={loading} hasData={data.length > 0} empty="No opportunities are available in the database yet.">
        {data.map((opp) => <div className="card project" key={opp.id}><div className="projectIcon">↗️</div>
          <h3>{opp.title}</h3><p><b>{opp.company}</b> · {opp.type} ({opp.location})</p><p>{opp.description}</p>
          {opp.deadline && <small>Deadline: {opp.deadline}</small>}
          {opp.applicationLink && <div className="projectFoot"><a href={opp.applicationLink} target="_blank" rel="noreferrer">Apply / View ↗</a></div>}
        </div>)}
      </ModuleMessage></div>
    </>
  );
}

function Admin({ students, setStudents, notify, loading, error, setError }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', careerGoal: '' });
  const [edit, setEdit] = useState(null);

  const saveStudent = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim()) return;
    try {
      const saved = await apiRequest(edit ? `/students/${edit}` : '/students', {
        method: edit ? 'PUT' : 'POST', body: JSON.stringify(f)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Student was not saved. Check that the record still exists.');
      setStudents((previous) => edit ? previous.map((s) => s.id === edit ? saved : s) : [...previous, saved]);
      setF({ name: '', email: '', phone: '', careerGoal: '' }); setEdit(null); setError('students', '');
      notify(edit ? 'Student updated successfully' : 'Student added successfully');
    } catch (err) { setError('students', err.message); notify(err.message); }
  };

  const removeStudent = async (id) => {
    try {
      await apiRequest(`/students/${id}`, { method: 'DELETE' });
      setStudents((previous) => previous.filter((s) => s.id !== id));
      notify('Student removed successfully');
    } catch (err) { setError('students', err.message); notify(err.message); }
  };

  return (
    <>
      <Head ey="MANAGEMENT" title="Admin / Faculty Dashboard" sub="View and manage students registered in the database." />
      {error && <p className="error">{error}</p>}
      <div className="two">
        <form className="card form" onSubmit={saveStudent}>
          <h3>{edit ? 'Edit Student' : 'Add Student'}</h3>
          <Field label="Full Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
          <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
          <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
          <Field label="Career Goal" value={f.careerGoal} onChange={(v) => setF({ ...f, careerGoal: v })} />
          <button className="primary fullBtn">{edit ? 'Update Student' : 'Add Student'}</button>
          {edit && <button type="button" className="secondary" onClick={() => { setEdit(null); setF({ name: '', email: '', phone: '', careerGoal: '' }); }}>Cancel Edit</button>}
        </form>
        <Card title="Student Directory">
          <ModuleMessage loading={loading} hasData={students.length > 0} empty="No students found in the database.">
            {students.map((s) => <div className="line" key={s.id}><div><b>{s.name}</b><small>{s.email} · Target: {s.careerGoal || 'Not specified'}</small></div>
              <button className="secondary" onClick={() => { setEdit(s.id); setF({ name: s.name || '', email: s.email || '', phone: s.phone || '', careerGoal: s.careerGoal || '' }); }}>Edit</button>
              <button className="secondary" onClick={() => removeStudent(s.id)}>Remove</button></div>)}
          </ModuleMessage>
        </Card>
      </div>
    </>
  );
}

export default App;