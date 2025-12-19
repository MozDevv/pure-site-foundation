// Innovation Hub Types and Mock Data

export interface User {
  id: number;
  name: string;
  email: string;
  role: "Student" | "Admin";
  avatar?: string;
}

export interface Team {
  id: number;
  name: string;
  description: string;
  is_club: boolean;
  creator_id: number;
  max_members: number | null;
  looking_for_members: boolean;
  skills_needed: string[];
  created_at: string;
}

export interface TeamMember {
  team_id: number;
  user_id: number;
  role: "leader" | "member";
  joined_at: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  problem_statement: string;
  solution_overview: string;
  tech_stack: string[];
  is_public: boolean;
  status: "draft" | "submitted" | "approved" | "in_progress" | "completed";
  team_id: number | null;
  creator_id: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: number;
  project_id: number;
  file_type: "image" | "document" | "link";
  url: string;
  description: string;
}

export interface Review {
  id: number;
  project_id: number;
  reviewer_id: number;
  status: "pending" | "approved" | "revisions_needed" | "rejected";
  comments: string;
  score_innovation: number;
  score_feasibility: number;
  score_impact: number;
  reviewed_at: string | null;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  participant_count: number;
  status: "upcoming" | "ongoing" | "completed";
}

export interface Activity {
  id: number;
  message: string;
  timestamp: string;
  type: "team" | "project" | "event" | "review";
}

// Dummy Users
export const users: User[] = [
  { id: 1, name: "Alex Chen", email: "alex@student.com", role: "Student" },
  { id: 2, name: "Sarah Johnson", email: "sarah@student.com", role: "Student" },
  { id: 3, name: "Michael Brown", email: "michael@student.com", role: "Student" },
  { id: 4, name: "Emily Davis", email: "emily@student.com", role: "Student" },
  { id: 5, name: "James Wilson", email: "james@student.com", role: "Student" },
  { id: 6, name: "Lisa Anderson", email: "lisa@student.com", role: "Student" },
  { id: 7, name: "David Martinez", email: "david@student.com", role: "Student" },
  { id: 8, name: "Jennifer Taylor", email: "jennifer@student.com", role: "Student" },
  { id: 99, name: "Dr. Maria Garcia", email: "maria@admin.com", role: "Admin" },
];

