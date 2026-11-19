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

function getToken() {
  return localStorage.getItem('sbToken') || sessionStorage.getItem('sbToken');
}

function getCurrentRole() {
  try {
    const token = getToken();
    if (!token) return '';
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return String(payload.role || '').toUpperCase();
  } catch {
    return '';
  }
}

async function apiRequest(path, options = {}) {
  const token = getToken();

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
  const [role] = useState(getCurrentRole);
  const [studentId, setStudentId] = useState(null);

  const [profile, setProfile] = useState(() => load('sbProfile', initialProfile));
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);
  const [goals, setGoals] = useState([]);
  const [resources, setResources] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [students, setStudents] = useState([]);
  const [users, setUsers] = useState([]);

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

    if (role === 'STUDENT') {
      (async () => {
        try {
          const me = await apiRequest('/students/me');
          setStudentId(me?.id ?? null);
          setProfile((previous) => ({
            ...previous,
            name: me?.name || previous.name,
            email: me?.email || previous.email,
            phone: me?.phone || '',
            careerGoal: me?.careerGoal || previous.careerGoal
          }));
        } catch (error) {
          setModuleError('profile', error.message);
        }
      })();
    } else if (role === 'FACULTY' || role === 'ADMIN') {
      fetchModule('students', '/students', setStudents);
      if (role === 'ADMIN') fetchModule('users', '/admin/users', setUsers);
    } else {
      setLoading((previous) => ({ ...previous, students: false }));
    }
  }, [role]);

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

  const logout = () => {
    localStorage.removeItem('sbToken');
    sessionStorage.removeItem('sbToken');
    localStorage.removeItem('sbUser');
    window.location.reload();
  };

  if (!getToken()) {
    return <AuthPage onAuthenticated={() => window.location.reload()} />;
  }

  return (
    <div className={'app ' + (dark ? 'dark' : '')}>
      <Sidebar page={page} nav={nav} open={open} close={() => setOpen(false)} role={role} />
      <div className="shell">
        <Header p={profile} menu={() => setOpen(true)} dark={dark} setDark={setDark} role={role} onLogout={logout} />
        <main>
          {page === 'Dashboard' && <Dashboard role={role} p={profile} skills={skills} avg={avg} projects={projects} goals={goals} students={students} users={users} resources={resources} opportunities={opportunities} nav={nav} loading={loading} />}
          {page === 'My Profile' && <Profile p={profile} setP={setProfile} notify={notify} role={role} studentId={studentId} />}
          {page === 'Skills' && <Skills skills={skills} setSkills={setSkills} notify={notify} loading={loading.skills} error={errors.skills} setError={setModuleError} />}
          {page === 'Projects' && <Projects data={projects} setData={setProjects} notify={notify} loading={loading.projects} error={errors.projects} setError={setModuleError} />}
          {page === 'Certifications' && <Certs data={certs} setData={setCerts} notify={notify} loading={loading.certs} error={errors.certs} setError={setModuleError} />}
          {page === 'Learning Goals' && <Goals data={goals} setData={setGoals} notify={notify} loading={loading.goals} error={errors.goals} setError={setModuleError} />}
          {page === 'Skill Gap Analyzer' && <Gap profile={profile} />}
          {page === 'Resources' && <Resources role={role} data={resources} setData={setResources} loading={loading.resources} error={errors.resources} notify={notify} />}
          {page === 'Opportunities' && <Opportunities role={role} data={opportunities} setData={setOpportunities} loading={loading.opportunities} error={errors.opportunities} notify={notify} />}
          {page === 'Admin / Faculty' && (role === 'ADMIN' || role === 'FACULTY') && <Admin role={role} students={students} setStudents={setStudents} users={users} setUsers={setUsers} notify={notify} loading={loading.students} error={errors.students} setError={setModuleError} />}
        </main>
        <footer>© 2026 SkillBridge · Student Career & Skill Management System</footer>
      </div>
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login');
  const [roleChoice, setRoleChoice] = useState('STUDENT');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const body = mode === 'login' ? { email: email.trim(), password } : { name: name.trim(), email: email.trim(), password };
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(body)
      });
      const text = await response.text();
      let data;
      try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
      if (!response.ok) throw new Error(data.message || data.error || text || `Request failed (${response.status})`);
      if (!data.token) throw new Error('Authentication response did not contain a token.');
      const actualRole = String(data.role || '').toUpperCase();
      if (mode === 'login' && actualRole !== roleChoice) {
        throw new Error(`This account is registered as ${actualRole || 'an unknown role'}. Choose the matching sign-in type.`);
      }
      if (remember) {
        localStorage.setItem('sbToken', data.token);
        sessionStorage.removeItem('sbToken');
      } else {
        sessionStorage.setItem('sbToken', data.token);
        localStorage.removeItem('sbToken');
      }
      localStorage.setItem('sbUser', JSON.stringify(data));
      localStorage.setItem('sbProfile', JSON.stringify({
        ...initialProfile,
        name: data.name || name || 'SkillBridge User',
        email: data.email || email
      }));
      onAuthenticated();
    } catch (err) {
      setError(err.message || 'Unable to connect to the server. Please check that the backend is running.');
    } finally {
      setBusy(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(''); setPassword(''); setName('');
  };

  return (
    <div className="auth-page">
      <section className="auth-layout">
        <aside className="auth-story">
          <div className="auth-brand">
            <span className="auth-brand-mark">S</span>
            <span><strong>SkillBridge</strong><small>CAREER &amp; SKILL HUB</small></span>
          </div>
          <div className="auth-story-copy">
            <span className="auth-eyebrow">YOUR CAREER, CONNECTED</span>
            <h1>Build skills.<br />Shape your future.</h1>
            <p>Bring your learning, projects and career opportunities together in one place.</p>
          </div>
          <div className="auth-illustration" aria-hidden="true">
            <div className="auth-orbit orbit-one" /><div className="auth-orbit orbit-two" />
            <div className="auth-board">
              <div className="auth-board-head"><span className="auth-plus">✦</span><span><b>Your growth, in sync</b><small>One connected career journey</small></span><i>•••</i></div>
              <div className="auth-chart"><span /><span /><span /><span /><span /><span /><span /></div>
              <div className="auth-board-foot"><span /><span /><span /></div>
            </div>
            <div className="auth-float-card"><b>✓</b><span><strong>Keep moving forward</strong><small>Progress adds up</small></span></div>
          </div>
          <div className="auth-story-footer">SkillBridge · Student Career &amp; Skill Management System</div>
        </aside>

        <section className="auth-panel">
          <form className="auth-form" onSubmit={submit}>
            <div className="auth-mobile-brand"><span className="auth-brand-mark">S</span><b>SkillBridge</b></div>
            <div className="auth-heading">
              <span className="auth-eyebrow">{mode === 'login' ? 'WELCOME TO SKILLBRIDGE' : 'START YOUR JOURNEY'}</span>
              <h2>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
              <p>{mode === 'login' ? 'Sign in to continue to your career dashboard.' : 'Create a student account and take the next step.'}</p>
            </div>

            {mode === 'login' && <div className="auth-role-wrap">
              <label>Sign in as</label>
              <div className="auth-role-switch" role="group" aria-label="Sign in role">
                {[['STUDENT', '♙', 'Student'], ['FACULTY', '♧', 'Faculty'], ['ADMIN', '⚙', 'Admin']].map(([value, icon, label]) => (
                  <button type="button" key={value} className={roleChoice === value ? 'selected' : ''} onClick={() => { setRoleChoice(value); setError(''); }}>
                    <span>{icon}</span>{label}
                  </button>
                ))}
              </div>
            </div>}

            {mode === 'register' && <label className="auth-field"><span>Full name</span><div className="auth-input-wrap"><span>♙</span><input required autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" /></div></label>}
            <label className="auth-field"><span>Email address</span><div className="auth-input-wrap"><span>✉</span><input required type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" /></div></label>
            <label className="auth-field"><span>Password</span><div className="auth-input-wrap"><span>♙</span><input required minLength={mode === 'register' ? 8 : undefined} type={showPassword ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'register' ? 'At least 8 characters' : 'Enter your password'} /><button type="button" className="auth-eye" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword(!showPassword)}>{showPassword ? '◉' : '◎'}</button></div></label>

            {mode === 'login' && <div className="auth-options"><label className="auth-remember"><input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} /> Remember me</label><button type="button" className="auth-link" onClick={() => setError('Password reset is not configured yet. Please contact your SkillBridge administrator.')}>Forgot password?</button></div>}
            {error && <p className="auth-error" role="alert">{error}</p>}
            <button className="auth-submit" disabled={busy} type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <span>→</span></button>
            <p className="auth-switch">{mode === 'login' ? "Don't have an account?" : 'Already registered?'} <button type="button" onClick={switchMode}>{mode === 'login' ? 'Create account' : 'Sign in'}</button></p>
            {mode === 'register' && <p className="auth-register-note">New registrations are created as Student accounts. Faculty and Admin accounts are provisioned by an administrator.</p>}
          </form>
        </section>
      </section>
    </div>
  );
}
const authInputStyle = { display: 'block', boxSizing: 'border-box', width: '100%', marginTop: '7px', padding: '12px', border: '1px solid #cbd5e1', borderRadius: '8px', outlineColor: '#5969dc', fontSize: '15px' };

