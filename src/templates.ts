import { KanbanBoardData, KanbanColumn, KanbanTask } from './types';

export type TemplateField =
  | 'subtitle'
  | 'description'
  | 'assignee'
  | 'deadline'
  | 'priority'
  | 'progress'
  | 'budget'
  | 'actualCost'
  | 'rating'
  | 'imageUrl'
  | 'status'
  | 'completed'
  | 'notes'

  // Student / Academic fields
  | 'subject'
  | 'course'
  | 'unit'
  | 'topic'
  | 'chapter'
  | 'examDate'
  | 'examType'
  | 'difficulty'
  | 'studyTime'
  | 'score'
  | 'grade'
  | 'dueDate'
  | 'submissionDate'
  | 'company'
  | 'role'
  | 'location'
  | 'jobType'
  | 'applicationDate'
  | 'interviewDate'
  | 'salary'
  | 'problemCount'
  | 'solvedCount'
  | 'revisitDate'
  | 'milestone';

export interface ProjectTemplate extends KanbanBoardData {
  name: string;
  subtitle: string;
  fields: TemplateField[];
}

const blank = (fields: TemplateField[] = ['description']): KanbanTask[] => [];
const dayColumns = (prefix: string, title: string, color: string): KanbanColumn[] =>
  Array.from({ length: 31 }, (_, index) => ({
    id: `${prefix}-${index + 1}`,
    title: `${title} ${index + 1}`,
    color
  }));