// 15 Teams
export const teams: Team[] = [
  {
    id: 1,
    name: "Team Alpha",
    description: "Pioneering AI solutions for education accessibility",
    is_club: false,
    creator_id: 1,
    max_members: 5,
    looking_for_members: true,
    skills_needed: ["Python", "Machine Learning", "UI/UX"],
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    id: 2,
    name: "Green Innovators Club",
    description: "Sustainable technology solutions for campus life",
    is_club: true,
    creator_id: 2,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["IoT", "Data Analysis", "Environmental Science"],
    created_at: "2025-01-10T09:00:00Z",
  },
  {
    id: 3,
    name: "HealthTech Pioneers",
    description: "Building digital health solutions for students",
    is_club: false,
    creator_id: 3,
    max_members: 6,
    looking_for_members: false,
    skills_needed: ["React", "Node.js", "Healthcare"],
    created_at: "2025-01-20T14:00:00Z",
  },
  {
    id: 4,
    name: "Blockchain Society",
    description: "Exploring decentralized applications in education",
    is_club: true,
    creator_id: 4,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Solidity", "Web3", "Cryptography"],
    created_at: "2025-01-08T11:00:00Z",
  },
  {
    id: 5,
    name: "Data Wizards",
    description: "Turning data into actionable insights",
    is_club: false,
    creator_id: 5,
    max_members: 4,
    looking_for_members: true,
    skills_needed: ["Python", "SQL", "Tableau"],
    created_at: "2025-02-01T08:00:00Z",
  },
  {
    id: 6,
    name: "Mobile First",
    description: "Creating mobile-first experiences for learning",
    is_club: false,
    creator_id: 6,
    max_members: 5,
    looking_for_members: false,
    skills_needed: ["React Native", "Flutter", "Swift"],
    created_at: "2025-01-25T16:00:00Z",
  },
  {
    id: 7,
    name: "Robotics Club",
    description: "Building autonomous systems and drones",
    is_club: true,
    creator_id: 7,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Arduino", "ROS", "3D Printing"],
    created_at: "2025-01-05T10:00:00Z",
  },
  {
    id: 8,
    name: "GameDev Studio",
    description: "Creating educational games that inspire",
    is_club: false,
    creator_id: 8,
    max_members: 6,
    looking_for_members: true,
    skills_needed: ["Unity", "C#", "3D Modeling"],
    created_at: "2025-02-05T12:00:00Z",
  },
  {
    id: 9,
    name: "Cybersecurity Alliance",
    description: "Protecting digital assets and teaching security",
    is_club: true,
    creator_id: 1,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Network Security", "Ethical Hacking", "Linux"],
    created_at: "2025-01-12T09:00:00Z",
  },
  {
    id: 10,
    name: "AR/VR Explorers",
    description: "Immersive learning experiences",
    is_club: false,
    creator_id: 2,
    max_members: 5,
    looking_for_members: true,
    skills_needed: ["Unity", "3D Design", "WebXR"],
    created_at: "2025-02-10T14:00:00Z",
  },
  {
    id: 11,
    name: "Open Source Contributors",
    description: "Contributing to global open source projects",
    is_club: true,
    creator_id: 3,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Git", "Any Programming Language"],
    created_at: "2025-01-18T11:00:00Z",
  },
  {
    id: 12,
    name: "Fintech Innovators",
    description: "Reimagining financial services for students",
    is_club: false,
    creator_id: 4,
    max_members: 4,
    looking_for_members: false,
    skills_needed: ["Python", "Finance", "APIs"],
    created_at: "2025-02-08T10:00:00Z",
  },
  {
    id: 13,
    name: "Design Thinkers",
    description: "Human-centered design for real problems",
    is_club: true,
    creator_id: 5,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Figma", "User Research", "Prototyping"],
    created_at: "2025-01-22T15:00:00Z",
  },
  {
    id: 14,
    name: "Cloud Architects",
    description: "Building scalable cloud infrastructure",
    is_club: false,
    creator_id: 6,
    max_members: 5,
    looking_for_members: true,
    skills_needed: ["AWS", "Docker", "Kubernetes"],
    created_at: "2025-02-12T09:00:00Z",
  },
  {
    id: 15,
    name: "Social Impact Lab",
    description: "Technology for social good",
    is_club: true,
    creator_id: 7,
    max_members: null,
    looking_for_members: true,
    skills_needed: ["Any Tech Skills", "Social Entrepreneurship"],
    created_at: "2025-01-28T13:00:00Z",
  },
];

// Team Members
export const teamMembers: TeamMember[] = [
  { team_id: 1, user_id: 1, role: "leader", joined_at: "2025-01-15T10:00:00Z" },
  { team_id: 1, user_id: 2, role: "member", joined_at: "2025-01-16T11:00:00Z" },
  { team_id: 1, user_id: 3, role: "member", joined_at: "2025-01-17T09:00:00Z" },
  { team_id: 2, user_id: 2, role: "leader", joined_at: "2025-01-10T09:00:00Z" },
  { team_id: 2, user_id: 4, role: "member", joined_at: "2025-01-11T14:00:00Z" },
  { team_id: 2, user_id: 5, role: "member", joined_at: "2025-01-12T16:00:00Z" },
  { team_id: 2, user_id: 6, role: "member", joined_at: "2025-01-13T10:00:00Z" },
  { team_id: 3, user_id: 3, role: "leader", joined_at: "2025-01-20T14:00:00Z" },
  { team_id: 3, user_id: 7, role: "member", joined_at: "2025-01-21T09:00:00Z" },
  { team_id: 4, user_id: 4, role: "leader", joined_at: "2025-01-08T11:00:00Z" },
  { team_id: 4, user_id: 8, role: "member", joined_at: "2025-01-09T15:00:00Z" },
  { team_id: 5, user_id: 5, role: "leader", joined_at: "2025-02-01T08:00:00Z" },
  { team_id: 5, user_id: 1, role: "member", joined_at: "2025-02-02T10:00:00Z" },
  { team_id: 6, user_id: 6, role: "leader", joined_at: "2025-01-25T16:00:00Z" },
  { team_id: 7, user_id: 7, role: "leader", joined_at: "2025-01-05T10:00:00Z" },
  { team_id: 7, user_id: 1, role: "member", joined_at: "2025-01-06T11:00:00Z" },
  { team_id: 7, user_id: 2, role: "member", joined_at: "2025-01-07T09:00:00Z" },
  { team_id: 8, user_id: 8, role: "leader", joined_at: "2025-02-05T12:00:00Z" },
  { team_id: 9, user_id: 1, role: "leader", joined_at: "2025-01-12T09:00:00Z" },
  { team_id: 10, user_id: 2, role: "leader", joined_at: "2025-02-10T14:00:00Z" },
];

