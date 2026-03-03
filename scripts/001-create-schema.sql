-- Codevocado LMS Database Schema for MySQL
-- Version 1.0

-- Users table (Admin, Student, Trainer)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'student', 'trainer') NOT NULL DEFAULT 'student',
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  is_blocked BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  google_id VARCHAR(255),
  referral_code VARCHAR(20) UNIQUE,
  referred_by VARCHAR(36),
  date_of_birth DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP,
  INDEX idx_users_email (email),
  INDEX idx_users_role (role),
  INDEX idx_users_referral (referral_code),
  FOREIGN KEY (referred_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  short_description VARCHAR(500),
  thumbnail_url VARCHAR(500),
  intro_video_url VARCHAR(500),
  duration_hours INT DEFAULT 0,
  fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  discount_fee DECIMAL(10,2),
  trainer_id VARCHAR(36),
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  max_students INT,
  enrollment_count INT DEFAULT 0,
  rating DECIMAL(3,2) DEFAULT 0,
  category VARCHAR(100),
  level ENUM('beginner', 'intermediate', 'advanced') DEFAULT 'beginner',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_slug (slug),
  INDEX idx_courses_trainer (trainer_id),
  INDEX idx_courses_category (category),
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Course Enrollments
CREATE TABLE IF NOT EXISTS enrollments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  student_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled') DEFAULT 'pending',
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  progress_percent INT DEFAULT 0,
  UNIQUE KEY unique_enrollment (student_id, course_id),
  INDEX idx_enrollments_student (student_id),
  INDEX idx_enrollments_course (course_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Study Materials
CREATE TABLE IF NOT EXISTS study_materials (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  course_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type ENUM('pdf', 'video', 'note', 'link') NOT NULL,
  file_url VARCHAR(500),
  duration_minutes INT,
  order_index INT DEFAULT 0,
  is_free BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_materials_course (course_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Payments
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  student_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  status ENUM('pending', 'success', 'failed', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  transaction_id VARCHAR(255),
  phonepe_merchant_id VARCHAR(255),
  phonepe_transaction_id VARCHAR(255),
  payment_response JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_student (student_id),
  INDEX idx_payments_course (course_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_transaction (transaction_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
);

-- Student Enquiries
CREATE TABLE IF NOT EXISTS enquiries (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  student_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  course_id VARCHAR(36),
  message TEXT,
  status ENUM('new', 'contacted', 'converted', 'closed') DEFAULT 'new',
  assigned_counsellor_id VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_enquiries_status (status),
  INDEX idx_enquiries_counsellor (assigned_counsellor_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL,
  FOREIGN KEY (assigned_counsellor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Trainer Applications
CREATE TABLE IF NOT EXISTS trainer_applications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  full_name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  resume_url VARCHAR(500),
  experience_years INT,
  expertise TEXT,
  linkedin_url VARCHAR(500),
  portfolio_url VARCHAR(500),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  reviewed_by VARCHAR(36),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_trainer_apps_status (status),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Attendance Records
CREATE TABLE IF NOT EXISTS attendance (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  course_id VARCHAR(36) NOT NULL,
  date DATE NOT NULL,
  type ENUM('face', 'manual') NOT NULL,
  status ENUM('present', 'absent', 'late') DEFAULT 'present',
  check_in_time TIME,
  check_out_time TIME,
  face_image_url VARCHAR(500),
  marked_by VARCHAR(36),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_attendance (user_id, course_id, date),
  INDEX idx_attendance_user (user_id),
  INDEX idx_attendance_course (course_id),
  INDEX idx_attendance_date (date),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('sms', 'whatsapp', 'email', 'push') NOT NULL,
  target_role ENUM('all', 'admin', 'student', 'trainer'),
  target_user_id VARCHAR(36),
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  scheduled_at TIMESTAMP,
  sent_at TIMESTAMP,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_status (status),
  INDEX idx_notifications_target (target_user_id),
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Events & Festivals
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  event_type ENUM('birthday', 'festival', 'holiday', 'custom') NOT NULL,
  event_date DATE NOT NULL,
  poster_url VARCHAR(500),
  message_template TEXT,
  send_to ENUM('all', 'students', 'trainers') DEFAULT 'all',
  is_active BOOLEAN DEFAULT TRUE,
  created_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_events_date (event_date),
  INDEX idx_events_type (event_type),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Live Classes
CREATE TABLE IF NOT EXISTS live_classes (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  course_id VARCHAR(36) NOT NULL,
  trainer_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  meeting_url VARCHAR(500),
  meeting_id VARCHAR(100),
  platform ENUM('zoom', 'webrtc', 'youtube', 'custom') DEFAULT 'zoom',
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INT DEFAULT 60,
  status ENUM('scheduled', 'live', 'completed', 'cancelled') DEFAULT 'scheduled',
  recording_url VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_live_classes_course (course_id),
  INDEX idx_live_classes_trainer (trainer_id),
  INDEX idx_live_classes_scheduled (scheduled_at),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (trainer_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Referral Rewards
CREATE TABLE IF NOT EXISTS referral_rewards (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  referrer_id VARCHAR(36) NOT NULL,
  referred_id VARCHAR(36) NOT NULL,
  reward_points INT DEFAULT 0,
  reward_amount DECIMAL(10,2) DEFAULT 0,
  status ENUM('pending', 'credited', 'expired') DEFAULT 'pending',
  credited_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_rewards_referrer (referrer_id),
  INDEX idx_rewards_referred (referred_id),
  FOREIGN KEY (referrer_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (referred_id) REFERENCES users(id) ON DELETE CASCADE
);

-- System Settings
CREATE TABLE IF NOT EXISTS settings (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  category VARCHAR(50),
  description VARCHAR(500),
  is_sensitive BOOLEAN DEFAULT FALSE,
  updated_by VARCHAR(36),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_key (setting_key),
  INDEX idx_settings_category (category),
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id VARCHAR(36),
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_action (action),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_created (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sessions table for JWT token management
CREATE TABLE IF NOT EXISTS sessions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  is_valid BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sessions_user (user_id),
  INDEX idx_sessions_token (token_hash),
  INDEX idx_sessions_expires (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123 - should be changed)
INSERT INTO users (id, email, password_hash, role, first_name, last_name, is_active, email_verified)
VALUES (
  UUID(),
  'admin@codevocado.in',
  '$2b$10$rIC6nWXOGT7pPVGqvLf/7uGX6g0lMM0lN6qL8YE3wVXF7vR8YOQKa',
  'admin',
  'Super',
  'Admin',
  TRUE,
  TRUE
);

-- Insert default settings
INSERT INTO settings (id, setting_key, setting_value, setting_type, category, description) VALUES
(UUID(), 'site_name', 'Codevocado LMS', 'string', 'general', 'Website name'),
(UUID(), 'site_logo', '/images/logo.png', 'string', 'general', 'Website logo URL'),
(UUID(), 'contact_email', 'contact@codevocado.in', 'string', 'general', 'Contact email'),
(UUID(), 'sms_api_enabled', 'false', 'boolean', 'notifications', 'Enable SMS notifications'),
(UUID(), 'whatsapp_api_enabled', 'false', 'boolean', 'notifications', 'Enable WhatsApp notifications'),
(UUID(), 'email_smtp_enabled', 'true', 'boolean', 'notifications', 'Enable email notifications'),
(UUID(), 'phonepe_merchant_id', '', 'string', 'payments', 'PhonePe Merchant ID'),
(UUID(), 'phonepe_api_key', '', 'string', 'payments', 'PhonePe API Key'),
(UUID(), 'phonepe_callback_url', '', 'string', 'payments', 'PhonePe Callback URL'),
(UUID(), 'referral_reward_points', '100', 'number', 'referral', 'Points awarded for referral'),
(UUID(), 'referral_reward_amount', '50', 'number', 'referral', 'Amount (INR) awarded for referral');
