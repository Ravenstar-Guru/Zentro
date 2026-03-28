// Pre-populated skills catalog
export const SKILLS_CATEGORIES: Record<string, string[]> = {
  programming: [
    'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Node.js',
    'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++',
    'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart',
    'SQL', 'MongoDB', 'PostgreSQL', 'Redis', 'GraphQL', 'REST APIs',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'DevOps',
    'Machine Learning', 'Data Science', 'AI/ML', 'TensorFlow', 'PyTorch'
  ],
  design: [
    'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator',
    'UI Design', 'UX Design', 'Web Design', 'Mobile Design',
    'Brand Identity', 'Typography', 'Color Theory', 'Prototyping',
    'Wireframing', 'User Research', 'Interaction Design',
    'Motion Design', 'After Effects', 'Principle', 'Lottie'
  ],
  business: [
    'Marketing', 'Digital Marketing', 'SEO', 'Content Marketing',
    'Social Media', 'Analytics', 'Google Analytics', 'Growth Hacking',
    'Sales', 'CRM', 'HubSpot', 'Salesforce', 'Negotiation',
    'Strategy', 'Finance', 'Accounting', 'Project Management',
    'Agile', 'Scrum', 'Product Management', 'Business Analysis'
  ],
  languages: [
    'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
    'Chinese', 'Mandarin', 'Cantonese', 'Japanese', 'Korean',
    'Hindi', 'Arabic', 'Russian', 'Dutch', 'Swedish', 'Norwegian',
    'Danish', 'Finnish', 'Thai', 'Vietnamese', 'Indonesian'
  ],
  music: [
    'Piano', 'Guitar', 'Violin', 'Drums', 'Bass', 'Vocals',
    'Music Production', 'Ableton', 'FL Studio', 'Logic Pro',
    'Pro Tools', 'Mixing', 'Mastering', 'Songwriting',
    'Composition', 'Music Theory', 'DJing', 'Beat Making'
  ],
  art: [
    'Drawing', 'Painting', 'Watercolor', 'Oil Painting',
    'Digital Art', 'Procreate', 'Concept Art', 'Character Design',
    'Illustration', 'Comics', 'Animation', '3D Modeling',
    'Blender', 'Maya', 'Cinema 4D', 'ZBrush', 'Substance Painter'
  ],
  writing: [
    'Copywriting', 'Content Writing', 'Technical Writing',
    'Blog Writing', ' Journalism', 'Creative Writing',
    'Editing', 'Proofreading', 'Grant Writing', 'Script Writing',
    'Storytelling', 'SEO Writing', 'Academic Writing'
  ],
  marketing: [
    'Brand Strategy', 'Market Research', 'Public Relations',
    'Email Marketing', 'Marketing Automation', 'Campaign Management',
    'Copywriting', 'Content Strategy', 'Video Marketing',
    'Influencer Marketing', 'Affiliate Marketing', 'E-commerce'
  ],
  teaching: [
    'Curriculum Design', 'Lesson Planning', 'Online Teaching',
    'Tutoring', 'Mentoring', 'Workshop Facilitation',
    'E-learning', 'Instructional Design', 'Assessment',
    'Classroom Management', 'Pedagogy'
  ],
  other: [
    'Photography', 'Videography', 'Video Editing', 'Cooking',
    'Baking', 'Fitness', 'Yoga', 'Meditation', 'Gardening',
    'Carpentry', 'Plumbing', 'Electrical', 'Mechanic',
    'Public Speaking', 'Leadership', 'Team Building'
  ]
};

export const ALL_SKILLS = Object.values(SKILLS_CATEGORIES).flat();

export const SKILL_CATEGORY_LABELS: Record<string, string> = {
  programming: 'Programming',
  design: 'Design',
  business: 'Business',
  languages: 'Languages',
  music: 'Music',
  art: 'Art',
  writing: 'Writing',
  marketing: 'Marketing',
  teaching: 'Teaching',
  other: 'Other'
};

export const AVAILABILITY_OPTIONS = [
  { value: 'part-time', label: 'Part-time' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'weekends', label: 'Weekends only' },
  { value: 'flexible', label: 'Flexible' }
];

export const SKILL_LEVEL_OPTIONS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

export const CONNECTION_PURPOSE_OPTIONS = [
  { value: 'learn_basics', label: 'Learn Basics', description: 'I want to learn the fundamentals' },
  { value: 'long_term', label: 'Long-term Exchange', description: 'Looking for ongoing mentorship or collaboration' },
  { value: 'quick_help', label: 'Quick Help', description: 'Need help with a specific problem or question' }
];

// Minimum match percentage to show in feed
export const MIN_MATCH_PERCENTAGE = 25;

// Section thresholds
export const BEST_MATCH_THRESHOLD = 60;
export const COLLEGE_MATCH_THRESHOLD = 40;
export const AREA_MATCH_THRESHOLD = 30;