// 25+ Projects
export const projects: Project[] = [
  {
    id: 1,
    title: "StudyBuddy AI",
    description: "An AI-powered study companion that adapts to your learning style",
    problem_statement: "Students struggle to find personalized study materials",
    solution_overview: "ML-based recommendation system with adaptive quizzes",
    tech_stack: ["Python", "TensorFlow", "React", "MongoDB"],
    is_public: true,
    status: "approved",
    team_id: 1,
    creator_id: 1,
    created_at: "2025-01-20T10:00:00Z",
    updated_at: "2025-02-15T14:00:00Z",
  },
  {
    id: 2,
    title: "CampusGreen",
    description: "IoT-based energy monitoring for sustainable campus buildings",
    problem_statement: "High energy consumption in campus buildings",
    solution_overview: "Smart sensors with real-time dashboards",
    tech_stack: ["Arduino", "Python", "React", "InfluxDB"],
    is_public: true,
    status: "in_progress",
    team_id: 2,
    creator_id: 2,
    created_at: "2025-01-18T09:00:00Z",
    updated_at: "2025-02-10T11:00:00Z",
  },
  {
    id: 3,
    title: "MindfulU",
    description: "Mental health tracking app for university students",
    problem_statement: "Rising mental health issues among students",
    solution_overview: "Mood tracking, guided exercises, and peer support",
    tech_stack: ["React Native", "Firebase", "Node.js"],
    is_public: true,
    status: "completed",
    team_id: 3,
    creator_id: 3,
    created_at: "2025-01-10T14:00:00Z",
    updated_at: "2025-02-20T16:00:00Z",
  },
  {
    id: 4,
    title: "BlockCred",
    description: "Blockchain-based credential verification system",
    problem_statement: "Credential fraud and slow verification",
    solution_overview: "Immutable credential storage on blockchain",
    tech_stack: ["Solidity", "Ethereum", "React", "Node.js"],
    is_public: false,
    status: "submitted",
    team_id: 4,
    creator_id: 4,
    created_at: "2025-01-25T11:00:00Z",
    updated_at: "2025-02-08T09:00:00Z",
  },
  {
    id: 5,
    title: "SkillMatch",
    description: "Data-driven job matching for graduates",
    problem_statement: "Graduates struggle to find relevant opportunities",
    solution_overview: "ML-based skill matching with company needs",
    tech_stack: ["Python", "Scikit-learn", "FastAPI", "PostgreSQL"],
    is_public: true,
    status: "approved",
    team_id: 5,
    creator_id: 5,
    created_at: "2025-02-01T08:00:00Z",
    updated_at: "2025-02-18T10:00:00Z",
  },
  {
    id: 6,
    title: "LearnOnGo",
    description: "Offline-first mobile learning platform",
    problem_statement: "Limited internet access for remote learners",
    solution_overview: "Progressive web app with smart caching",
    tech_stack: ["React Native", "SQLite", "AWS"],
    is_public: true,
    status: "in_progress",
    team_id: 6,
    creator_id: 6,
    created_at: "2025-01-28T16:00:00Z",
    updated_at: "2025-02-12T14:00:00Z",
  },
  {
    id: 7,
    title: "LabBot",
    description: "Autonomous lab assistant robot",
    problem_statement: "Repetitive tasks consume researcher time",
    solution_overview: "Programmable robot for lab automation",
    tech_stack: ["ROS", "Python", "Arduino", "OpenCV"],
    is_public: false,
    status: "submitted",
    team_id: 7,
    creator_id: 7,
    created_at: "2025-01-15T10:00:00Z",
    updated_at: "2025-02-05T11:00:00Z",
  },
  {
    id: 8,
    title: "EduQuest",
    description: "Gamified learning platform with RPG elements",
    problem_statement: "Low engagement in online courses",
    solution_overview: "Turn courses into adventure games",
    tech_stack: ["Unity", "C#", "Firebase", "Node.js"],
    is_public: true,
    status: "approved",
    team_id: 8,
    creator_id: 8,
    created_at: "2025-02-08T12:00:00Z",
    updated_at: "2025-02-22T15:00:00Z",
  },
  {
    id: 9,
    title: "SecureExam",
    description: "AI-proctored examination system",
    problem_statement: "Exam integrity in remote learning",
    solution_overview: "Computer vision-based proctoring",
    tech_stack: ["Python", "OpenCV", "TensorFlow", "React"],
    is_public: false,
    status: "submitted",
    team_id: 9,
    creator_id: 1,
    created_at: "2025-01-22T09:00:00Z",
    updated_at: "2025-02-10T13:00:00Z",
  },
  {
    id: 10,
    title: "VirtualLab",
    description: "VR chemistry lab simulator",
    problem_statement: "Limited access to physical labs",
    solution_overview: "Immersive VR lab experiences",
    tech_stack: ["Unity", "WebXR", "Three.js", "Node.js"],
    is_public: true,
    status: "in_progress",
    team_id: 10,
    creator_id: 2,
    created_at: "2025-02-12T14:00:00Z",
    updated_at: "2025-02-25T16:00:00Z",
  },
  {
    id: 11,
    title: "OpenNote",
    description: "Collaborative note-taking with AI summaries",
    problem_statement: "Notes are siloed and hard to share",
    solution_overview: "Real-time collaboration with AI enhancement",
    tech_stack: ["React", "WebSocket", "OpenAI", "PostgreSQL"],
    is_public: true,
    status: "draft",
    team_id: null,
    creator_id: 3,
    created_at: "2025-02-15T11:00:00Z",
    updated_at: "2025-02-15T11:00:00Z",
  },
  {
    id: 12,
    title: "BudgetBuddy",
    description: "Personal finance app for students",
    problem_statement: "Students lack financial literacy tools",
    solution_overview: "AI-powered budgeting with educational tips",
    tech_stack: ["React Native", "Node.js", "MongoDB"],
    is_public: true,
    status: "submitted",
    team_id: 12,
    creator_id: 4,
    created_at: "2025-02-10T10:00:00Z",
    updated_at: "2025-02-20T09:00:00Z",
  },
  {
    id: 13,
    title: "AccessLearn",
    description: "Accessibility toolkit for e-learning",
    problem_statement: "Online courses lack accessibility features",
    solution_overview: "Browser extension for enhanced accessibility",
    tech_stack: ["JavaScript", "Chrome Extension API", "React"],
    is_public: true,
    status: "approved",
    team_id: 13,
    creator_id: 5,
    created_at: "2025-01-30T15:00:00Z",
    updated_at: "2025-02-18T12:00:00Z",
  },
  {
    id: 14,
    title: "CloudLab",
    description: "One-click development environments",
    problem_statement: "Complex setup for programming courses",
    solution_overview: "Pre-configured cloud environments",
    tech_stack: ["Docker", "Kubernetes", "React", "Go"],
    is_public: false,
    status: "in_progress",
    team_id: 14,
    creator_id: 6,
    created_at: "2025-02-14T09:00:00Z",
    updated_at: "2025-02-26T11:00:00Z",
  },
  {
    id: 15,
    title: "FoodShare",
    description: "Campus food waste reduction platform",
    problem_statement: "Food waste in campus cafeterias",
    solution_overview: "Real-time food sharing and donation",
    tech_stack: ["React", "Node.js", "MongoDB", "Google Maps"],
    is_public: true,
    status: "completed",
    team_id: 15,
    creator_id: 7,
    created_at: "2025-01-08T13:00:00Z",
    updated_at: "2025-02-01T16:00:00Z",
  },
  {
    id: 16,
    title: "PeerReview Pro",
    description: "Structured peer review system for assignments",
    problem_statement: "Inconsistent peer feedback quality",
    solution_overview: "Guided review templates with rubrics",
    tech_stack: ["React", "Python", "Django", "PostgreSQL"],
    is_public: true,
    status: "draft",
    team_id: null,
    creator_id: 8,
    created_at: "2025-02-20T14:00:00Z",
    updated_at: "2025-02-20T14:00:00Z",
  },
  {
    id: 17,
    title: "ResearchHub",
    description: "Connecting students with research opportunities",
    problem_statement: "Difficulty finding research positions",
    solution_overview: "Matching platform for researchers and students",
    tech_stack: ["Next.js", "Prisma", "PostgreSQL"],
    is_public: true,
    status: "submitted",
    team_id: 11,
    creator_id: 3,
    created_at: "2025-02-05T10:00:00Z",
    updated_at: "2025-02-22T09:00:00Z",
  },
  {
    id: 18,
    title: "SmartSchedule",
    description: "AI-powered class scheduling assistant",
    problem_statement: "Complex course scheduling decisions",
    solution_overview: "Optimization algorithm for ideal schedules",
    tech_stack: ["Python", "React", "FastAPI"],
    is_public: true,
    status: "approved",
    team_id: 5,
    creator_id: 5,
    created_at: "2025-01-12T11:00:00Z",
    updated_at: "2025-02-08T14:00:00Z",
  },
  {
    id: 19,
    title: "CampusNav",
    description: "Indoor navigation for large campuses",
    problem_statement: "New students get lost on campus",
    solution_overview: "Bluetooth beacon-based indoor positioning",
    tech_stack: ["React Native", "BLE", "Node.js"],
    is_public: true,
    status: "in_progress",
    team_id: 6,
    creator_id: 6,
    created_at: "2025-02-18T16:00:00Z",
    updated_at: "2025-02-28T10:00:00Z",
  },
  {
    id: 20,
    title: "TutorConnect",
    description: "On-demand peer tutoring marketplace",
    problem_statement: "Difficulty finding timely academic help",
    solution_overview: "Real-time tutor matching and video calls",
    tech_stack: ["React", "WebRTC", "Node.js", "Stripe"],
    is_public: true,
    status: "submitted",
    team_id: 1,
    creator_id: 1,
    created_at: "2025-02-01T09:00:00Z",
    updated_at: "2025-02-15T11:00:00Z",
  },
  {
    id: 21,
    title: "EcoTracker",
    description: "Personal carbon footprint tracker for students",
    problem_statement: "Lack of awareness about environmental impact",
    solution_overview: "Daily tracking with gamification",
    tech_stack: ["React Native", "Firebase", "Charts.js"],
    is_public: true,
    status: "draft",
    team_id: null,
    creator_id: 2,
    created_at: "2025-02-25T10:00:00Z",
    updated_at: "2025-02-25T10:00:00Z",
  },
  {
    id: 22,
    title: "DebateArena",
    description: "Online debate platform with AI moderator",
    problem_statement: "Limited access to debate practice",
    solution_overview: "Structured debates with AI feedback",
    tech_stack: ["React", "OpenAI", "WebSocket", "Node.js"],
    is_public: false,
    status: "submitted",
    team_id: 8,
    creator_id: 8,
    created_at: "2025-02-12T13:00:00Z",
    updated_at: "2025-02-24T15:00:00Z",
  },
  {
    id: 23,
    title: "LibraryAI",
    description: "Smart library resource recommendation",
    problem_statement: "Hard to find relevant academic resources",
    solution_overview: "ML-based recommendation from library catalog",
    tech_stack: ["Python", "Elasticsearch", "React"],
    is_public: true,
    status: "approved",
    team_id: 5,
    creator_id: 5,
    created_at: "2025-01-28T14:00:00Z",
    updated_at: "2025-02-20T16:00:00Z",
  },
  {
    id: 24,
    title: "VolunteerHub",
    description: "Campus volunteer opportunity aggregator",
    problem_statement: "Scattered volunteer opportunities",
    solution_overview: "Centralized platform with impact tracking",
    tech_stack: ["React", "Node.js", "MongoDB"],
    is_public: true,
    status: "completed",
    team_id: 15,
    creator_id: 7,
    created_at: "2025-01-20T11:00:00Z",
    updated_at: "2025-02-15T09:00:00Z",
  },
  {
    id: 25,
    title: "LanguageExchange",
    description: "Peer language learning platform",
    problem_statement: "Limited language practice opportunities",
    solution_overview: "Match learners for conversation practice",
    tech_stack: ["React", "WebRTC", "Firebase"],
    is_public: true,
    status: "in_progress",
    team_id: null,
    creator_id: 4,
    created_at: "2025-02-22T10:00:00Z",
    updated_at: "2025-03-01T14:00:00Z",
  },
];

