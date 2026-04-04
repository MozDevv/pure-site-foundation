// ──────────────────────────────────────────────────
// Countries (all 195 UN-recognised + common territories)
// ──────────────────────────────────────────────────
export const COUNTRIES: string[] = [
  'Afghanistan','Albania','Algeria','Andorra','Angola','Antigua and Barbuda','Argentina','Armenia','Australia','Austria',
  'Azerbaijan','Bahamas','Bahrain','Bangladesh','Barbados','Belarus','Belgium','Belize','Benin','Bhutan',
  'Bolivia','Bosnia and Herzegovina','Botswana','Brazil','Brunei','Bulgaria','Burkina Faso','Burundi','Cabo Verde','Cambodia',
  'Cameroon','Canada','Central African Republic','Chad','Chile','China','Colombia','Comoros','Congo (DRC)','Congo (Republic)',
  'Costa Rica','Croatia','Cuba','Cyprus','Czech Republic','Denmark','Djibouti','Dominica','Dominican Republic','East Timor',
  'Ecuador','Egypt','El Salvador','Equatorial Guinea','Eritrea','Estonia','Eswatini','Ethiopia','Fiji','Finland',
  'France','Gabon','Gambia','Georgia','Germany','Ghana','Greece','Grenada','Guatemala','Guinea',
  'Guinea-Bissau','Guyana','Haiti','Honduras','Hungary','Iceland','India','Indonesia','Iran','Iraq',
  'Ireland','Israel','Italy','Ivory Coast','Jamaica','Japan','Jordan','Kazakhstan','Kenya','Kiribati',
  'Kosovo','Kuwait','Kyrgyzstan','Laos','Latvia','Lebanon','Lesotho','Liberia','Libya','Liechtenstein',
  'Lithuania','Luxembourg','Madagascar','Malawi','Malaysia','Maldives','Mali','Malta','Marshall Islands','Mauritania',
  'Mauritius','Mexico','Micronesia','Moldova','Monaco','Mongolia','Montenegro','Morocco','Mozambique','Myanmar',
  'Namibia','Nauru','Nepal','Netherlands','New Zealand','Nicaragua','Niger','Nigeria','North Korea','North Macedonia',
  'Norway','Oman','Pakistan','Palau','Palestine','Panama','Papua New Guinea','Paraguay','Peru','Philippines',
  'Poland','Portugal','Qatar','Romania','Russia','Rwanda','Saint Kitts and Nevis','Saint Lucia','Saint Vincent and the Grenadines','Samoa',
  'San Marino','Sao Tome and Principe','Saudi Arabia','Senegal','Serbia','Seychelles','Sierra Leone','Singapore','Slovakia','Slovenia',
  'Solomon Islands','Somalia','South Africa','South Korea','South Sudan','Spain','Sri Lanka','Sudan','Suriname','Sweden',
  'Switzerland','Syria','Taiwan','Tajikistan','Tanzania','Thailand','Togo','Tonga','Trinidad and Tobago','Tunisia',
  'Turkey','Turkmenistan','Tuvalu','Uganda','Ukraine','United Arab Emirates','United Kingdom','United States','Uruguay','Uzbekistan',
  'Vanuatu','Vatican City','Venezuela','Vietnam','Yemen','Zambia','Zimbabwe',
  // Common territories / regions
  'Hong Kong','Macau','Puerto Rico','Guam','U.S. Virgin Islands','American Samoa','Northern Mariana Islands',
];

