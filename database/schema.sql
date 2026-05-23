CREATE DATABASE IF NOT EXISTS insurance_management;

USE insurance_management;

CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_users_role
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_refresh_tokens_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
);

CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  phone VARCHAR(30) NOT NULL,
  personal_number VARCHAR(50) NOT NULL UNIQUE,
  address VARCHAR(255) NOT NULL,
  city VARCHAR(100) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE insurance_types (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT NULL,
  base_price DECIMAL(10, 2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT chk_insurance_types_base_price
    CHECK (base_price >= 0)
);

CREATE TABLE policies (
  id INT AUTO_INCREMENT PRIMARY KEY,
  client_id INT NOT NULL,
  insurance_type_id INT NOT NULL,
  policy_number VARCHAR(60) NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  premium_amount DECIMAL(10, 2) NOT NULL,
  coverage_amount DECIMAL(12, 2) NOT NULL,
  status ENUM('active', 'expired', 'cancelled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_policies_client
    FOREIGN KEY (client_id) REFERENCES clients(id),
  CONSTRAINT fk_policies_insurance_type
    FOREIGN KEY (insurance_type_id) REFERENCES insurance_types(id),
  CONSTRAINT chk_policies_dates
    CHECK (end_date > start_date),
  CONSTRAINT chk_policies_premium
    CHECK (premium_amount >= 0),
  CONSTRAINT chk_policies_coverage
    CHECK (coverage_amount >= 0)
);

CREATE TABLE claims (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_id INT NOT NULL,
  claim_number VARCHAR(60) NOT NULL UNIQUE,
  claim_date DATE NOT NULL,
  description TEXT NOT NULL,
  requested_amount DECIMAL(12, 2) NOT NULL,
  approved_amount DECIMAL(12, 2) NULL,
  status ENUM('submitted', 'reviewing', 'approved', 'rejected', 'paid') NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_claims_policy
    FOREIGN KEY (policy_id) REFERENCES policies(id),
  CONSTRAINT chk_claims_requested_amount
    CHECK (requested_amount >= 0),
  CONSTRAINT chk_claims_approved_amount
    CHECK (approved_amount IS NULL OR approved_amount >= 0)
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  policy_id INT NOT NULL,
  payment_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  method ENUM('cash', 'card', 'bank_transfer') NOT NULL,
  status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  reference_number VARCHAR(80) NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_payments_policy
    FOREIGN KEY (policy_id) REFERENCES policies(id),
  CONSTRAINT chk_payments_amount
    CHECK (amount >= 0)
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_clients_name ON clients(last_name, first_name);
CREATE INDEX idx_policies_client_id ON policies(client_id);
CREATE INDEX idx_policies_insurance_type_id ON policies(insurance_type_id);
CREATE INDEX idx_policies_status ON policies(status);
CREATE INDEX idx_claims_policy_id ON claims(policy_id);
CREATE INDEX idx_claims_status ON claims(status);
CREATE INDEX idx_payments_policy_id ON payments(policy_id);
CREATE INDEX idx_payments_status ON payments(status);

INSERT INTO roles (name) VALUES
  ('admin'),
  ('agent');

INSERT INTO insurance_types (name, description, base_price) VALUES
  ('Health Insurance', 'Medical and health related coverage.', 120.00),
  ('Car Insurance', 'Vehicle damage and liability coverage.', 180.00),
  ('Home Insurance', 'Property and home protection coverage.', 220.00),
  ('Life Insurance', 'Life and family financial protection.', 300.00);