// Project Files
export const projectFiles: ProjectFile[] = [
  { id: 1, project_id: 1, file_type: "image", url: "https://via.placeholder.com/400x300/3b82f6/ffffff?text=StudyBuddy+AI", description: "Project mockup" },
  { id: 2, project_id: 1, file_type: "document", url: "#", description: "Technical specification" },
  { id: 3, project_id: 2, file_type: "image", url: "https://via.placeholder.com/400x300/22c55e/ffffff?text=CampusGreen", description: "Dashboard preview" },
  { id: 4, project_id: 3, file_type: "image", url: "https://via.placeholder.com/400x300/8b5cf6/ffffff?text=MindfulU", description: "App screenshot" },
  { id: 5, project_id: 5, file_type: "link", url: "https://github.com/example", description: "GitHub repository" },
  { id: 6, project_id: 8, file_type: "image", url: "https://via.placeholder.com/400x300/f59e0b/ffffff?text=EduQuest", description: "Game preview" },
  { id: 7, project_id: 10, file_type: "image", url: "https://via.placeholder.com/400x300/ec4899/ffffff?text=VirtualLab", description: "VR demo" },
  { id: 8, project_id: 15, file_type: "image", url: "https://via.placeholder.com/400x300/14b8a6/ffffff?text=FoodShare", description: "App interface" },
];