// ──────────────────────────────────────────────────
// Fields of Study
// ──────────────────────────────────────────────────
export const FIELDS_OF_STUDY: string[] = [
  'Computer Science','Software Engineering','Information Technology','Data Science','Artificial Intelligence',
  'Machine Learning','Cybersecurity','Computer Engineering','Electrical Engineering','Mechanical Engineering',
  'Civil Engineering','Chemical Engineering','Biomedical Engineering','Aerospace Engineering','Industrial Engineering',
  'Mathematics','Statistics','Physics','Chemistry','Biology',
  'Biotechnology','Environmental Science','Information Systems','Business Administration','Finance',
  'Accounting','Economics','Marketing','Human Resource Management','Supply Chain Management',
  'Project Management','Entrepreneurship','International Business','Public Administration','Healthcare Administration',
  'Medicine','Nursing','Pharmacy','Public Health','Psychology',
  'Sociology','Political Science','Philosophy','History','English Literature',
  'Linguistics','Communication Studies','Journalism','Media Studies','Film Studies',
  'Graphic Design','Fine Arts','Music','Architecture','Urban Planning',
  'Education','Law','Criminology','Social Work','Library Science',
  'Agricultural Science','Food Science','Veterinary Science','Marine Biology','Geology',
  'Astronomy','Actuarial Science','Game Design','Cloud Computing','DevOps',
  'Blockchain Technology','Quantum Computing','Robotics','Mechatronics','Nanotechnology',
  'Bioinformatics','Computational Biology','Geographic Information Systems','Network Engineering','Database Administration',
  'Web Development','Mobile App Development','UI/UX Design','Product Management','Digital Marketing',
];

// ──────────────────────────────────────────────────
// Programming Languages
// ──────────────────────────────────────────────────
export const PROGRAMMING_LANGUAGES: string[] = [
  'Python','JavaScript','TypeScript','Java','C','C++','C#','Go','Rust','Ruby',
  'PHP','Swift','Kotlin','Dart','Scala','R','MATLAB','Julia','Perl','Lua',
  'Haskell','Erlang','Elixir','Clojure','F#','Objective-C','Assembly','COBOL','Fortran','Pascal',
  'Visual Basic','VBA','PowerShell','Bash','Shell Script','SQL','PL/SQL','T-SQL','HTML','CSS',
  'SASS/SCSS','Solidity','Move','Cairo','VHDL','Verilog','Prolog','Lisp','Scheme','Groovy',
  'CoffeeScript','Nim','Zig','Crystal','OCaml','Ada','Apex','ABAP','RPG','LabVIEW',
  'Scratch','Blockly','MicroPython','Arduino','Processing',
];

// ──────────────────────────────────────────────────
// Tech / AI Areas of Interest
// ──────────────────────────────────────────────────
export const TECH_INTERESTS: string[] = [
  'Artificial Intelligence','Machine Learning','Deep Learning','Natural Language Processing','Computer Vision',
  'Reinforcement Learning','Generative AI','Large Language Models','Prompt Engineering','AI Ethics',
  'Data Science','Data Engineering','Data Analytics','Business Intelligence','Big Data',
  'Web Development','Frontend Development','Backend Development','Full-Stack Development','Mobile App Development',
  'iOS Development','Android Development','Cross-Platform Development','Progressive Web Apps','API Development',
  'Cloud Computing','AWS','Azure','Google Cloud Platform','Serverless Architecture',
  'DevOps','CI/CD','Containerization','Docker','Kubernetes','Infrastructure as Code','Site Reliability Engineering',
  'Cybersecurity','Ethical Hacking','Penetration Testing','Network Security','Application Security','Cryptography',
  'Blockchain','Web3','Smart Contracts','DeFi','NFTs','Cryptocurrency',
  'Internet of Things (IoT)','Embedded Systems','Robotics','Autonomous Vehicles','Drone Technology',
  'Game Development','Unity','Unreal Engine','AR/VR','Mixed Reality','Metaverse',
  'UI/UX Design','Product Design','Interaction Design','Design Systems','Accessibility',
  'Database Management','SQL Databases','NoSQL Databases','Graph Databases','Data Modeling',
  'Quantum Computing','Edge Computing','High-Performance Computing','Distributed Systems',
  'Software Architecture','Microservices','Event-Driven Architecture','Domain-Driven Design',
  'Open Source','Technical Writing','Developer Relations','Tech Entrepreneurship','Product Management',
];

// ──────────────────────────────────────────────────
// Universities & Institutions (major worldwide + abbreviations)
// Each entry: { name, abbreviation?, country, type }
// ──────────────────────────────────────────────────
export interface Institution {
  name: string;
  abbreviation?: string;
  country: string;
  type: 'university' | 'college' | 'polytechnic' | 'institute' | 'academy' | 'school';
  levels: string[]; // education levels this institution covers
}

