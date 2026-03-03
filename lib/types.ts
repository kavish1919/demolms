// User types
export type UserRole = 'admin' | 'student' | 'trainer';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isActive: boolean;
  isBlocked: boolean;
  emailVerified: boolean;
  googleId?: string;
  referralCode?: string;
  referredBy?: string;
  dateOfBirth?: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

// Course types
export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  thumbnailUrl?: string;
  introVideoUrl?: string;
  durationHours: number;
  fee: number;
  discountFee?: number;
  trainerId?: string;
  trainer?: User;
  isActive: boolean;
  isFeatured: boolean;
  maxStudents?: number;
  enrollmentCount: number;
  rating: number;
  category?: string;
  level: CourseLevel;
  createdAt: string;
  updatedAt: string;
}

// Enrollment types
export type EnrollmentStatus = 'pending' | 'active' | 'completed' | 'cancelled';

export interface Enrollment {
  id: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  status: EnrollmentStatus;
  enrolledAt: string;
  completedAt?: string;
  progressPercent: number;
}

// Study Material types
export type MaterialType = 'pdf' | 'video' | 'note' | 'link';

export interface StudyMaterial {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  type: MaterialType;
  fileUrl?: string;
  durationMinutes?: number;
  orderIndex: number;
  isFree: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export interface Payment {
  id: string;
  studentId: string;
  student?: User;
  courseId: string;
  course?: Course;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod?: string;
  transactionId?: string;
  phonepeMerchantId?: string;
  phonepeTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

// Enquiry types
export type EnquiryStatus = 'new' | 'contacted' | 'converted' | 'closed';

export interface Enquiry {
  id: string;
  studentName: string;
  email: string;
  phone?: string;
  courseId?: string;
  course?: Course;
  message?: string;
  status: EnquiryStatus;
  assignedCounsellorId?: string;
  assignedCounsellor?: User;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Trainer Application types
export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

export interface TrainerApplication {
  id: string;
  userId?: string;
  fullName: string;
  email: string;
  phone?: string;
  resumeUrl?: string;
  experienceYears?: number;
  expertise?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  status: ApplicationStatus;
  adminNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
}

// Attendance types
export type AttendanceType = 'face' | 'manual';
export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface Attendance {
  id: string;
  userId: string;
  user?: User;
  courseId: string;
  course?: Course;
  date: string;
  type: AttendanceType;
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  faceImageUrl?: string;
  markedBy?: string;
  notes?: string;
  createdAt: string;
}

// Notification types
export type NotificationType = 'sms' | 'whatsapp' | 'email' | 'push';
export type NotificationStatus = 'pending' | 'sent' | 'failed';
export type TargetRole = 'all' | 'admin' | 'student' | 'trainer';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  targetRole?: TargetRole;
  targetUserId?: string;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  createdBy?: string;
  createdAt: string;
}

// Event types
export type EventType = 'birthday' | 'festival' | 'holiday' | 'custom';
export type SendTo = 'all' | 'students' | 'trainers';

export interface LMSEvent {
  id: string;
  title: string;
  description?: string;
  eventType: EventType;
  eventDate: string;
  posterUrl?: string;
  messageTemplate?: string;
  sendTo: SendTo;
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Live Class types
export type ClassPlatform = 'zoom' | 'webrtc' | 'youtube' | 'custom';
export type ClassStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export interface LiveClass {
  id: string;
  courseId: string;
  course?: Course;
  trainerId: string;
  trainer?: User;
  title: string;
  description?: string;
  meetingUrl?: string;
  meetingId?: string;
  platform: ClassPlatform;
  scheduledAt: string;
  durationMinutes: number;
  status: ClassStatus;
  recordingUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Settings types
export type SettingType = 'string' | 'number' | 'boolean' | 'json';

export interface Setting {
  id: string;
  settingKey: string;
  settingValue?: string;
  settingType: SettingType;
  category?: string;
  description?: string;
  isSensitive: boolean;
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Audit Log types
export interface AuditLog {
  id: string;
  userId?: string;
  user?: User;
  action: string;
  entityType?: string;
  entityId?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalStudents: number;
  totalTrainers: number;
  totalCourses: number;
  activeCourses: number;
  totalRevenue: number;
  pendingEnquiries: number;
  pendingApplications: number;
  todayAttendance: number;
  recentPayments: Payment[];
  recentEnquiries: Enquiry[];
  enrollmentTrend: { date: string; count: number }[];
  revenueTrend: { date: string; amount: number }[];
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