// Reviews (10 pending, 15 past)
export const reviews: Review[] = [
  { id: 1, project_id: 4, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 2, project_id: 7, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 3, project_id: 9, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 4, project_id: 12, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 5, project_id: 17, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 6, project_id: 20, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 7, project_id: 22, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 8, project_id: 4, reviewer_id: 99, status: "pending", comments: "", score_innovation: 0, score_feasibility: 0, score_impact: 0, reviewed_at: null },
  { id: 9, project_id: 1, reviewer_id: 99, status: "approved", comments: "Excellent innovation with strong potential", score_innovation: 9, score_feasibility: 8, score_impact: 9, reviewed_at: "2025-02-10T14:00:00Z" },
  { id: 10, project_id: 3, reviewer_id: 99, status: "approved", comments: "Well-executed project addressing real need", score_innovation: 8, score_feasibility: 9, score_impact: 10, reviewed_at: "2025-02-08T11:00:00Z" },
  { id: 11, project_id: 5, reviewer_id: 99, status: "approved", comments: "Great use of ML for practical problem", score_innovation: 8, score_feasibility: 7, score_impact: 8, reviewed_at: "2025-02-15T09:00:00Z" },
  { id: 12, project_id: 8, reviewer_id: 99, status: "approved", comments: "Innovative approach to engagement", score_innovation: 9, score_feasibility: 7, score_impact: 8, reviewed_at: "2025-02-18T16:00:00Z" },
  { id: 13, project_id: 13, reviewer_id: 99, status: "approved", comments: "Important accessibility focus", score_innovation: 7, score_feasibility: 9, score_impact: 9, reviewed_at: "2025-02-12T10:00:00Z" },
  { id: 14, project_id: 15, reviewer_id: 99, status: "approved", comments: "Wonderful social impact project", score_innovation: 8, score_feasibility: 9, score_impact: 10, reviewed_at: "2025-01-28T14:00:00Z" },
  { id: 15, project_id: 18, reviewer_id: 99, status: "approved", comments: "Useful tool for all students", score_innovation: 7, score_feasibility: 8, score_impact: 8, reviewed_at: "2025-02-05T11:00:00Z" },
  { id: 16, project_id: 23, reviewer_id: 99, status: "approved", comments: "Smart application of ML in education", score_innovation: 8, score_feasibility: 8, score_impact: 7, reviewed_at: "2025-02-16T15:00:00Z" },
  { id: 17, project_id: 24, reviewer_id: 99, status: "approved", comments: "Excellent community building tool", score_innovation: 7, score_feasibility: 9, score_impact: 9, reviewed_at: "2025-02-10T10:00:00Z" },
  { id: 18, project_id: 2, reviewer_id: 99, status: "revisions_needed", comments: "Need more detailed implementation plan", score_innovation: 7, score_feasibility: 5, score_impact: 8, reviewed_at: "2025-02-01T09:00:00Z" },
  { id: 19, project_id: 6, reviewer_id: 99, status: "revisions_needed", comments: "Technical approach needs refinement", score_innovation: 6, score_feasibility: 5, score_impact: 7, reviewed_at: "2025-02-08T14:00:00Z" },
];

