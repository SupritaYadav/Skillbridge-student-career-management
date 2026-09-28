import { useEffect, useState } from 'react';
import './App.css';

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

const initialProjects = [
  {
    id: 1,
    title: 'SkillBridge',
    description: 'Student skill and career management system.',
    technologies: 'React, Spring Boot, MySQL',
    link: '#'
  },
  {
    id: 2,
    title: 'AI Cover Letter Generator',
    description: 'Generates tailored cover letters from user inputs.',
    technologies: 'JavaScript, Gemini API, Express',
    link: '#'
  }
];

const initialCerts = [
  {
    id: 1,
    name: 'Java Programming',
    organization: 'Online Learning',
    date: '2026-06-15',
    link: '#'
  },
  {
    id: 2,
    name: 'Web Development',
    organization: 'College / Training',
    date: '2026-04-20',
    link: '#'
  }
];

const initialGoals = [
  {
    id: 1,
    title: 'Learn Spring Boot',
    description: 'Build REST APIs with Spring Boot.',
    target: '2026-10-30',
    status: 'In Progress'
  },
  {
    id: 2,
    title: 'Practice DSA',
    description: 'Complete core array and string problems.',
    target: '2026-11-15',
    status: 'Planned'
  }
];

const initialSkills = [
  { id: 1, skillName: 'Java', skillLevel: 'Advanced', progress: 85 },
  { id: 2, skillName: 'SQL', skillLevel: 'Intermediate', progress: 70 },
  { id: 3, skillName: 'React', skillLevel: 'Intermediate', progress: 65 },
  { id: 4, skillName: 'HTML/CSS', skillLevel: 'Advanced', progress: 85 }
];

const resourcesList = [
  ['☕', 'Core Java', 'Course', 'Java', 'Beginner'],
  ['⚙️', 'Spring Boot REST APIs', 'Course', 'Backend', 'Intermediate'],
  ['🗄️', 'SQL Fundamentals', 'Course', 'Database', 'Beginner'],
  ['⚛️', 'React Essentials', 'Course', 'Frontend', 'Intermediate'],
  ['🔗', 'Git & GitHub', 'Resource', 'Tools', 'Beginner'],
  ['🌐', 'REST API Design', 'Resource', 'Backend', 'Intermediate']
];

const opportunitiesList = [
  ['Java Backend Intern', 'TechNova', 'Internship', 'Remote', 'Java + Spring Boot'],
  ['Frontend Developer Intern', 'WebCraft', 'Internship', 'Hybrid', 'React + JavaScript'],
  ['Graduate Software Developer', 'CodeSphere', 'Job', 'India', 'Java + SQL']
];

const roles = {
  'Full Stack Java Developer': ['Java', 'SQL', 'HTML', 'CSS', 'JavaScript', 'React', 'Spring Boot', 'REST API', 'Git'],
  'Java Backend Developer': ['Java', 'OOP', 'SQL', 'Spring Boot', 'REST API', 'Git'],
  'Frontend Developer': ['HTML', 'CSS', 'JavaScript', 'React', 'Git']
};