function Sidebar({ page, nav, open, close, role }) {
  const groups = role === 'STUDENT' ? [
    ['MAIN', ['Dashboard']],
    ['MY CAREER', ['My Profile', 'Skills', 'Projects', 'Certifications', 'Learning Goals']],
    ['CAREER TOOLS', ['Skill Gap Analyzer', 'Resources', 'Opportunities']]
  ] : [
    ['MAIN', ['Dashboard']],
    ['OVERVIEW', ['Resources', 'Opportunities']],
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

function Header({ p, menu, dark, setDark, role, onLogout }) {
  return (
    <header>
      <button className="hamb" onClick={menu}>☰</button>
      <div className="crumb"><b>SkillBridge</b> / {p.careerGoal}</div>
      <div className="actions">
        <button onClick={() => setDark(!dark)}>{dark ? '☀' : '☾'}</button>
        <button>🔔</button>
        <div className="user">
          <span>{initials(p.name)}</span>
          <div><b>{p.name}</b><small>{role}</small></div>
          <button title="Logout" onClick={onLogout}>Logout</button>
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

function Dashboard({ role = 'STUDENT', p, skills, avg, projects, goals, students = [], users = [], resources = [], opportunities = [], nav, loading }) {
  if (role === 'ADMIN') {
    const facultyCount = users.filter((user) => String(user.role || '').toUpperCase() === 'FACULTY').length;
    const studentCount = users.filter((user) => String(user.role || '').toUpperCase() === 'STUDENT').length || students.length;
    return (
      <>
        <section className="hero">
          <div>
            <label>ADMIN DASHBOARD</label>
            <h1>Welcome back, {(p.name || 'Administrator').split(' ')[0]}! 👋</h1>
            <p>Manage users and oversee the SkillBridge career platform.</p>
            <p>Monitor learners, faculty, learning resources and career opportunities from one workspace.</p>
          </div>
        </section>
        <div className="stats">
          <Stat icon="♙" label="Total Students" value={loading.users || loading.students ? '…' : studentCount} sub="Registered learners" />
          <Stat icon="♧" label="Total Faculty" value={loading.users ? '…' : facultyCount} sub="Faculty accounts" />
          <Stat icon="▤" label="Resources" value={loading.resources ? '…' : resources.length} sub="Learning materials" />
          <Stat icon="↗" label="Opportunities" value={loading.opportunities ? '…' : opportunities.length} sub="Career listings" />
        </div>
        <section className="card adminWelcome">
          <h2>Platform Management</h2>
          <p>Choose an area to manage the SkillBridge platform.</p>
          <div className="adminActions">
            <button type="button" className="primary" onClick={() => nav('Admin / Faculty')}>Manage Users & Faculty</button>
            <button type="button" className="primary" onClick={() => nav('Resources')}>Manage Resources</button>
            <button type="button" className="primary" onClick={() => nav('Opportunities')}>Manage Opportunities</button>
          </div>
        </section>
        <div className="grid2">
          <Card title="Recent platform overview"><p className="adminOverviewText">{studentCount} student accounts · {facultyCount} faculty accounts</p><p className="adminOverviewText">{resources.length} learning resources · {opportunities.length} opportunities</p></Card>
          <Card title="Administration"><p className="adminOverviewText">Create faculty accounts, manage user roles and review registered students.</p><button type="button" className="secondary" onClick={() => nav('Admin / Faculty')}>Open Admin / Faculty →</button></Card>
        </div>
      </>
    );
  }

  const list = skills.slice(0, 4);
  return (
    <>
      <section className="hero">
        <div>
          <label>{role} DASHBOARD</label>
          <h1>Welcome back, {(p.name || role.charAt(0) + role.slice(1).toLowerCase()).split(' ')[0]}! 👋</h1>
          <p>{role === 'STUDENT' ? 'Continue building your skills and achieving your career goals.' : 'Review student progress and support their career development.'}</p>
          <p>{role === 'STUDENT' ? 'Track your skills, build your profile, and move closer to your career goal.' : 'Use the management workspace to review platform activity and support learners.'}</p>
        </div>
        {role === 'STUDENT' && <button className="primary" onClick={() => nav('Skill Gap Analyzer')}>Analyze Skill Gap →</button>}
      </section>
      <div className="stats">
        <Stat icon="✦" label="Skills Tracked" value={loading.skills ? '…' : skills.length} sub="Keep learning" />
        <Stat icon="◒" label="Average Progress" value={loading.skills ? '…' : avg + '%'} sub="Keep improving" />
        <Stat icon="▣" label="Projects" value={loading.projects ? '…' : projects.length} sub="Portfolio items" />
        <Stat icon="◎" label="Learning Goals" value={loading.goals ? '…' : goals.length} sub="Active goals" />
      </div>
      {role === 'STUDENT' && <div className="studentQuickActions">
        <h3>Quick Actions</h3><p>Manage your career development easily.</p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="primary" onClick={() => nav('My Profile')}>Update Profile</button>
          <button type="button" className="primary" onClick={() => nav('Skills')}>Manage Skills</button>
          <button type="button" className="primary" onClick={() => nav('Projects')}>View Projects</button>
        </div>
      </div>}
              <div className="grid2">
        <Card title="Skill Progress" action={<button onClick={() => nav('Skills')}>View all →</button>}>
          <ModuleMessage loading={loading.skills} hasData={skills.length > 0} empty="No skills in the database yet. Add your first skill.">{list.map((skill) => <Progress key={skill.id} s={skill} />)}</ModuleMessage>
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

function Profile({ p, setP, notify, role, studentId }) {
  const [f, setF] = useState(p);
  useEffect(() => { setF(p); }, [p]);
  const save = async (e) => {
    e?.preventDefault?.();
    try {
      if (role === 'STUDENT') {
        if (!studentId) throw new Error('Student profile is not loaded yet. Please refresh and try again.');
        const saved = await apiRequest(`/students/${studentId}`, {
          method: 'PUT',
          body: JSON.stringify({ name: f.name, phone: f.phone, careerGoal: f.careerGoal })
        });
        setP((previous) => ({ ...previous, ...f, name: saved?.name || f.name, phone: saved?.phone || f.phone, careerGoal: saved?.careerGoal || f.careerGoal }));
      } else {
        setP(f);
      }
      notify('Profile updated successfully');
    } catch (error) {
      notify(error.message);
    }
  };
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

    // Reset edit mode if the deleted skill was being edited
    if (edit === id) {
      setEdit(null);
      setF(blank);
    }

    setError('skills', '');
    notify('Skill removed');
  } catch (err) {
    setError('skills', err.message);
    notify(err.message);
  }
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

function Resources({ role, data, setData, loading, error, notify }) {
  const canManage = role === 'ADMIN' || role === 'FACULTY';
  const blank = { icon: '▤', title: '', type: 'Course', category: '', level: 'Beginner' };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    try {
      const saved = await apiRequest(editId ? `/resources/${editId}` : '/resources', { method: editId ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setData((prev) => editId ? prev.map((item) => item.id === editId ? saved : item) : [...prev, saved]);
      setForm(blank); setEditId(null); notify(editId ? 'Resource updated' : 'Resource added');
    } catch (err) { notify(err.message); }
  };
  const remove = async (id) => {
    try { await apiRequest(`/resources/${id}`, { method: 'DELETE' }); setData((prev) => prev.filter((item) => item.id !== id)); notify('Resource deleted'); }
    catch (err) { notify(err.message); }
  };
  return (
    <>
      <Head ey="CAREER TOOLS" title="Resources" sub="Curated learning materials for your growth." />
      {error && <p className="error">{error}</p>}
      {canManage && <form className="card form" onSubmit={save} style={{ marginBottom: 20 }}>
        <h3>{editId ? 'Edit Resource' : 'Add Learning Resource'}</h3>
        <div className="formGrid"><Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><Field label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v })} /><Field label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} /><Field label="Level" value={form.level} onChange={(v) => setForm({ ...form, level: v })} /></div>
        <div className="actions"><button className="primary">{editId ? 'Update Resource' : 'Add Resource'}</button>{editId && <button type="button" className="secondary" onClick={() => { setEditId(null); setForm(blank); }}>Cancel</button>}</div>
      </form>}
      <div className="projectGrid"><ModuleMessage loading={loading} hasData={data.length > 0} empty="No resources are available in the database yet.">
        {data.map((res) => <div className="card project" key={res.id}><div className="projectIcon">{res.icon || '▤'}</div>
          <h3>{res.title}</h3><p>Category: {res.category} · {res.type}</p><span className="tag">{res.level}</span>
          {canManage && <div className="actions" style={{ marginTop: 12 }}><button className="secondary" onClick={() => { setEditId(res.id); setForm({ icon: res.icon || '▤', title: res.title || '', category: res.category || '', type: res.type || 'Course', level: res.level || 'Beginner' }); }}>Edit</button><button className="secondary" onClick={() => remove(res.id)}>Delete</button></div>}
        </div>)}
      </ModuleMessage></div>
    </>
  );
}

function Opportunities({ role, data, setData, loading, error, notify }) {
  const canManage = role === 'ADMIN' || role === 'FACULTY';
  const blank = { title: '', company: '', type: 'Internship', location: 'Remote', description: '', applicationLink: '', deadline: '' };
  const [form, setForm] = useState(blank);
  const [editId, setEditId] = useState(null);
  const save = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, deadline: form.deadline || null };
      const saved = await apiRequest(editId ? `/opportunities/${editId}` : '/opportunities', { method: editId ? 'PUT' : 'POST', body: JSON.stringify(payload) });
      setData((prev) => editId ? prev.map((item) => item.id === editId ? saved : item) : [...prev, saved]);
      setForm(blank); setEditId(null); notify(editId ? 'Opportunity updated' : 'Opportunity added');
    } catch (err) { notify(err.message); }
  };
  const remove = async (id) => {
    try { await apiRequest(`/opportunities/${id}`, { method: 'DELETE' }); setData((prev) => prev.filter((item) => item.id !== id)); notify('Opportunity deleted'); }
    catch (err) { notify(err.message); }
  };
  return (
    <>
      <Head ey="CAREER TOOLS" title="Opportunities" sub="Explore internships and jobs suited for you." />
      {error && <p className="error">{error}</p>}
      {canManage && <form className="card form" onSubmit={save} style={{ marginBottom: 20 }}>
        <h3>{editId ? 'Edit Opportunity' : 'Add Opportunity'}</h3>
        <div className="formGrid"><Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} /><Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} /><Field label="Type" value={form.type} onChange={(v) => setForm({ ...form, type: v })} /><Field label="Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} /><Field label="Application Link" value={form.applicationLink} onChange={(v) => setForm({ ...form, applicationLink: v })} /><Field label="Deadline" type="date" value={form.deadline} onChange={(v) => setForm({ ...form, deadline: v })} /></div>
        <label className="field"><span>Description</span><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>
        <div className="actions"><button className="primary">{editId ? 'Update Opportunity' : 'Add Opportunity'}</button>{editId && <button type="button" className="secondary" onClick={() => { setEditId(null); setForm(blank); }}>Cancel</button>}</div>
      </form>}
      <div className="projectGrid"><ModuleMessage loading={loading} hasData={data.length > 0} empty="No opportunities are available in the database yet.">
        {data.map((opp) => <div className="card project" key={opp.id}><div className="projectIcon">↗️</div>
          <h3>{opp.title}</h3><p><b>{opp.company}</b> · {opp.type} ({opp.location})</p><p>{opp.description}</p>
          {opp.deadline && <small>Deadline: {opp.deadline}</small>}
          {opp.applicationLink && <div className="projectFoot"><a href={opp.applicationLink} target="_blank" rel="noreferrer">Apply / View ↗</a></div>}
          {canManage && <div className="actions" style={{ marginTop: 12 }}><button className="secondary" onClick={() => { setEditId(opp.id); setForm({ title: opp.title || '', company: opp.company || '', type: opp.type || 'Internship', location: opp.location || 'Remote', description: opp.description || '', applicationLink: opp.applicationLink || '', deadline: opp.deadline || '' }); }}>Edit</button><button className="secondary" onClick={() => remove(opp.id)}>Delete</button></div>}
        </div>)}
      </ModuleMessage></div>
    </>
  );
}

