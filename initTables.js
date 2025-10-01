import pool from './src/config/db.js';

const createTables = async () => {
    try {
        console.log('Creating tables...');

        // 1. Departments
        await pool.query(`
          CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // 2. Users
        await pool.query(`
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY NOT NULL,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(100) NOT NULL,
            national_id VARCHAR(10) UNIQUE NOT NULL,
            date_of_birth DATE NOT NULL,
            contact_info VARCHAR(150),
            avatar TEXT,
            phone VARCHAR(11),
            role VARCHAR(20) CHECK (role IN ('citizen', 'officer', 'department_head', 'admin')) NOT NULL,
            department_id INT REFERENCES departments(id) ON DELETE SET NULL,
            job_title VARCHAR(100),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
    `);

        await pool.query(`
          CREATE UNIQUE INDEX IF NOT EXISTS unique_department_head_per_department
          ON users(department_id)
          WHERE role = 'department_head';
        `);

        // 3. Services
        await pool.query(`
          CREATE TABLE IF NOT EXISTS services (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            department_id INT NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
            fee DECIMAL(10,2) DEFAULT 0,
            form_fields TEXT,
            required_documents TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // 4. Requests
        await pool.query(`
          CREATE TABLE IF NOT EXISTS requests (
            id SERIAL PRIMARY KEY,
            citizen_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            service_id INT NOT NULL REFERENCES services(id) ON DELETE CASCADE,
            request_number VARCHAR(20) NOT NULL UNIQUE,
            first_reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
            first_review_comment TEXT,
            first_reviewed_at TIMESTAMP,
            final_reviewer_id INT REFERENCES users(id) ON DELETE SET NULL,
            final_comment TEXT,
            form_data JSONB,
            final_reviewed_at TIMESTAMP,
            status VARCHAR(20) NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted','under_review','approved','rejected','paid')),
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP NOT NULL DEFAULT NOW()
          );
    `);

        // 5. Documents
        await pool.query(`
          CREATE TABLE IF NOT EXISTS documents (
            id SERIAL PRIMARY KEY,
            request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            file_path TEXT NOT NULL,
            original_name VARCHAR(255),
            transaction_reference VARCHAR(100),
            uploaded_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // 6. Payments
        await pool.query(`
          CREATE TABLE IF NOT EXISTS payments (
            id SERIAL PRIMARY KEY,
            request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
            status VARCHAR(20) CHECK (status IN ('success','failed','pending')) DEFAULT 'pending',
            payment_date TIMESTAMP DEFAULT NOW(),
            paid_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // 7. Notifications
        await pool.query(`
          CREATE TABLE IF NOT EXISTS notifications (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            request_id INT REFERENCES requests(id) ON DELETE CASCADE,
            message TEXT NOT NULL,
            channel VARCHAR(20) CHECK (channel IN ('in_app','email','both')) DEFAULT 'in_app',
            is_read BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );
    `);

        await pool.query(`
          CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
          CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
        `);

        // 8. Request Notes
        await pool.query(`
          CREATE TABLE IF NOT EXISTS request_notes (
            id SERIAL PRIMARY KEY,
            request_id INT NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
            officer_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            note TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // 9. Activities
        await pool.query(`
          CREATE TABLE IF NOT EXISTS activities (
            id SERIAL PRIMARY KEY,
            user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            description TEXT NOT NULL,
            target_type VARCHAR(50),
            target_id INT,
            created_at TIMESTAMP DEFAULT NOW()
          );
    `);

        // Trigger for updated_at in requests
        await pool.query(`
          CREATE OR REPLACE FUNCTION set_updated_at()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `);

        await pool.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trigger_set_updated_at') THEN
              CREATE TRIGGER trigger_set_updated_at
              BEFORE UPDATE ON requests
              FOR EACH ROW
              EXECUTE FUNCTION set_updated_at();
            END IF;
          END $$;
    `);

        console.log('All tables, indexes, and triggers created successfully!');
        process.exit(0);

    } catch (err) {
        console.error('Error creating tables:', err);
        process.exit(1);
    }
};

createTables();
