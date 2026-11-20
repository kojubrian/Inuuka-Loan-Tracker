CREATE DATABASE inuuka_loan_tracker;

-- Select the database
USE inuuka_loan_tracker;

-- 1. Clients table
CREATE TABLE clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_number VARCHAR(30) NOT NULL UNIQUE,
    client_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Loans table
CREATE TABLE loans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_reference VARCHAR(50) NOT NULL UNIQUE,
    client_id INT NOT NULL,
    loan_amount DECIMAL(12, 2) NOT NULL,
    total_amount_due DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_loan_amount
        CHECK (loan_amount > 0),

    CONSTRAINT chk_total_amount_due
        CHECK (total_amount_due > 0),

    CONSTRAINT fk_loan_client
        FOREIGN KEY (client_id)
        REFERENCES clients(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_loans_client_id (client_id)
) ENGINE=InnoDB;

-- 3. Repayments table
CREATE TABLE repayments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    loan_id INT NOT NULL,
    payment_reference VARCHAR(50) NOT NULL UNIQUE,
    payment_amount DECIMAL(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_payment_amount
        CHECK (payment_amount > 0),

    CONSTRAINT fk_repayment_loan
        FOREIGN KEY (loan_id)
        REFERENCES loans(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,

    INDEX idx_repayments_loan_id (loan_id),
    INDEX idx_repayments_payment_date (payment_date)
) ENGINE=InnoDB;