function load(key, defaultValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function App() {
  const [page, setPage] = useState('Dashboard');
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(localStorage.sbDark === 'true');
  const [toast, setToast] = useState('');

  const [profile, setProfile] = useState(load('sbProfile', initialProfile));
  const [projects, setProjects] = useState(load('sbProjects', initialProjects));
  const [certs, setCerts] = useState(load('sbCerts', initialCerts));
  const [goals, setGoals] = useState(load('sbGoals', initialGoals));
  const [skills, setSkills] = useState(load('sbSkills', initialSkills));
  const [students, setStudents] = useState(load('sbStudents', [
    { id: 1, name: 'Suprita Yadav', email: 'suprita@gmail.com', goal: 'Full Stack Java Developer' },
    { id: 2, name: 'Rahul Sharma', email: 'rahul@gmail.com', goal: 'Frontend Developer' }
  ]));

  useEffect(() => { localStorage.setItem('sbProfile', JSON.stringify(profile)); }, [profile]);
  useEffect(() => { localStorage.setItem('sbProjects', JSON.stringify(projects)); }, [projects]);
  useEffect(() => { localStorage.setItem('sbCerts', JSON.stringify(certs)); }, [certs]);
  useEffect(() => { localStorage.setItem('sbGoals', JSON.stringify(goals)); }, [goals]);
  useEffect(() => { localStorage.setItem('sbSkills', JSON.stringify(skills)); }, [skills]);
  useEffect(() => { localStorage.setItem('sbStudents', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('sbDark', dark); }, [dark]);

  const notify = (message) => {
    setToast(message);
    clearTimeout(window.sbToast);
    window.sbToast = setTimeout(() => setToast(''), 2200);
  };

  const nav = (p) => {
    setPage(p);
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
          {page === 'Dashboard' && <Dashboard p={profile} skills={skills} avg={avg} projects={projects} goals={goals} nav={nav} />}
          {page === 'My Profile' && <Profile p={profile} setP={setProfile} notify={notify} />}
          {page === 'Skills' && <Skills skills={skills} setSkills={setSkills} notify={notify} />}
          {page === 'Projects' && <Projects data={projects} setData={setProjects} notify={notify} />}
          {page === 'Certifications' && <Certs data={certs} setData={setCerts} notify={notify} />}
          {page === 'Learning Goals' && <Goals data={goals} setData={setGoals} notify={notify} />}
          {page === 'Skill Gap Analyzer' && <Gap skills={skills} profile={profile} />}
          {page === 'Resources' && <Resources />}
          {page === 'Opportunities' && <Opportunities />}
          {page === 'Admin / Faculty' && <Admin students={students} setStudents={setStudents} notify={notify} />}
        </main>
        <footer>
          © 2026 SkillBridge · Student Career & Skill Management System
        </footer>
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
          <b>S</b>
          <div>
            <strong>SkillBridge</strong>
            <small>Career & Skill Hub</small>
          </div>
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
          <div>
            <b>{p.name}</b>
            <small>Student</small>
          </div>
        </div>
      </div>
    </header>
  );
}

const initials = (name) => name.split(' ').map((x) => x[0]).slice(0, 2).join('');

function Head({ ey, title, sub, action }) {
  return (
    <div className="pageHead">
      <div>
        <label>{ey}</label>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>
      {action}
    </div>
  );
}

function Card({ title, action, children }) {
  return (
    <section className="card">
      <div className="cardHead">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

function Empty({ text }) {
  return <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>{text}</div>;
}

function Dashboard({ p, skills, avg, projects, goals, nav }) {
  const list = skills.length ? skills.slice(0, 4) : initialSkills;
  return (
    <>
      <section className="hero">
        <div>
          <label>STUDENT DASHBOARD</label>
          <h1>Welcome back, {p.name.split(' ')[0]}! 👋</h1>
          <p>Track your skills, build your profile, and move closer to your career goal.</p>
        </div>
        <button className="primary" onClick={() => nav('Skill Gap Analyzer')}>Analyze Skill Gap →</button>
      </section>
      <div className="stats">
        <Stat icon="✦" label="Skills Tracked" value={skills.length} sub="Keep learning" />
        <Stat icon="◒" label="Average Progress" value={avg + '%'} sub="Keep improving" />
        <Stat icon="▣" label="Projects" value={projects.length} sub="Portfolio items" />
        <Stat icon="◎" label="Learning Goals" value={goals.length} sub="Active goals" />
      </div>
      <div className="grid2">
        <Card title="Skill Progress" action={<button onClick={() => nav('Skills')}>View all →</button>}>
          {list.map((skill) => <Progress key={skill.id || skill.skillName} s={skill} />)}
        </Card>
        <Card title="Career Goal" action={<button onClick={() => nav('My Profile')}>Edit profile →</button>}>
          <div className="career">
            <div>🎯</div>
            <section>
              <small>Current target</small>
              <h3>{p.careerGoal}</h3>
              <p>Build the skills required for your target role.</p>
            </section>
          </div>
          <div className="meter"><i style={{ width: Math.min(100, avg + 5) + '%' }} /></div>
          <small className="meterText">Profile readiness <b>{Math.min(100, avg + 5)}%</b></small>
        </Card>
      </div>
    </>
  );
}

function Stat({ icon, label, value, sub }) {
  return (
    <div className="stat">
      <span>{icon}</span>
      <div>
        <small>{label}</small>
        <strong>{value}</strong>
        <em>{sub}</em>
      </div>
    </div>
  );
}

function Progress({ s }) {
  return (
    <div className="prog">
      <div>
        <b>{s.skillName}</b>
        <small>{s.skillLevel}</small>
        <strong>{s.progress}%</strong>
      </div>
      <i><span style={{ width: (s.progress || 0) + '%' }} /></i>
    </div>
  );
}

function Status({ t }) {
  return <span className={'status ' + t.toLowerCase().replaceAll(' ', '-')}>{t}</span>;
}

function Field({ label, value, onChange, type = 'text', placeholder = '' }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Profile({ p, setP, notify }) {
  const [f, setF] = useState(p);
  const save = (e) => { e.preventDefault(); setP(f); notify('Profile updated successfully'); };
  return (
    <>
      <Head ey="MY CAREER" title="My Profile" sub="Keep your professional information up to date." action={<button className="primary" onClick={save}>Save Changes</button>} />
      <div className="profile">
        <div className="card profileCard">
          <div className="bigAvatar">{initials(f.name)}</div>
          <h2>{f.name}</h2>
          <p>{f.careerGoal}</p>
          <span className="tag">BCA</span><span className="tag">Student</span>
          <hr />
          <small>✉ {f.email}</small><br />
          <small>⌕ {f.github}</small><br />
          <small>in {f.linkedin}</small>
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
          <label className="field full">
            <span>Bio</span>
            <textarea rows="4" value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} />
          </label>
        </form>
      </div>
    </>
  );
}

function Skills({ skills, setSkills, notify }) {
  const [f, setF] = useState({ skillName: '', skillLevel: 'Intermediate', progress: 50 });
  const [edit, setEdit] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (!f.skillName.trim()) return;
    const item = { ...f, id: edit || Date.now(), progress: Number(f.progress) };
    if (edit) {
      setSkills(skills.map(s => s.id === edit ? item : s));
    } else {
      setSkills([...skills, item]);
    }
    setF({ skillName: '', skillLevel: 'Intermediate', progress: 50 });
    setEdit(null);
    notify(edit ? 'Skill updated' : 'Skill added');
  };

  const del = (id) => {
    setSkills(skills.filter(s => s.id !== id));
    notify('Skill removed');
  };

  return (
    <>
      <Head ey="MY CAREER" title="Skills & Progress" sub="Track technologies and abilities." />
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>{edit ? 'Edit Skill' : 'Add a Skill'}</h3>
          <Field label="Skill Name" value={f.skillName} onChange={(v) => setF({ ...f, skillName: v })} placeholder="e.g. Java" />
          <label className="field">
            <span>Skill Level</span>
            <select value={f.skillLevel} onChange={(e) => setF({ ...f, skillLevel: e.target.value })}>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </label>
          <label className="field">
            <span>Progress — {f.progress}%</span>
            <input type="range" min="0" max="100" value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} />
          </label>
          <button type="submit" className="primary fullBtn">{edit ? 'Update Skill' : 'Add Skill'}</button>
        </form>
        <Card title="Your Skills">
          {skills.length ? skills.map((skill) => (
            <div className="skillItem" key={skill.id}>
              <Progress s={skill} />
              <div className="actions">
                <button onClick={() => { setEdit(skill.id); setF(skill); }}>Edit</button>
                <button onClick={() => del(skill.id)}>Delete</button>
              </div>
            </div>
          )) : <Empty text="No skills yet. Add your first skill." />}
        </Card>
      </div>
    </>
  );
}

function Projects({ data, setData, notify }) {
  const blank = { title: '', description: '', technologies: '', link: '' };
  const [f, setF] = useState(blank);
  const [edit, setEdit] = useState(null);

  const save = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    if (edit) {
      setData(data.map(p => p.id === edit ? { ...f, id: edit } : p));
    } else {
      setData([...data, { ...f, id: Date.now() }]);
    }
    setF(blank);
    setEdit(null);
    notify(edit ? 'Project updated' : 'Project added');
  };

  return (
    <>
      <Head ey="MY CAREER" title="Projects" sub="Showcase your work." />
      <div className="projectGrid">
        {data.map((project) => (
          <div className="card project" key={project.id}>
            <div className="projectIcon">▣</div>
            <h3>{project.title}</h3>
            <p>{project.description}</p>
            <div className="tags">
              {project.technologies.split(',').map((t) => <span key={t}>{t.trim()}</span>)}
            </div>
            <div className="projectFoot">
              <a href={project.link}>View project ↗</a>
              <button onClick={() => { setEdit(project.id); setF(project); }}>Edit</button>
              <button onClick={() => { setData(data.filter(item => item.id !== project.id)); notify('Project removed'); }}>Delete</button>
            </div>
          </div>
        ))}
      </div>
      <form className="card form" onSubmit={save}>
        <h3>{edit ? 'Edit Project' : 'Add Project'}</h3>
        <div className="formGrid">
          <Field label="Project Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <Field label="Technologies" value={f.technologies} onChange={(v) => setF({ ...f, technologies: v })} />
          <Field label="Project Link" value={f.link} onChange={(v) => setF({ ...f, link: v })} />
        </div>
        <label className="field">
          <span>Description</span>
          <textarea rows="3" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
        </label>
        <button className="primary">{edit ? 'Update Project' : 'Save Project'}</button>
      </form>
    </>
  );
}

function Certs({ data, setData, notify }) {
  const [f, setF] = useState({ name: '', organization: '', date: '', link: '' });
  const save = (e) => {
    e.preventDefault();
    if (!f.name.trim()) return;
    setData([...data, { ...f, id: Date.now() }]);
    setF({ name: '', organization: '', date: '', link: '' });
    notify('Certification added');
  };
  return (
    <>
      <Head ey="MY CAREER" title="Certifications" sub="Manage credentials." />
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>Add Certification</h3>
          <Field label="Certificate Name" value={f.name} onChange={(v) => setF({ ...f, name: v })} />
          <Field label="Issuing Organization" value={f.organization} onChange={(v) => setF({ ...f, organization: v })} />
          <Field label="Issue Date" type="date" value={f.date} onChange={(v) => setF({ ...f, date: v })} />
          <Field label="Certificate Link" value={f.link} onChange={(v) => setF({ ...f, link: v })} />
          <button className="primary fullBtn">Add Certification</button>
        </form>
        <Card title="Your Certifications">
          {data.map((c) => (
            <div className="cert" key={c.id}>
              <b>✓</b>
              <div>
                <strong>{c.name}</strong>
                <small>{c.organization} · {c.date}</small>
              </div>
              <button onClick={() => { setData(data.filter(item => item.id !== c.id)); notify('Certification removed'); }}>×</button>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function Goals({ data, setData, notify }) {
  const [f, setF] = useState({ title: '', description: '', target: '', status: 'Planned' });
  const save = (e) => {
    e.preventDefault();
    if (!f.title.trim()) return;
    setData([...data, { ...f, id: Date.now() }]);
    setF({ title: '', description: '', target: '', status: 'Planned' });
    notify('Learning goal added');
  };
  const cycle = (id) => {
    setData(data.map(g => g.id !== id ? g : { ...g, status: g.status === 'Planned' ? 'In Progress' : g.status === 'In Progress' ? 'Completed' : 'Planned' }));
  };
  return (
    <>
      <Head ey="MY CAREER" title="Learning Goals" sub="Track learning milestones." />
      <div className="two">
        <form className="card form" onSubmit={save}>
          <h3>Set a Goal</h3>
          <Field label="Goal Title" value={f.title} onChange={(v) => setF({ ...f, title: v })} />
          <Field label="Target Date" type="date" value={f.target} onChange={(v) => setF({ ...f, target: v })} />
          <label className="field">
            <span>Description</span>
            <textarea rows="4" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} />
          </label>
          <button className="primary fullBtn">Create Goal</button>
        </form>
        <Card title="My Goals">
          {data.map((g) => (
            <div className="goal" key={g.id}>
              <div>
                <strong>{g.title}</strong>
                <p>{g.description}</p>
                <small>Target: {g.target}</small>
              </div>
              <button onClick={() => cycle(g.id)}><Status t={g.status} /></button>
            </div>
          ))}
        </Card>
      </div>
    </>
  );
}

function Gap({ skills, profile }) {
  const required = roles[profile.careerGoal] || roles['Full Stack Java Developer'];
  const userSkills = skills.map(s => s.skillName.toLowerCase());
  const missing = required.filter(req => !userSkills.includes(req.toLowerCase()));

  return (
    <>
      <Head ey="CAREER TOOLS" title="Skill Gap Analyzer" sub="Compare your skills with your target career role." />
      <div className="grid2">
        <Card title={`Required for ${profile.careerGoal}`}>
          <div className="tags" style={{ padding: '10px 0' }}>
            {required.map(r => <span key={r} style={{ margin: '4px', padding: '6px 12px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px' }}>{r}</span>)}
          </div>
        </Card>
        <Card title="Missing Skills to Acquire">
          {missing.length ? (
            <div className="tags" style={{ padding: '10px 0' }}>
              {missing.map(m => <span key={m} style={{ margin: '4px', padding: '6px 12px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px' }}>{m}</span>)}
            </div>
          ) : <p style={{ color: 'green', fontWeight: 'bold' }}>Awesome! You have all the core skills for this role.</p>}
        </Card>
      </div>
    </>
  );
}

function Resources() {
  return (
    <>
      <Head ey="CAREER TOOLS" title="Resources" sub="Curated learning materials for your growth." />
      <div className="projectGrid">
        {resourcesList.map((res, i) => (
          <div className="card project" key={i}>
            <div className="projectIcon">{res[0]}</div>
            <h3>{res[1]}</h3>
            <p>Category: {res[2]} ({res[3]})</p>
            <span className="tag">{res[4]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Opportunities() {
  return (
    <>
      <Head ey="CAREER TOOLS" title="Opportunities" sub="Explore internships and jobs suited for you." />
      <div className="projectGrid">
        {opportunitiesList.map((opp, i) => (
          <div className="card project" key={i}>
            <div className="projectIcon">↗</div>
            <h3>{opp[0]}</h3>
            <p><b>{opp[1]}</b> · {opp[2]} ({opp[3]})</p>
            <span className="tag">{opp[4]}</span>
          </div>
        ))}
      </div>
    </>
  );
}

function Admin({ students, setStudents, notify }) {
  return (
    <>
      <Head ey="MANAGEMENT" title="Admin / Faculty Dashboard" sub="View registered students and manage local data." />
      <Card title="Student Directory (Local Mock)">
        {students.map((s) => (
          <div className="line" key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #eee' }}>
            <div>
              <b>{s.name}</b>
              <small style={{ display: 'block', color: '#666' }}>{s.email} · Target: {s.goal || 'Java Developer'}</small>
            </div>
            <button className="secondary" onClick={() => { setStudents(students.filter(x => x.id !== s.id)); notify('Student removed'); }}>Remove</button>
          </div>
        ))}
      </Card>
    </>
  );
}

export default App;