export const PROJECT_TEMPLATES: Record<string, ProjectTemplate> = {
  blank: {
    name: 'Untitled',
    subtitle: 'A blank room with a simple generic tracker structure',
    fields: ['subtitle', 'status', 'priority', 'completed', 'notes'],
    columns: [
      { id: 'field1', title: 'Field 1', color: '#64748b' },
      { id: 'field2', title: 'Field 2', color: '#6366f1' },
      { id: 'field3', title: 'Field 3', color: '#f59e0b' },
      { id: 'field4', title: 'Field 4', color: '#10b981' }
    ],
    tasks: blank()
  },
 
    // work templates

    software: {
    name: 'Software Engineering Project',
    subtitle: 'Full-stack software delivery & sprints',
    fields: ['subtitle', 'assignee', 'deadline', 'priority', 'progress', 'budget', 'actualCost', 'description'],
    columns: [
      { id: 'arch', title: 'Architecture & Design', color: '#6366f1' },
      { id: 'frontend', title: 'Frontend & UI', color: '#06b6d4' },
      { id: 'backend', title: 'Backend & APIs', color: '#a855f7' },
      { id: 'qa', title: 'QA & Testing', color: '#f59e0b' },
      { id: 'devops', title: 'DevOps & Launch', color: '#10b981' }
    ],
    tasks: blank()
  },


//   home: {
//     name: 'Home Improvement Project Planner',
//     subtitle: 'Space renovation & contractor milestones',
//     fields: ['subtitle', 'assignee', 'deadline', 'priority', 'progress', 'budget', 'actualCost', 'description'],
//     columns: [
//       { id: 'porch', title: 'Porch', color: '#ef4444' }, { id: 'living-room', title: 'Living Room', color: '#a855f7' },
//       { id: 'kitchen', title: 'Kitchen', color: '#06b6d4' }, { id: 'bathroom', title: 'Bathroom', color: '#f59e0b' },
//       { id: 'bedroom', title: 'Bedroom', color: '#3b82f6' }, { id: 'study', title: 'Study', color: '#10b981' }
//     ],
//     tasks: blank()
//   },

//   tracer templates

  moviesShows: {
    name: 'Movies & TV Shows Tracker', subtitle: 'Track your watch progress, watchlist, and completed shows', fields: ['imageUrl', 'rating', 'status', 'completed', 'notes'], columns: [
      { id: 'watchlist', title: 'Watchlist', color: '#64748b' }, { id: 'watching', title: 'Currently Watching', color: '#6366f1' }, { id: 'onHold', title: 'On Hold', color: '#f59e0b' }, { id: 'completed', title: 'Completed', color: '#10b981' }, { id: 'dropped', title: 'Dropped', color: '#ef4444' }
    ], tasks: blank()
  },
  animeManga: {
    name: 'Anime & Manga Tracker', subtitle: 'Track anime episodes, manga chapters, and reading status', fields: ['imageUrl', 'rating', 'status', 'completed', 'notes'], columns: [
      { id: 'planToWatch', title: 'Plan to Watch/Read', color: '#64748b' }, { id: 'inProgress', title: 'Watching/Reading', color: '#06b6d4' }, { id: 'onHold', title: 'On Hold', color: '#f59e0b' }, { id: 'completed', title: 'Completed', color: '#10b981' }, { id: 'dropped', title: 'Dropped', color: '#ef4444' }
    ], tasks: blank()
  },
  reading: {
    name: 'Reading Tracker', subtitle: 'Track books, articles, and research papers', fields: ['imageUrl', 'rating', 'status', 'completed', 'notes'], columns: [
      { id: 'toRead', title: 'To Read', color: '#64748b' }, { id: 'reading', title: 'Currently Reading', color: '#6366f1' }, { id: 'review', title: 'In Review / Notes', color: '#f59e0b' }, { id: 'finished', title: 'Finished', color: '#10b981' }
    ], tasks: blank()
  },
  generalTemplate: {
    name: 'General Tracker', subtitle: 'A versatile board for tracking generic tasks and items', fields: ['status', 'priority', 'completed', 'notes'], columns: [
      { id: 'backlog', title: 'Backlog', color: '#64748b' }, { id: 'todo', title: 'To Do', color: '#3b82f6' }, { id: 'inProgress', title: 'In Progress', color: '#f59e0b' }, { id: 'completed', title: 'Completed', color: '#10b981' }
    ], tasks: blank()
  },
  jobSearch: {
    name: 'Job Search Tracker', subtitle: 'Track applications from discovery to offer', fields: ['subtitle', 'imageUrl', 'status', 'deadline', 'completed', 'notes'], columns: [
      { id: 'saved', title: 'Saved', color: '#64748b' }, { id: 'applied', title: 'Applied', color: '#6366f1' }, { id: 'interview', title: 'Interview', color: '#f59e0b' }, { id: 'offer', title: 'Offer', color: '#10b981' }, { id: 'rejected', title: 'Rejected', color: '#ef4444' }
    ], tasks: blank()
  },
  finance: {
    name: 'Finance Tracker', subtitle: 'Track daily income, spending, and financial notes for a month', fields: ['status', 'budget', 'actualCost', 'completed', 'notes'], columns: dayColumns('day', 'Day', '#10b981'), tasks: blank()
  },
  habits: {
    name: 'Monthly Habits Tracker', subtitle: 'Track daily habit progress across a month', fields: ['status', 'completed', 'notes'], columns: dayColumns('day', 'Day', '#06b6d4'), tasks: blank()
  },

//   creator templates

  contentCreator: {
    name: 'Content Creator Planner', subtitle: 'Manage ideas, content production, publishing & growth', fields: ['subtitle', 'deadline', 'priority', 'progress', 'notes'], columns: [
      { id: 'ideas', title: 'Ideas', color: '#64748b' }, { id: 'research', title: 'Research', color: '#6366f1' }, { id: 'creating', title: 'Creating', color: '#06b6d4' }, { id: 'editing', title: 'Editing', color: '#f59e0b' }, { id: 'published', title: 'Published', color: '#10b981' }, { id: 'analytics', title: 'Analytics', color: '#a855f7' }
    ], tasks: blank()
  },
  youtubeCreator: {
    name: 'YouTube Creator', subtitle: 'From video idea to publishing, promotion & analytics', fields: ['subtitle', 'deadline', 'priority', 'progress', 'imageUrl', 'notes'], columns: [
      { id: 'ideas', title: '💡 Ideation', color: '#64748b' }, { id: 'research', title: '🔎 Research', color: '#6366f1' }, { id: 'script', title: '📝 Scriptwriting', color: '#8b5cf6' }, { id: 'recording', title: '🎙️ Recording', color: '#06b6d4' }, { id: 'editing', title: '🎬 Video Editing', color: '#f59e0b' }, { id: 'ready', title: '🚀 Ready to Publish', color: '#f97316' }, { id: 'published', title: '✅ Published', color: '#10b981' }, { id: 'analytics', title: '📊 Analytics', color: '#a855f7' }
    ], tasks: blank()
  },
  blogWriter: {
    name: 'Blog Writer', subtitle: 'Research, write, optimize & publish articles', fields: ['subtitle', 'deadline', 'priority', 'progress', 'imageUrl', 'notes'], columns: [
      { id: 'ideas', title: '💡 Ideas', color: '#64748b' }, { id: 'research', title: '🔎 Research', color: '#6366f1' }, { id: 'outline', title: '📋 Outline', color: '#8b5cf6' }, { id: 'writing', title: '✍️ Writing', color: '#06b6d4' }, { id: 'editing', title: '📝 Editing', color: '#f59e0b' }, { id: 'seo', title: '🔍 SEO', color: '#f97316' }, { id: 'published', title: '✅ Published', color: '#10b981' }, { id: 'analytics', title: '📊 Analytics', color: '#a855f7' }
    ], tasks: blank()
  }, 

//   student productivity templates

studentSyllabus: {

  name: 'Student Syllabus Tracker',

  subtitle: 'Track subjects, chapters, topics and revision progress',

  fields: [
    'subject',
    'unit',
    'chapter',
    'topic',
    'difficulty',
    'priority',
    'progress',
    'deadline',
    'notes'
  ],

  columns: [
    {
      id: 'toLearn',
      title: 'To Learn',
      color: '#64748b'
    },
    {
      id: 'learning',
      title: 'Learning',
      color: '#6366f1'
    },
    {
      id: 'revision',
      title: 'Revision',
      color: '#f59e0b'
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


examPreparation: {

  name: 'Exam Preparation Tracker',

  subtitle: 'Prepare for exams topic-by-topic and track revision',

  fields: [
    'subject',
    'unit',
    'chapter',
    'topic',
    'examType',
    'examDate',
    'difficulty',
    'priority',
    'progress',
    'studyTime',
    'score',
    'notes'
  ],

  columns: [
    {
      id: 'notStarted',
      title: 'Not Started',
      color: '#64748b'
    },
    {
      id: 'studying',
      title: 'Studying',
      color: '#6366f1'
    },
    {
      id: 'revised',
      title: 'Revised',
      color: '#06b6d4'
    },
    {
      id: 'mockTest',
      title: 'Mock Test',
      color: '#f59e0b'
    },
    {
      id: 'mastered',
      title: 'Mastered',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


assignments: {

  name: 'Assignment Tracker',

  subtitle: 'Track assignments, submissions and academic deadlines',

  fields: [
    'subject',
    'course',
    'topic',
    'description',
    'dueDate',
    'submissionDate',
    'priority',
    'progress',
    'grade',
    'notes'
  ],

  columns: [
    {
      id: 'upcoming',
      title: 'Upcoming',
      color: '#64748b'
    },
    {
      id: 'working',
      title: 'Working On',
      color: '#6366f1'
    },
    {
      id: 'review',
      title: 'Review',
      color: '#f59e0b'
    },
    {
      id: 'submitted',
      title: 'Submitted',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


studyPlanner: {

  name: 'Study Planner',

  subtitle: 'Plan focused study sessions and track study time',

  fields: [
    'subject',
    'topic',
    'chapter',
    'deadline',
    'priority',
    'studyTime',
    'progress',
    'notes'
  ],

  columns: [
    {
      id: 'planned',
      title: 'Planned',
      color: '#64748b'
    },
    {
      id: 'today',
      title: 'Today',
      color: '#6366f1'
    },
    {
      id: 'inProgress',
      title: 'In Progress',
      color: '#f59e0b'
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


placementPreparation: {

  name: 'Placement Preparation',

  subtitle: 'Track DSA, technical skills, aptitude and interview preparation',

  fields: [
    'topic',
    'subject',
    'difficulty',
    'priority',
    'progress',
    'problemCount',
    'solvedCount',
    'studyTime',
    'revisitDate',
    'notes'
  ],

  columns: [
    {
      id: 'toLearn',
      title: 'To Learn',
      color: '#64748b'
    },
    {
      id: 'learning',
      title: 'Learning',
      color: '#6366f1'
    },
    {
      id: 'practice',
      title: 'Practice',
      color: '#f59e0b'
    },
    {
      id: 'mock',
      title: 'Mock / Interview',
      color: '#8b5cf6'
    },
    {
      id: 'ready',
      title: 'Interview Ready',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


// jobApplications: {

//   name: 'Student Job & Internship Tracker',

//   subtitle: 'Track internships, placements and job applications',

//   fields: [
//     'company',
//     'role',
//     'location',
//     'jobType',
//     'applicationDate',
//     'deadline',
//     'interviewDate',
//     'priority',
//     'salary',
//     'notes'
//   ],

//   columns: [
//     {
//       id: 'saved',
//       title: 'Saved',
//       color: '#64748b'
//     },
//     {
//       id: 'applied',
//       title: 'Applied',
//       color: '#6366f1'
//     },
//     {
//       id: 'interview',
//       title: 'Interview',
//       color: '#f59e0b'
//     },
//     {
//       id: 'offer',
//       title: 'Offer',
//       color: '#10b981'
//     },
//     {
//       id: 'rejected',
//       title: 'Rejected',
//       color: '#ef4444'
//     }
//   ],

//   tasks: blank()
// },


dsaTracker: {

  name: 'DSA Problem Tracker',

  subtitle: 'Track coding problems, patterns and revision',

  fields: [
    'topic',
    'difficulty',
    'problemCount',
    'solvedCount',
    'priority',
    'progress',
    'revisitDate',
    'notes'
  ],

  columns: [
    {
      id: 'todo',
      title: 'To Solve',
      color: '#64748b'
    },
    {
      id: 'solving',
      title: 'Solving',
      color: '#6366f1'
    },
    {
      id: 'solved',
      title: 'Solved',
      color: '#06b6d4'
    },
    {
      id: 'revisit',
      title: 'Revisit',
      color: '#f59e0b'
    },
    {
      id: 'mastered',
      title: 'Mastered',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


academicProject: {

  name: 'Academic Project Planner',

  subtitle: 'Manage semester and final-year projects',

  fields: [
    'milestone',
    'subject',
    'assignee',
    'deadline',
    'priority',
    'progress',
    'difficulty',
    'notes'
  ],

  columns: [
    {
      id: 'ideas',
      title: 'Ideas',
      color: '#64748b'
    },
    {
      id: 'planning',
      title: 'Planning',
      color: '#6366f1'
    },
    {
      id: 'development',
      title: 'Development',
      color: '#06b6d4'
    },
    {
      id: 'testing',
      title: 'Testing',
      color: '#f59e0b'
    },
    {
      id: 'documentation',
      title: 'Documentation',
      color: '#8b5cf6'
    },
    {
      id: 'submitted',
      title: 'Submitted',
      color: '#10b981'
    }
  ],

  tasks: blank()
},


collegeDeadlines: {

  name: 'College Deadlines',

  subtitle: 'Track exams, forms, registrations and college deadlines',

  fields: [
    'subject',
    'description',
    'dueDate',
    'deadline',
    'priority',
    'completed',
    'notes'
  ],

  columns: [
    {
      id: 'upcoming',
      title: 'Upcoming',
      color: '#64748b'
    },
    {
      id: 'dueSoon',
      title: 'Due Soon',
      color: '#f59e0b'
    },
    {
      id: 'urgent',
      title: 'Urgent',
      color: '#ef4444'
    },
    {
      id: 'completed',
      title: 'Completed',
      color: '#10b981'
    }
  ],

  tasks: blank()
},

};



export const DEFAULT_ROOM_DATA: KanbanBoardData = {
  projectName: PROJECT_TEMPLATES.software.name,
  columns: PROJECT_TEMPLATES.software.columns,
  tasks: PROJECT_TEMPLATES.software.tasks
};
