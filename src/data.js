// Model data for the UConSoft WIL network. Every person, company and project here is made up.
// seed() builds the starting state; swap it for API calls when there is a real backend.

export const ROLE_LABEL = { student: "Student", staff: "Staff", company: "Industry partner", admin: "Administrator" };

export const DISCIPLINES = ["Software Engineering", "Computer Science", "Electrical Engineering", "Mechatronics Engineering", "Data Science"];
export const YEARS = ["First year", "Second year", "Third year", "Final year", "Postgraduate"];
export const SCHOOLS = ["School of Engineering", "School of Information and Physical Sciences", "WIL Office"];
export const INDUSTRIES = ["Engineering services", "Energy", "Robotics & automation", "Data & analytics", "Software", "Health", "Government"];
export const COMPANY_SIZES = ["1–10", "11–50", "51–200", "201–1000", "1000+"];
export const PROJECT_TYPES = ["Assignment", "Capstone", "WIL Project", "Personal"];
export const KINDS = [["dash", "Dashboard"], ["app", "App"], ["robot", "Robotics"], ["board", "Hardware"]];
export const STAGES = ["Shortlisted", "Contacted", "Interview", "Offer"];
export const APP_STATUSES = ["Submitted", "Reviewing", "Interview", "Offer", "Unsuccessful"];
export const OPEN_TO = ["Internship", "WIL placement", "Graduate role", "Research project"];
export const WORK_MODES = ["On-site", "Hybrid", "Remote"];

export const SKILLS = [
  "Agile", "Android", "AWS", "C", "C++", "Computer Vision", "Data Analysis", "Docker", "Embedded Systems", "FPGA", "Flutter", "Git",
  "Java", "Kotlin", "Machine Learning", "MATLAB", "Node.js", "Pandas", "PCB Design", "Power Systems", "Python", "R", "React", "Robotics",
  "ROS", "SQL", "Tableau", "Testing", "TypeScript", "UX Design", "Accessibility", "IoT",
].sort();
export const INTERESTS = [
  "Accessibility", "Autonomous systems", "Cloud", "Developer tools", "Education", "Energy", "Environmental monitoring", "Grid",
  "Hardware design", "Health data", "IoT", "Machine learning", "Manufacturing", "Mobile", "Public policy", "Renewables", "Robotics", "Sustainability",
].sort();

export const DEMO_PASSWORD = "demo1234";
// [user id, short label] for the quick sign-in buttons on the login page
export const DEMO_ACCOUNTS = [["lc", "Student"], ["s_pr", "Staff"], ["c_he", "Industry partner"], ["a_sr", "Admin"]];

