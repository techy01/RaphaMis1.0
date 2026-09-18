-- ==============================================================================
-- RaphaMIS Enterprise Health Information Management System
-- Production MySQL 8.x / MariaDB Complete DDL Schema & Master Seed Script
-- Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- Target Environment: Linux VPS (Ubuntu / Debian / CentOS / RHEL)
-- ==============================================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO,STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION';

-- ------------------------------------------------------------------------------
-- Table structure for `tenants` (Hospital Facilities & Clinics)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `tenants`;
CREATE TABLE `tenants` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(50) NOT NULL,
  `address` TEXT NOT NULL,
  `status` ENUM('Active', 'Inactive', 'Suspended', 'Trial') NOT NULL DEFAULT 'Active',
  `subscription_plan` VARCHAR(100) NOT NULL DEFAULT 'Professional Tier',
  `payment_status` ENUM('Paid', 'Pending', 'Failed') NOT NULL DEFAULT 'Paid',
  `activation_status` ENUM('Active', 'Pending Activation') NOT NULL DEFAULT 'Active',
  `institution_type` VARCHAR(150) NULL DEFAULT 'Hospital',
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_tenants_email` (`email`),
  KEY `idx_tenants_status` (`status`),
  KEY `idx_tenants_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `users` (System Accounts & Staff)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('Superadmin', 'Tenant-Admin', 'Doctor', 'Nurse', 'Billing', 'Pharmacist') NOT NULL DEFAULT 'Tenant-Admin',
  `tenant_id` VARCHAR(36) NULL,
  `two_factor_enabled` TINYINT(1) NOT NULL DEFAULT 0,
  `totp_secret` VARCHAR(255) NULL,
  `backup_codes` JSON NULL,
  `failed_login_attempts` INT NOT NULL DEFAULT 0,
  `locked_until` DATETIME(6) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_users_email` (`email`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_tenant_id` (`tenant_id`),
  CONSTRAINT `fk_users_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `patients` (Electronic Health Records)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` VARCHAR(36) NOT NULL,
  `mrn` VARCHAR(64) NOT NULL,
  `first_name` VARCHAR(100) NOT NULL,
  `last_name` VARCHAR(100) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `date_of_birth` DATE NOT NULL,
  `gender` VARCHAR(30) NOT NULL DEFAULT 'Other',
  `blood_type` VARCHAR(10) NOT NULL DEFAULT 'O+',
  `phone` VARCHAR(50) NULL,
  `email` VARCHAR(255) NULL,
  `address` TEXT NULL,
  `status` ENUM('Inpatient', 'Outpatient', 'Emergency', 'Discharged') NOT NULL DEFAULT 'Outpatient',
  `primary_physician` VARCHAR(255) NULL,
  `assigned_department` VARCHAR(150) NOT NULL DEFAULT 'General Medicine',
  `room_number` VARCHAR(50) NULL,
  `insurance_provider` VARCHAR(150) NULL,
  `insurance_policy_number` VARCHAR(100) NULL,
  `admission_date` DATETIME(6) NULL,
  `discharge_date` DATETIME(6) NULL,
  `vitals` JSON NULL,
  `allergies` JSON NULL,
  `chronic_conditions` JSON NULL,
  `emergency_contact` JSON NULL,
  `tenant_id` VARCHAR(36) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_patients_mrn` (`mrn`),
  KEY `idx_patients_tenant_id` (`tenant_id`),
  KEY `idx_patients_status` (`status`),
  KEY `idx_patients_name` (`last_name`, `first_name`),
  CONSTRAINT `fk_patients_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `invoices` (SaaS & Facility Billing Invoices)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `invoices`;
