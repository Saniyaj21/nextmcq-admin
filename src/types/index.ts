export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  profileImage?: { url: string | null; publicId: string | null };
  institute?: Institute | string | null;
  isActive: boolean;
  isProfileComplete: boolean;
  isEmailVerified: boolean;
  lastLoginAt: string | null;
  rewards: { coins: number; xp: number; level: number };
  student: {
    totalTests: number;
    correctAnswers: number;
    totalQuestions: number;
    attemptedTests: { testId: string; attemptsCount: number }[];
  };
  teacher: {
    testsCreated: number;
    questionsCreated: number;
    studentsTaught: number;
    totalAttemptsOfStudents: number;
  };
  badges: Badge[];
  referralCode?: string;
  subjects?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  name: string;
  category: 'global' | 'students' | 'teachers';
  month: number;
  year: number;
  tier: 'CHAMPION' | 'ELITE' | 'ACHIEVER' | 'PERFORMER' | 'UNPLACED';
  rank: number;
  earnedAt: string;
}

export interface Institute {
  _id: string;
  name: string;
  location?: string;
  type: 'school' | 'college' | 'university' | 'academy' | 'institute';
  isActive: boolean;
  studentCount: number;
  teacherCount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Test {
  _id: string;
  title: string;
  subject: string;
  chapter?: string;
  description?: string;
  timeLimit: number;
  coinFee: number;
  isPublic: boolean;
  attemptsCount: number;
  averageRating: number;
  totalRatings: number;
  createdBy: Pick<User, '_id' | 'name' | 'email'> | string;
  questions: (Question | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
  tests: string[];
  createdBy: Pick<User, '_id' | 'name' | 'email'> | string;
  createdAt: string;
}

export interface TestAttempt {
  _id: string;
  userId: string;
  testId: string;
  status: 'in_progress' | 'completed' | 'abandoned' | 'timed_out';
  score: { correct: number; total: number; percentage: number };
  timeSpent: number;
  rewards: { coins: number; xp: number };
  createdAt: string;
}

export interface Feedback {
  _id: string;
  userId: Pick<User, '_id' | 'name' | 'email' | 'profileImage' | 'role'> | string;
  type: 'general' | 'bug' | 'feature' | 'question';
  subject: string;
  message: string;
  email: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  adminResponse: string | null;
  respondedBy: Pick<User, '_id' | 'name' | 'email'> | string | null;
  respondedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  imageURL: string;
  isActive: boolean;
  createdAt: string;
}

export interface Post {
  _id: string;
  type: 'teacher_test_created' | 'student_test_attempt' | 'user_joined' | 'user_post';
  creator: Pick<User, '_id' | 'name' | 'email'> | string | null;
  data: Record<string, unknown>;
  title: string;
  description: string;
  createdAt: string;
}

export interface MonthlyReward {
  _id: string;
  month: number;
  year: number;
  category: 'global' | 'students' | 'teachers';
  userId: Pick<User, '_id' | 'name' | 'email' | 'role'> | string;
  rank: number;
  tier: 'CHAMPION' | 'ELITE' | 'ACHIEVER' | 'PERFORMER' | 'UNPLACED';
  coinsAwarded: number;
  xpAwarded: number;
  badgeAwarded: string;
  status: 'pending' | 'awarded' | 'failed';
  createdAt: string;
}

export interface MonthlyRewardJob {
  _id: string;
  month: number;
  year: number;
  category: 'students' | 'teachers';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalUsers: number;
  processedUsers: number;
  failedUsers: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalTeachers: number;
  totalTests: number;
  totalAttempts: number;
  totalFeedback: number;
  pendingFeedback: number;
  totalInstitutes: number;
  activeUsers24h: number;
}

export interface GrowthData {
  _id: string;
  count: number;
}