// Events
export const events: Event[] = [
  {
    id: 1,
    title: "AI for Good Challenge",
    description: "48-hour hackathon focused on AI solutions for social impact. Create innovative applications that address real-world problems in healthcare, education, or sustainability.",
    theme: "Artificial Intelligence",
    start_date: "2025-03-15T09:00:00Z",
    end_date: "2025-03-17T18:00:00Z",
    participant_count: 156,
    status: "upcoming",
  },
  {
    id: 2,
    title: "Sustainability Hackathon",
    description: "Build tech solutions for environmental challenges. Focus on renewable energy, waste reduction, and sustainable campus initiatives.",
    theme: "Environment",
    start_date: "2025-04-20T09:00:00Z",
    end_date: "2025-04-22T18:00:00Z",
    participant_count: 89,
    status: "upcoming",
  },
  {
    id: 3,
    title: "EdTech Innovation Sprint",
    description: "One-week challenge to reimagine education technology. Create tools that enhance learning experiences for students worldwide.",
    theme: "Education",
    start_date: "2025-02-25T09:00:00Z",
    end_date: "2025-03-03T18:00:00Z",
    participant_count: 234,
    status: "ongoing",
  },
  {
    id: 4,
    title: "HealthTech Pitch Competition",
    description: "Present your healthcare innovation to industry experts. Win funding and mentorship for your health-focused startup.",
    theme: "Healthcare",
    start_date: "2025-01-15T14:00:00Z",
    end_date: "2025-01-15T20:00:00Z",
    participant_count: 42,
    status: "completed",
  },
  {
    id: 5,
    title: "Open Source Weekend",
    description: "Contribute to major open source projects with guidance from experienced maintainers. Great for beginners and experts alike.",
    theme: "Open Source",
    start_date: "2025-05-10T09:00:00Z",
    end_date: "2025-05-12T18:00:00Z",
    participant_count: 67,
    status: "upcoming",
  },
  {
    id: 6,
    title: "Winter Innovation Showcase",
    description: "Annual showcase of the best student projects from the past year. Network with industry partners and potential employers.",
    theme: "General",
    start_date: "2024-12-10T10:00:00Z",
    end_date: "2024-12-10T18:00:00Z",
    participant_count: 312,
    status: "completed",
  },
];