export function seed(now = Date.now()) {
  const h = n => now - n * 3600e3;
  const d = n => now - n * 86400e3;
  const base = { password: DEMO_PASSWORD, status: "active", location: "Newcastle NSW", createdAt: d(200) };
  const student = o => ({ ...base, role: "student", openTo: ["Internship", "WIL placement"], links: { github: "https://github.com" }, views: 0, ...o });
  const staff = o => ({ ...base, role: "staff", ...o });
  const company = o => ({ ...base, role: "company", ...o });

  const users = [
    student({ id: "lc", name: "Liam Chen", email: "liam.chen@uon.edu.au", degree: "Bachelor of Software Engineering (Honours)", discipline: "Software Engineering", year: "Final year", avail: "2026-02", honours: true, hue: 205, gpa: 6.4, views: 212,
      skills: ["Python", "React", "Embedded Systems", "IoT", "Testing", "Git", "Agile"], interests: ["Sustainability", "Environmental monitoring", "IoT"],
      bio: "Final-year software engineer who likes building systems that measure real things. Led the software side of a coastal sensor network project.",
      openTo: ["Internship", "Graduate role"], links: { github: "https://github.com", linkedin: "https://linkedin.com" } }),
    student({ id: "sm", name: "Sophie McDonald", email: "sophie.mcdonald@uon.edu.au", degree: "Bachelor of Computer Science", discipline: "Computer Science", year: "Third year", avail: "2026-07", honours: false, hue: 330, gpa: 6.2, views: 140,
      skills: ["Data Analysis", "Machine Learning", "Python", "SQL", "Pandas", "Testing"], interests: ["Health data", "Sustainability", "Machine learning"],
      bio: "Data-focused CS student who has built forecasting models for regional health service demand." }),
    student({ id: "ak", name: "Aiden Kapoor", email: "aiden.kapoor@uon.edu.au", degree: "Bachelor of Mechatronics Engineering", discipline: "Mechatronics Engineering", year: "Final year", avail: "2026-02", honours: false, hue: 25, gpa: 6.0, views: 167,
      skills: ["Robotics", "Computer Vision", "C++", "ROS", "Python", "Embedded Systems"], interests: ["Autonomous systems", "Manufacturing", "Robotics"],
      bio: "Builds robots that see. Designed the perception stack for a small autonomous rover using ROS and OpenCV." }),
    student({ id: "cn", name: "Chloe Nguyen", email: "chloe.nguyen@uon.edu.au", degree: "Bachelor of Electrical Engineering (Honours)", discipline: "Electrical Engineering", year: "Third year", avail: "2025-11", honours: true, hue: 150, gpa: 6.5, views: 188,
      skills: ["Embedded Systems", "PCB Design", "C", "MATLAB", "Flutter", "IoT"], interests: ["Accessibility", "Hardware design", "Sustainability"],
      bio: "Electrical engineer who moves between circuit boards and mobile apps. Co-led the AccessU campus accessibility app." }),
    student({ id: "jt", name: "Jack Thompson", email: "jack.thompson@uon.edu.au", degree: "Bachelor of Software Engineering", discipline: "Software Engineering", year: "Third year", avail: "2026-07", honours: false, hue: 260, gpa: 5.8, views: 96,
      skills: ["TypeScript", "React", "Node.js", "AWS", "Testing", "Agile"], interests: ["Developer tools", "Cloud", "Education"],
      bio: "Full-stack developer who enjoys tidy CI pipelines and has shipped two student-society web apps." }),
    student({ id: "ap", name: "Ava Patel", email: "ava.patel@uon.edu.au", degree: "Bachelor of Data Science", discipline: "Data Science", year: "Final year", avail: "2026-02", honours: false, hue: 45, gpa: 6.3, views: 121,
      skills: ["Python", "R", "SQL", "Machine Learning", "Data Analysis", "Tableau"], interests: ["Energy", "Sustainability", "Public policy"],
      bio: "Data scientist modelling household energy use across the Hunter region for her capstone." }),
    student({ id: "no", name: "Noah O'Brien", email: "noah.obrien@uon.edu.au", degree: "Bachelor of Electrical Engineering", discipline: "Electrical Engineering", year: "Final year", avail: "2026-02", honours: false, hue: 180, gpa: 5.9, views: 74,
      skills: ["C", "Embedded Systems", "FPGA", "Power Systems", "MATLAB"], interests: ["Renewables", "Grid", "Hardware design"],
      bio: "Power and embedded systems student who built a battery monitoring board for a solar microgrid." }),
    student({ id: "mr", name: "Mia Rossi", email: "mia.rossi@uon.edu.au", degree: "Bachelor of Computer Science", discipline: "Computer Science", year: "Third year", avail: "2026-07", honours: false, hue: 300, gpa: 6.1, views: 88,
      skills: ["Java", "Kotlin", "Android", "UX Design", "Accessibility", "SQL"], interests: ["Accessibility", "Education", "Mobile"],
      bio: "Mobile developer with a focus on inclusive design and screen-reader support." }),

    staff({ id: "s_pr", name: "Dr Priya Raman", email: "priya.raman@newcastle.edu.au", title: "Senior Lecturer, Software Engineering", school: "School of Engineering", hue: 265,
      bio: "Teaches software architecture and supervises final-year capstone teams working with industry partners." }),
    staff({ id: "s_do", name: "Assoc Prof Daniel Okafor", email: "daniel.okafor@newcastle.edu.au", title: "Associate Professor, Computer Science", school: "School of Information and Physical Sciences", hue: 15,
      bio: "Researches applied machine learning and accessibility. Course coordinator for COMP3330." }),
    staff({ id: "s_hl", name: "Hannah Lee", email: "hannah.lee@newcastle.edu.au", title: "WIL Placement Coordinator", school: "WIL Office", hue: 190,
      bio: "Looks after placement agreements, insurance and industry partner onboarding." }),

    company({ id: "c_he", name: "Hunter Engineering", email: "emma.roberts@hunter-eng.example", contact: "Emma Roberts", industry: "Engineering services", size: "51–200", website: "https://example.com", hue: 210,
      bio: "Hunter Engineering designs monitoring systems for environmental, mining and port infrastructure across NSW." }),
    company({ id: "c_ce", name: "Coastline Energy", email: "tom.walsh@coastline.example", contact: "Tom Walsh", industry: "Energy", size: "201–1000", website: "https://example.com", hue: 40,
      bio: "Regional energy retailer and solar installer helping households and councils cut emissions." }),
    company({ id: "c_nr", name: "Novocastrian Robotics", email: "grace.kim@novorobotics.example", contact: "Grace Kim", industry: "Robotics & automation", size: "11–50", website: "https://example.com", hue: 120,
      bio: "Builds vision-guided inspection cells for manufacturers in the Hunter and Central Coast." }),
    company({ id: "c_pc", name: "Port City Analytics", email: "raj.mehta@portcity.example", contact: "Raj Mehta", industry: "Data & analytics", size: "11–50", website: "https://example.com", hue: 340,
      status: "pending", createdAt: h(20), bio: "Data consultancy working with port logistics and freight operators." }),

    { ...base, id: "a_sr", role: "admin", name: "Sam Rivera", email: "sam.rivera@newcastle.edu.au", title: "UConSoft Platform Administrator", hue: 0, bio: "Runs the UConSoft platform for the WIL Office." },
  ];

  const so = (status, approver, at, comment = "") => ({ status, approver, at, comment, note: "" });
  const projects = [
    { id: "w1", owner: "lc", title: "Environmental Sensor Dashboard", kind: "dash", type: "Capstone", course: "SENG4800", team: true, createdAt: d(60),
      desc: "Real-time monitoring dashboard for coastal environmental sensors, built with React and Python.", tags: ["React", "Python", "IoT", "Data Visualisation"],
      views: 184, likes: ["c_he", "s_pr", "jt"], signOff: so("approved", "s_pr", d(30), "Excellent engineering process and clear documentation.") },
    { id: "w9", owner: "lc", title: "Buoy Firmware Update Service", kind: "board", type: "WIL Project", course: "", team: false, createdAt: d(9),
      desc: "Over-the-air firmware updates for remote sensor buoys using MQTT and signed images.", tags: ["Embedded Systems", "IoT", "Python", "Testing"],
      views: 41, likes: [], signOff: { ...so("requested", "c_he", d(2)), note: "Built during my winter placement with Hunter Engineering." } },
    { id: "w2", owner: "ak", title: "Autonomous Robot Vision System", kind: "robot", type: "Capstone", course: "MECH4841", team: true, createdAt: d(45),
      desc: "Computer vision system for object detection and navigation using ROS and OpenCV.", tags: ["ROS", "Computer Vision", "C++", "Robotics"],
      views: 151, likes: ["c_nr"], signOff: { ...so("requested", "s_pr", d(1)), note: "Final demo video is linked in the report." } },
    { id: "w3", owner: "cn", title: "AccessU – Campus Accessibility App", kind: "app", type: "Assignment", course: "SENG2260", team: true, createdAt: d(80),
      desc: "Mobile app that helps students find accessible routes and facilities across campus.", tags: ["Flutter", "Maps API", "UX Design", "Accessibility"],
      views: 203, likes: ["mr", "s_do"], signOff: so("approved", "s_do", d(50), "Strong user research with real campus users.") },
    { id: "w4", owner: "sm", title: "Hospital Demand Forecaster", kind: "dash", type: "Assignment", course: "COMP3330", team: false, createdAt: d(20),
      desc: "Weekly emergency-department demand forecasts for a regional hospital using gradient boosting.", tags: ["Python", "Machine Learning", "SQL"],
      views: 97, likes: [], signOff: so("requested", "s_do", h(30)) },
    { id: "w5", owner: "ap", title: "Hunter Energy Use Explorer", kind: "dash", type: "Capstone", course: "STAT4000", team: false, createdAt: d(35),
      desc: "Interactive analysis of household electricity use by suburb, built for a council sustainability team.", tags: ["Python", "Tableau", "Data Analysis"],
      views: 118, likes: ["c_ce"], signOff: null },
    { id: "w6", owner: "no", title: "Microgrid Battery Monitor", kind: "board", type: "Assignment", course: "ELEC3130", team: true, createdAt: d(70),
      desc: "Custom board that tracks cell voltage and temperature in a 10 kWh solar battery bank.", tags: ["Embedded Systems", "C", "PCB Design"],
      views: 66, likes: ["c_ce"], signOff: so("approved", "s_pr", d(40), "") },
    { id: "w7", owner: "jt", title: "Society Events Platform", kind: "app", type: "Personal", course: "", team: true, createdAt: d(25),
      desc: "Event sign-up and ticketing web app now used by four university societies.", tags: ["TypeScript", "React", "Node.js", "AWS"],
      views: 89, likes: ["lc"], signOff: null },
    { id: "w8", owner: "mr", title: "Lecture Captions for Android", kind: "app", type: "Assignment", course: "COMP3320", team: false, createdAt: d(15),
      desc: "Android app that shows live captions for lectures and saves searchable transcripts.", tags: ["Kotlin", "Android", "Accessibility"],
      views: 72, likes: ["cn"], signOff: so("changes", "s_do", d(4), "Please add the evaluation results with the screen-reader testers to the report.") },
  ].map(p => ({ links: { github: "https://github.com", demo: "", report: "" }, hidden: false, flagged: false, ...p }));

  const opp = o => ({ status: "Open", mode: "Hybrid", paid: true, location: "Newcastle NSW", createdAt: d(30), ...o });
  const opps = [
    opp({ id: "o1", company: "c_he", title: "Software Engineering Intern", period: "Feb – Nov 2026", start: "2026-02",
      desc: "Join the platform team building monitoring software for environmental and industrial sensors.",
      skills: ["Python", "React", "Testing", "Embedded Systems", "IoT", "Agile"], disciplines: ["Software Engineering", "Computer Science"], themes: ["Sustainability", "Environmental monitoring", "IoT"] }),
    opp({ id: "o5", company: "c_he", title: "Hardware Design Placement", period: "Jul – Dec 2026", start: "2026-07", mode: "On-site", createdAt: d(12),
      desc: "Help design and bring up sensor boards for port infrastructure monitoring.",
      skills: ["PCB Design", "Embedded Systems", "C", "MATLAB"], disciplines: ["Electrical Engineering", "Mechatronics Engineering"], themes: ["Hardware design", "IoT"] }),
    opp({ id: "o2", company: "c_ce", title: "Embedded Systems Project", period: "Jul – Dec 2026", start: "2026-07",
      desc: "Design and test firmware and boards for a remote solar monitoring unit.",
      skills: ["Embedded Systems", "C", "C++", "PCB Design", "IoT"], disciplines: ["Electrical Engineering", "Mechatronics Engineering"], themes: ["Hardware design", "Renewables", "Sustainability"] }),
    opp({ id: "o3", company: "c_ce", title: "Data Analytics Placement", period: "Feb – Jun 2026", start: "2026-02", mode: "Remote",
      desc: "Analyse energy use data and build dashboards for client sustainability reporting.",
      skills: ["Python", "SQL", "Data Analysis", "Machine Learning", "Tableau"], disciplines: ["Data Science", "Computer Science"], themes: ["Energy", "Sustainability", "Public policy"] }),
    opp({ id: "o4", company: "c_nr", title: "Robotics Vision Researcher", period: "Feb – Dec 2026", start: "2026-02", mode: "On-site",
      desc: "Prototype vision-guided inspection for a manufacturing line.",
      skills: ["Robotics", "Computer Vision", "C++", "ROS", "Python"], disciplines: ["Mechatronics Engineering", "Electrical Engineering"], themes: ["Autonomous systems", "Manufacturing"] }),
  ];

  const app = (id, oppId, studentId, status, days, cover = "") => ({ id, opp: oppId, student: studentId, status, at: d(days), updatedAt: d(Math.max(0, days - 2)), cover });
  const applications = [
    app("a1", "o1", "lc", "Interview", 14, "I built the coastal sensor dashboard and would love to keep working on monitoring software."),
    app("a2", "o1", "jt", "Submitted", 3, "Full-stack developer keen to work on real-time systems."),
    app("a3", "o1", "sm", "Reviewing", 8),
    app("a4", "o5", "cn", "Submitted", 2, "I enjoy board bring-up and have designed two PCBs this year."),
    app("a5", "o5", "no", "Reviewing", 6),
    app("a6", "o3", "ap", "Reviewing", 9, "My capstone analyses Hunter household energy use, so this is a great fit."),
    app("a7", "o3", "sm", "Submitted", 5),
    app("a8", "o4", "ak", "Interview", 11),
    app("a9", "o2", "no", "Submitted", 4),
  ];

  const msg = (from, text, at) => ({ from, text, at });
  const threads = [
    { id: "t1", members: ["c_he", "lc"], subject: "Software Engineering Intern", read: { c_he: h(30), lc: now }, items: [
      msg("c_he", "Hi Liam, we liked your sensor dashboard. Would you be up for a chat about our internship?", d(3)),
      msg("lc", "Thanks for reaching out. I'm free for a call any afternoon next week.", h(5)) ] },
    { id: "t2", members: ["c_he", "cn"], subject: "Portfolio link", read: { c_he: d(2), cn: now }, items: [
      msg("cn", "Here's the PCB design write-up I mentioned, including the test results.", h(9)) ] },
    { id: "t3", members: ["s_hl", "c_he"], subject: "2026 placement agreement", read: { s_hl: now, c_he: d(5) }, items: [
      msg("s_hl", "Your 2026 placement agreement template is ready for review. Let me know if legal has any changes.", d(1)) ] },
    { id: "t4", members: ["c_he", "ak"], subject: "Robot demo video", read: { c_he: now, ak: now }, items: [
      msg("ak", "Uploaded the navigation demo to GitHub. The obstacle test starts at 1:20.", d(4)) ] },
    { id: "t5", members: ["s_pr", "lc"], subject: "Capstone sign-off", read: { s_pr: now, lc: d(29) }, items: [
      msg("s_pr", "Signed off your dashboard project. Nice work on the test coverage.", d(30)),
      msg("lc", "Thank you! The team really appreciated the feedback.", d(29)) ] },
    { id: "t6", members: ["c_ce", "ap"], subject: "Data Analytics Placement", read: { c_ce: now, ap: d(2) }, items: [
      msg("c_ce", "Hi Ava, your energy explorer is very close to what our clients ask for. Can you share a demo?", d(1)) ] },
  ];

  const notif = (id, to, text, link, at, read = false) => ({ id, to, text, link, at, read });
  const notifs = [
    notif("n1", "lc", "Hunter Engineering moved your Software Engineering Intern application to Interview.", "/applications", d(1)),
    notif("n2", "lc", "Dr Priya Raman signed off Environmental Sensor Dashboard.", "/work/w1", d(30), true),
    notif("n3", "s_pr", "Aiden Kapoor asked you to sign off Autonomous Robot Vision System.", "/signoffs", d(1)),
    notif("n4", "c_he", "Jack Thompson applied for Software Engineering Intern.", "/opportunities/o1", d(3)),
    notif("n5", "c_he", "Chloe Nguyen applied for Hardware Design Placement.", "/opportunities/o5", d(2)),
    notif("n6", "c_he", "Liam Chen asked you to sign off Buoy Firmware Update Service.", "/signoffs", d(2)),
    notif("n7", "a_sr", "Port City Analytics registered as an industry partner and is waiting for approval.", "/admin/users?status=pending", h(20)),
    notif("n8", "mr", "Assoc Prof Daniel Okafor asked for changes on Lecture Captions for Android.", "/work/w8", d(4)),
  ];

  const log = [
    { id: "l1", at: h(20), actor: "c_pc", text: "Port City Analytics registered as an industry partner (pending approval)" },
    { id: "l2", at: d(1), actor: "ak", text: "Aiden Kapoor requested sign-off on Autonomous Robot Vision System" },
    { id: "l3", at: d(2), actor: "cn", text: "Chloe Nguyen applied for Hardware Design Placement" },
    { id: "l4", at: d(4), actor: "s_do", text: "Assoc Prof Daniel Okafor asked for changes on Lecture Captions for Android" },
    { id: "l5", at: d(12), actor: "c_he", text: "Hunter Engineering posted Hardware Design Placement" },
  ];

  return {
    users, projects, opps, applications, threads, notifs, log,
    shortlists: { c_he: { lc: "Contacted", cn: "Shortlisted", ak: "Interview", sm: "Shortlisted", ap: "Shortlisted", no: "Shortlisted", mr: "Shortlisted" } },
    notes: { c_he: { lc: "Strong on testing. Ask about the MQTT broker design in the interview." } },
  };
}