CREATE TABLE `invoices` (
  `id` VARCHAR(36) NOT NULL,
  `tenant_id` VARCHAR(36) NOT NULL,
  `amount` DECIMAL(12, 2) NOT NULL,
  `due_date` DATE NOT NULL,
  `paid_date` DATE NULL,
  `status` ENUM('Paid', 'Pending', 'Overdue', 'Cancelled') NOT NULL DEFAULT 'Pending',
  `currency` VARCHAR(10) NOT NULL DEFAULT 'USD',
  `payment_method` VARCHAR(50) NULL,
  `transaction_reference` VARCHAR(100) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_invoices_tenant_id` (`tenant_id`),
  KEY `idx_invoices_status` (`status`),
  KEY `idx_invoices_due_date` (`due_date`),
  CONSTRAINT `fk_invoices_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `audit_logs` (HIPAA & System Security Event Logs)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `audit_logs`;
CREATE TABLE `audit_logs` (
  `id` VARCHAR(36) NOT NULL,
  `user` VARCHAR(255) NOT NULL,
  `details` TEXT NOT NULL,
  `ip_address` VARCHAR(45) NULL,
  `user_agent` VARCHAR(255) NULL,
  `tenant_id` VARCHAR(36) NULL,
  `timestamp` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_audit_logs_timestamp` (`timestamp`),
  KEY `idx_audit_logs_user` (`user`),
  KEY `idx_audit_logs_tenant` (`tenant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `prescriptions` (Clinical Medications)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` VARCHAR(36) NOT NULL,
  `patient_id` VARCHAR(36) NOT NULL,
  `prescribed_by` VARCHAR(255) NOT NULL,
  `medication_name` VARCHAR(255) NOT NULL,
  `dosage` VARCHAR(100) NOT NULL,
  `frequency` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(100) NOT NULL,
  `status` ENUM('Active', 'Dispensed', 'Discontinued', 'Completed') NOT NULL DEFAULT 'Active',
  `tenant_id` VARCHAR(36) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_prescriptions_patient` (`patient_id`),
  KEY `idx_prescriptions_status` (`status`),
  CONSTRAINT `fk_prescriptions_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------------------------
-- Table structure for `lab_orders` (Pathology & Diagnostic Orders)
-- ------------------------------------------------------------------------------
DROP TABLE IF EXISTS `lab_orders`;
CREATE TABLE `lab_orders` (
  `id` VARCHAR(36) NOT NULL,
  `patient_id` VARCHAR(36) NOT NULL,
  `ordered_by` VARCHAR(255) NOT NULL,
  `test_name` VARCHAR(255) NOT NULL,
  `urgency` ENUM('Routine', 'Urgent', 'STAT') NOT NULL DEFAULT 'Routine',
  `status` ENUM('Ordered', 'Specimen_Collected', 'In_Progress', 'Completed', 'Cancelled') NOT NULL DEFAULT 'Ordered',
  `result` JSON NULL,
  `tenant_id` VARCHAR(36) NULL,
  `created_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  KEY `idx_lab_orders_patient` (`patient_id`),
  KEY `idx_lab_orders_status` (`status`),
  CONSTRAINT `fk_lab_orders_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- ==============================================================================
-- MASTER PRODUCTION SEED (ONLY ONE SUPER ADMIN ACCOUNT)
-- Email: mbarutech@gmail.com
-- Password: welcome@2026
-- Bcrypt Hash: $2b$10$Oo7WoOIipjcHrNDhRZ8BuerAe9u2XkyYZwB.UjiTrNdNKA6ND/y8G
-- ==============================================================================
INSERT INTO `users` (
  `id`,
  `name`,
  `email`,
  `password`,
  `role`,
  `two_factor_enabled`,
  `failed_login_attempts`,
  `created_at`,
  `updated_at`
) VALUES (
  'usr_superadmin_master',
  'RaphaMIS Super Admin',
  'mbarutech@gmail.com',
  '$2b$10$Oo7WoOIipjcHrNDhRZ8BuerAe9u2XkyYZwB.UjiTrNdNKA6ND/y8G',
  'Superadmin',
  0,
  0,
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE
  `password` = VALUES(`password`),
  `role` = 'Superadmin',
  `updated_at` = NOW();

-- Initial Audit Log for Seed
INSERT INTO `audit_logs` (
  `id`,
  `user`,
  `details`,
  `ip_address`,
  `timestamp`
) VALUES (
  'log_system_init',
  'System Engine',
  'RaphaMIS MySQL Database Initialized. Master Superadmin provisioned for mbarutech@gmail.com.',
  '127.0.0.1',
  NOW()
);
