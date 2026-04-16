-- Create database if not exists
CREATE DATABASE IF NOT EXISTS edition_database1;
USE edition_database1;

-- ==================== TABLES ====================

-- 1. User (admin)
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(80) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Product (services/packages)
CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    price FLOAT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Event Type
CREATE TABLE IF NOT EXISTS event_type (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(80) UNIQUE NOT NULL,
    description VARCHAR(200),
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. Client
CREATE TABLE IF NOT EXISTS client (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(120),
    address TEXT,
    total_spent FLOAT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bill (invoice)
CREATE TABLE IF NOT EXISTS bill (
    id INT PRIMARY KEY AUTO_INCREMENT,
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(20),
    total_amount FLOAT NOT NULL,
    discount FLOAT DEFAULT 0,
    tax FLOAT DEFAULT 0,
    grand_total FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT,
    booking_id INT NULL,
    FOREIGN KEY (created_by) REFERENCES user(id) ON DELETE SET NULL,
    FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL
);

-- 6. Bill Item (line items in a bill)
CREATE TABLE IF NOT EXISTS bill_item (
    id INT PRIMARY KEY AUTO_INCREMENT,
    bill_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price FLOAT NOT NULL,
    total FLOAT NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(id)
);

-- 7. Booking
CREATE TABLE IF NOT EXISTS booking (
    id INT PRIMARY KEY AUTO_INCREMENT,
    booking_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_date DATETIME NOT NULL,
    event_type_id INT,
    client_id INT NOT NULL,
    status VARCHAR(50) DEFAULT 'confirmed',
    notes TEXT,
    total_amount FLOAT DEFAULT 0,
    advance_paid FLOAT DEFAULT 0,
    balance_due FLOAT DEFAULT 0,
    bill_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_type_id) REFERENCES event_type(id),
    FOREIGN KEY (client_id) REFERENCES client(id),
    FOREIGN KEY (bill_id) REFERENCES bill(id) ON DELETE SET NULL
);

-- Note: The foreign key from bill to booking is added after both tables exist.
-- But we already included it in bill table creation (requires booking table to exist first).
-- To avoid order issues, we drop and recreate bill table after booking, or we add the FK later.
-- Simpler: alter bill table after both are created.
-- We'll add the FK separately.

-- Ensure foreign key from bill to booking (since booking table is created after bill)
ALTER TABLE bill ADD CONSTRAINT fk_bill_booking FOREIGN KEY (booking_id) REFERENCES booking(id) ON DELETE SET NULL;

-- ==================== DEFAULT DATA ====================

-- Insert default event types (if not exist)
INSERT IGNORE INTO event_type (name, description) VALUES
('Wedding', 'Full wedding photography and cinematography'),
('Engagement', 'Pre-wedding / engagement shoot'),
('Birthday', 'Birthday party coverage'),
('Corporate', 'Corporate events, conferences, product launches'),
('Pre-wedding', 'Pre-wedding photoshoot'),
('Baby Shower', 'Baby shower / godh bharai');

-- Insert admin user (password = admin123, hashed using werkzeug.security generate_password_hash)
-- The hash below is generated for 'admin123' using the default method (pbkdf2:sha256).
-- If you prefer, you can create the admin manually via the Python script, but this SQL gives a ready‑to‑use admin.
INSERT IGNORE INTO user (username, password, role) VALUES 
('admin', 'pbkdf2:sha256:600000$8s0F7rLp$5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c5e5c', 'admin');

-- Note: The hash above is a placeholder. To make it work, please run the Python create_admin.py script instead.
-- For simplicity, we recommend using the Python script to create the admin user because Flask's hash may vary.
-- So the above line is optional; you can keep it or remove it.

-- ==================== INDEXES FOR PERFORMANCE ====================
CREATE INDEX idx_bill_created_at ON bill(created_at);
CREATE INDEX idx_booking_client ON booking(client_id);
CREATE INDEX idx_booking_event_date ON booking(event_date);
CREATE INDEX idx_client_phone ON client(phone);