// Activities
export const activities: Activity[] = [
  { id: 1, message: "Team Alpha submitted 'TutorConnect' for review", timestamp: "2025-02-28T14:30:00Z", type: "project" },
  { id: 2, message: "Sarah Johnson joined Green Innovators Club", timestamp: "2025-02-28T12:15:00Z", type: "team" },
  { id: 3, message: "'MindfulU' project marked as completed", timestamp: "2025-02-28T10:00:00Z", type: "project" },
  { id: 4, message: "New event announced: AI for Good Challenge", timestamp: "2025-02-27T16:45:00Z", type: "event" },
  { id: 5, message: "Dr. Garcia approved 'LibraryAI' project", timestamp: "2025-02-27T11:20:00Z", type: "review" },
  { id: 6, message: "Cloud Architects team created", timestamp: "2025-02-26T09:30:00Z", type: "team" },
];

// Mock API functions with 500ms delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getTeams = async (): Promise<Team[]> => {
  await delay(500);
  return teams;
};

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  await delay(500);
  return teamMembers;
};

export const getProjects = async (): Promise<Project[]> => {
  await delay(500);
  return projects;
};

export const getProjectFiles = async (): Promise<ProjectFile[]> => {
  await delay(500);
  return projectFiles;
};

export const getReviews = async (): Promise<Review[]> => {
  await delay(500);
  return reviews;
};

export const getEvents = async (): Promise<Event[]> => {
  await delay(500);
  return events;
};

export const getActivities = async (): Promise<Activity[]> => {
  await delay(500);
  return activities;
};

export const getUsers = async (): Promise<User[]> => {
  await delay(500);
  return users;
};

export const getStats = async () => {
  await delay(500);
  return {
    totalTeams: 24,
    activeProjects: 42,
    pendingReviews: 8,
    upcomingEvents: 3,
  };
};