export const INSTITUTIONS: Institution[] = [
  // ── United States ──
  { name: 'Massachusetts Institute of Technology', abbreviation: 'MIT', country: 'United States', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Stanford University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Harvard University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'California Institute of Technology', abbreviation: 'Caltech', country: 'United States', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Carnegie Mellon University', abbreviation: 'CMU', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of California, Berkeley', abbreviation: 'UC Berkeley', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of California, Los Angeles', abbreviation: 'UCLA', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Michigan', abbreviation: 'UMich', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Georgia Institute of Technology', abbreviation: 'Georgia Tech', country: 'United States', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'University of Texas at Austin', abbreviation: 'UT Austin', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Princeton University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Columbia University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Yale University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Pennsylvania', abbreviation: 'UPenn', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Cornell University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Washington', abbreviation: 'UW', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Illinois Urbana-Champaign', abbreviation: 'UIUC', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'New York University', abbreviation: 'NYU', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Duke University', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Southern California', abbreviation: 'USC', country: 'United States', type: 'university', levels: ['bachelor','master','phd'] },
  // ── United Kingdom ──
  { name: 'University of Oxford', abbreviation: 'Oxford', country: 'United Kingdom', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Cambridge', abbreviation: 'Cambridge', country: 'United Kingdom', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Imperial College London', abbreviation: 'ICL', country: 'United Kingdom', type: 'college', levels: ['bachelor','master','phd'] },
  { name: 'University College London', abbreviation: 'UCL', country: 'United Kingdom', type: 'college', levels: ['bachelor','master','phd'] },
  { name: 'University of Edinburgh', country: 'United Kingdom', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Manchester', country: 'United Kingdom', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'King\'s College London', abbreviation: 'KCL', country: 'United Kingdom', type: 'college', levels: ['bachelor','master','phd'] },
  { name: 'London School of Economics', abbreviation: 'LSE', country: 'United Kingdom', type: 'school', levels: ['bachelor','master','phd'] },
  // ── Canada ──
  { name: 'University of Toronto', abbreviation: 'UofT', country: 'Canada', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of British Columbia', abbreviation: 'UBC', country: 'Canada', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'McGill University', country: 'Canada', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Waterloo', abbreviation: 'UWaterloo', country: 'Canada', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Alberta', country: 'Canada', type: 'university', levels: ['bachelor','master','phd'] },
  // ── India ──
  { name: 'Indian Institute of Technology Bombay', abbreviation: 'IIT Bombay', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Indian Institute of Technology Delhi', abbreviation: 'IIT Delhi', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Indian Institute of Technology Madras', abbreviation: 'IIT Madras', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Indian Institute of Science', abbreviation: 'IISc', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Indian Institute of Technology Kanpur', abbreviation: 'IIT Kanpur', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Birla Institute of Technology and Science', abbreviation: 'BITS Pilani', country: 'India', type: 'institute', levels: ['bachelor','master','phd'] },
  // ── Kenya ──
  { name: 'University of Nairobi', abbreviation: 'UoN', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Kenyatta University', abbreviation: 'KU', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Jomo Kenyatta University of Agriculture and Technology', abbreviation: 'JKUAT', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Strathmore University', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Moi University', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Egerton University', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Dedan Kimathi University of Technology', abbreviation: 'DeKUT', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Maseno University', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Technical University of Kenya', abbreviation: 'TUK', country: 'Kenya', type: 'university', levels: ['diploma','bachelor','master'] },
  { name: 'Technical University of Mombasa', abbreviation: 'TUM', country: 'Kenya', type: 'university', levels: ['diploma','bachelor','master'] },
  { name: 'Multimedia University of Kenya', abbreviation: 'MMU', country: 'Kenya', type: 'university', levels: ['bachelor','master'] },
  { name: 'Mount Kenya University', abbreviation: 'MKU', country: 'Kenya', type: 'university', levels: ['diploma','bachelor','master'] },
  { name: 'KCA University', abbreviation: 'KCAU', country: 'Kenya', type: 'university', levels: ['diploma','bachelor','master'] },
  { name: 'United States International University Africa', abbreviation: 'USIU-Africa', country: 'Kenya', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Africa Nazarene University', abbreviation: 'ANU', country: 'Kenya', type: 'university', levels: ['diploma','bachelor','master'] },
  { name: 'Zetech University', country: 'Kenya', type: 'university', levels: ['diploma','bachelor'] },
  { name: 'Moringa School', country: 'Kenya', type: 'school', levels: ['diploma'] },
  { name: 'ALX Africa', abbreviation: 'ALX', country: 'Kenya', type: 'school', levels: ['diploma'] },
  // ── Nigeria ──
  { name: 'University of Lagos', abbreviation: 'UNILAG', country: 'Nigeria', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Ibadan', abbreviation: 'UI', country: 'Nigeria', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Obafemi Awolowo University', abbreviation: 'OAU', country: 'Nigeria', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Ahmadu Bello University', abbreviation: 'ABU', country: 'Nigeria', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Covenant University', country: 'Nigeria', type: 'university', levels: ['bachelor','master','phd'] },
  // ── South Africa ──
  { name: 'University of Cape Town', abbreviation: 'UCT', country: 'South Africa', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of the Witwatersrand', abbreviation: 'Wits', country: 'South Africa', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Stellenbosch University', country: 'South Africa', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Pretoria', abbreviation: 'UP', country: 'South Africa', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Germany ──
  { name: 'Technical University of Munich', abbreviation: 'TUM', country: 'Germany', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Ludwig Maximilian University of Munich', abbreviation: 'LMU', country: 'Germany', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'RWTH Aachen University', abbreviation: 'RWTH', country: 'Germany', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Heidelberg University', country: 'Germany', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Australia ──
  { name: 'University of Melbourne', country: 'Australia', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Australian National University', abbreviation: 'ANU', country: 'Australia', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Sydney', country: 'Australia', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of New South Wales', abbreviation: 'UNSW', country: 'Australia', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Monash University', country: 'Australia', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Singapore ──
  { name: 'National University of Singapore', abbreviation: 'NUS', country: 'Singapore', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Nanyang Technological University', abbreviation: 'NTU', country: 'Singapore', type: 'university', levels: ['bachelor','master','phd'] },
  // ── China ──
  { name: 'Tsinghua University', country: 'China', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Peking University', abbreviation: 'PKU', country: 'China', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Fudan University', country: 'China', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Zhejiang University', abbreviation: 'ZJU', country: 'China', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Japan ──
  { name: 'University of Tokyo', abbreviation: 'UTokyo', country: 'Japan', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Kyoto University', country: 'Japan', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Tokyo Institute of Technology', abbreviation: 'Tokyo Tech', country: 'Japan', type: 'institute', levels: ['bachelor','master','phd'] },
  // ── South Korea ──
  { name: 'Seoul National University', abbreviation: 'SNU', country: 'South Korea', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Korea Advanced Institute of Science and Technology', abbreviation: 'KAIST', country: 'South Korea', type: 'institute', levels: ['bachelor','master','phd'] },
  // ── Ethiopia ──
  { name: 'Addis Ababa University', abbreviation: 'AAU', country: 'Ethiopia', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Ghana ──
  { name: 'University of Ghana', abbreviation: 'UG', country: 'Ghana', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Kwame Nkrumah University of Science and Technology', abbreviation: 'KNUST', country: 'Ghana', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Ashesi University', country: 'Ghana', type: 'university', levels: ['bachelor'] },
  // ── Tanzania ──
  { name: 'University of Dar es Salaam', abbreviation: 'UDSM', country: 'Tanzania', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Uganda ──
  { name: 'Makerere University', country: 'Uganda', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Rwanda ──
  { name: 'University of Rwanda', abbreviation: 'UR', country: 'Rwanda', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Carnegie Mellon University Africa', abbreviation: 'CMU Africa', country: 'Rwanda', type: 'university', levels: ['master'] },
  // ── Egypt ──
  { name: 'Cairo University', country: 'Egypt', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'American University in Cairo', abbreviation: 'AUC', country: 'Egypt', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Brazil ──
  { name: 'University of São Paulo', abbreviation: 'USP', country: 'Brazil', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of Campinas', abbreviation: 'UNICAMP', country: 'Brazil', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Other notable ──
  { name: 'ETH Zurich', country: 'Switzerland', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'EPFL', country: 'Switzerland', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Delft University of Technology', abbreviation: 'TU Delft', country: 'Netherlands', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'KTH Royal Institute of Technology', abbreviation: 'KTH', country: 'Sweden', type: 'institute', levels: ['bachelor','master','phd'] },
  { name: 'Aalto University', country: 'Finland', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'Technical University of Denmark', abbreviation: 'DTU', country: 'Denmark', type: 'university', levels: ['bachelor','master','phd'] },
  { name: 'University of São Paulo', abbreviation: 'USP', country: 'Brazil', type: 'university', levels: ['bachelor','master','phd'] },
  // ── Online / bootcamps ──
  { name: 'ALX Africa', abbreviation: 'ALX', country: 'Global', type: 'school', levels: ['diploma'] },
  { name: 'Andela', country: 'Global', type: 'school', levels: ['diploma'] },
  { name: '42 School', abbreviation: '42', country: 'France', type: 'school', levels: ['diploma'] },
  { name: 'Holberton School', country: 'Global', type: 'school', levels: ['diploma'] },
  { name: 'Le Wagon', country: 'Global', type: 'school', levels: ['diploma'] },
  { name: 'General Assembly', abbreviation: 'GA', country: 'Global', type: 'school', levels: ['diploma'] },
  { name: 'Flatiron School', country: 'United States', type: 'school', levels: ['diploma'] },
  { name: 'App Academy', country: 'United States', type: 'school', levels: ['diploma'] },
  { name: 'Lambda School (Bloom Institute of Technology)', abbreviation: 'BloomTech', country: 'United States', type: 'school', levels: ['diploma'] },
];

// ──────────────────────────────────────────────────
// Education Level Mapping (for institution filtering)
// ──────────────────────────────────────────────────
export const EDUCATION_LEVEL_MAP: Record<string, string> = {
  'high-school': 'high-school',
  'diploma': 'diploma',
  'bachelor': 'bachelor',
  'master': 'master',
  'phd': 'phd',
  'other': 'other',
};

// ──────────────────────────────────────────────────
// Motivation / Career Goal Suggestions
// ──────────────────────────────────────────────────
export const MOTIVATION_SUGGESTIONS: string[] = [
  'I want to transition into a career in tech',
  'I want to improve my programming skills',
  'I am passionate about artificial intelligence and want to learn more',
  'I want to build products that solve real-world problems',
  'I want to contribute to open-source projects',
  'I am looking for mentorship and structured learning',
  'I want to prepare for a career in data science',
  'I want to learn how to build scalable web applications',
  'I want to develop mobile applications for social impact',
  'I want to understand machine learning and deep learning',
  'I am interested in cybersecurity and want to learn ethical hacking',
  'I want to start my own tech company someday',
  'I want to collaborate with other developers and learn from experts',
  'I am looking for hands-on project experience',
  'I want to earn industry-recognized certifications',
];

export const CAREER_GOAL_SUGGESTIONS: string[] = [
  'Become a full-stack web developer',
  'Work as a data scientist at a major tech company',
  'Start my own tech startup',
  'Become a machine learning engineer',
  'Work as a mobile app developer',
  'Become a cybersecurity analyst or penetration tester',
  'Transition into a DevOps or cloud engineering role',
  'Work as a product manager in the tech industry',
  'Become a freelance software developer',
  'Build AI-powered solutions for African businesses',
  'Get a position at a FAANG company',
  'Become a technical lead or engineering manager',
  'Contribute to open-source and build developer tools',
  'Work in fintech and blockchain technology',
  'Become a researcher in artificial intelligence',
];

// ──────────────────────────────────────────────────
// Helper: search institutions by query + level
// ──────────────────────────────────────────────────
export function searchInstitutions(query: string, educationLevel?: string): Institution[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return INSTITUTIONS.filter((inst) => {
    // Filter by education level if provided
    if (educationLevel && educationLevel !== 'other') {
      if (!inst.levels.includes(educationLevel)) return false;
    }

    // Search across name, abbreviation, and country
    const nameMatch = inst.name.toLowerCase().includes(q);
    const abbrMatch = inst.abbreviation?.toLowerCase().includes(q);
    const countryMatch = inst.country.toLowerCase().includes(q);

    return nameMatch || abbrMatch || countryMatch;
  }).slice(0, 20); // Limit results
}