function Admin({ role, students, setStudents, users = [], setUsers = () => {}, notify, loading, error, setError }) {
  const [f, setF] = useState({ name: '', email: '', phone: '', careerGoal: '' });
  const [facultyForm, setFacultyForm] = useState({ name: '', email: '', password: '' });
  const [edit, setEdit] = useState(null);

  const saveStudent = async (e) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim()) return;
    try {
      if (!edit) return;
      const saved = await apiRequest(`/students/${edit}`, {
        method: 'PUT', body: JSON.stringify(f)
      });
      if (!saved || typeof saved !== 'object') throw new Error('Student was not saved. Check that the record still exists.');
      setStudents((previous) => edit ? previous.map((s) => s.id === edit ? saved : s) : [...previous, saved]);
      setF({ name: '', email: '', phone: '', careerGoal: '' }); setEdit(null); setError('students', '');
      notify('Student updated successfully');
    } catch (err) { setError('students', err.message); notify(err.message); }
  };



  const createFaculty = async (e) => {
    e.preventDefault();
    try {
      const saved = await apiRequest('/admin/users', { method: 'POST', body: JSON.stringify(facultyForm) });
      setUsers((previous) => [...previous, saved]);
      setFacultyForm({ name: '', email: '', password: '' });
      notify('Faculty account created successfully');
    } catch (err) { notify(err.message); }
  };

  const toggleUser = async (user) => {
    try {
      const saved = await apiRequest(`/admin/users/${user.id}/enabled`, { method: 'PUT', body: JSON.stringify({ enabled: !user.enabled }) });
      setUsers((previous) => previous.map((item) => item.id === user.id ? saved : item));
      notify(saved.enabled ? 'Account enabled' : 'Account disabled');
    } catch (err) { notify(err.message); }
  };

  const changeUserRole = async (user, nextRole) => {
    try {
      const saved = await apiRequest(`/admin/users/${user.id}/role`, { method: 'PUT', body: JSON.stringify({ role: nextRole }) });
      setUsers((previous) => previous.map((item) => item.id === user.id ? saved : item));
      notify(`${user.name}'s role updated to ${nextRole}`);
    } catch (err) { notify(err.message); }
  };



  return (
    <>
      <Head ey="MANAGEMENT" title={role === 'ADMIN' ? 'Admin Control Center' : 'Faculty Workspace'} sub={role === 'ADMIN' ? 'Manage faculty accounts and review registered students.' : 'Review student profiles and career progress.'} />
      {error && <p className="error">{error}</p>}
      {role === 'ADMIN' && <div className="two" style={{ marginBottom: 22 }}>
        <form className="card form" onSubmit={createFaculty}>
          <h3>Create Faculty Account</h3>
          <Field label="Full Name" value={facultyForm.name} onChange={(v) => setFacultyForm({ ...facultyForm, name: v })} />
          <Field label="Email" type="email" value={facultyForm.email} onChange={(v) => setFacultyForm({ ...facultyForm, email: v })} />
          <Field label="Temporary Password (min. 8 characters)" type="password" value={facultyForm.password} onChange={(v) => setFacultyForm({ ...facultyForm, password: v })} />
          <button className="primary fullBtn">Create Faculty</button>
        </form>
        <Card title="User Accounts">
          {users.length ? users.map((u) => <div className="line" key={u.id}><div><b>{u.name}</b><small>{u.email} · {u.enabled ? 'Active' : 'Disabled'}</small></div>{u.role !== 'ADMIN' && <select aria-label={`Role for ${u.name}`} value={u.role} onChange={(e) => changeUserRole(u, e.target.value)}><option value="STUDENT">STUDENT</option><option value="FACULTY">FACULTY</option></select>}<span className="tag">{u.role}</span><button className="secondary" onClick={() => toggleUser(u)}>{u.enabled ? 'Disable' : 'Enable'}</button></div>) : <Empty text="No user accounts loaded." />}
        </Card>
      </div>}
      <div className="two">
        {role === 'ADMIN' && edit && <form className="card form" onSubmit={saveStudent}>
          <h3>Edit Student Profile</h3>
          <Field label="Full Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
          <Field label="Email" type="email" value={f.email} onChange={(v) => setF({ ...f, email: v })} />
          <Field label="Phone" value={f.phone} onChange={(v) => setF({ ...f, phone: v })} />
          <Field label="Career Goal" value={f.careerGoal} onChange={(v) => setF({ ...f, careerGoal: v })} />
          <button className="primary fullBtn">Update Student</button>
          <button type="button" className="secondary" onClick={() => { setEdit(null); setF({ name: '', email: '', phone: '', careerGoal: '' }); }}>Cancel Edit</button>
        </form>}
        <Card title="Student Directory">
          <ModuleMessage loading={loading} hasData={students.length > 0} empty="No students found in the database.">
            {students.map((s) => <div className="line" key={s.id}><div><b>{s.name}</b><small>{s.email} · Target: {s.careerGoal || 'Not specified'}</small></div>
              {role === 'ADMIN' && <>
                <button className="secondary" onClick={() => { setEdit(s.id); setF({ name: s.name || '', email: s.email || '', phone: s.phone || '', careerGoal: s.careerGoal || '' }); }}>Edit</button>
              </>}</div>)}
          </ModuleMessage>
        </Card>
      </div>
    </>
  );
}

export default App;