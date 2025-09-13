-- 1. Departments  === > اداره ها
CREATE TABLE departments
(
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Users
CREATE TABLE Users
(
    id            SERIAL PRIMARY KEY                                                             NOT NULL,
    name          VARCHAR(100)                                                                   NOT NULL,
    email         VARCHAR(100) UNIQUE                                                            NOT NULL,
    password      VARCHAR(100)                                                                   NOT NULL,
    national_id   VARCHAR(20) UNIQUE                                                             NOT NULL,
    date_of_birth DATE                                                                           NOT NULL,
    contact_info  VARCHAR(150),
    avatar        TEXT,
    phone         VARCHAR(20),
    role          VARCHAR(20) CHECK (role IN ('citizen', 'officer', 'department_head', 'admin')) NOT NULL,
    department_id INT                                                                            REFERENCES departments (id) ON DELETE SET NULL,
    created_at    TIMESTAMP DEFAULT NOW(),
    updated_at    TIMESTAMP DEFAULT NOW()
);


-- 3. Services  ===>  خدمات
CREATE TABLE services
(
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    department_id INT          NOT NULL REFERENCES departments (id) ON DELETE CASCADE,
    fee           DECIMAL(10, 2) DEFAULT 0,
    form_fields   TEXT,
    required_documents TEXT,
    created_at    TIMESTAMP      DEFAULT NOW(),
    updated_at    TIMESTAMP      DEFAULT NOW()
);


-- 4. Requests   ===>   درخواست ها
CREATE TABLE requests
(
    id                   SERIAL PRIMARY KEY,
    citizen_id           INT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    service_id           INT NOT NULL REFERENCES services (id) ON DELETE CASCADE,
    request_number       VARCHAR(20) UNIQUE,
    -- First review
    first_reviewer_id    INT REFERENCES users (id),
    first_review_comment TEXT,
    first_reviewed_at    TIMESTAMP,

    -- Final decision
    final_reviewer_id    INT REFERENCES users (id),
    final_comment        TEXT,
    form_data            JSONB,
    final_reviewed_at    TIMESTAMP,
    status               VARCHAR(20) CHECK (
        status IN ('submitted', 'under_review', 'approved', 'rejected')
        )                          DEFAULT 'submitted',
    created_at           TIMESTAMP DEFAULT NOW(),
    updated_at           TIMESTAMP DEFAULT NOW()
);


-- 5. Documents    ===> اسناد و مدارک
CREATE TABLE documents
(
    id                    SERIAL PRIMARY KEY,
    request_id            INT  NOT NULL REFERENCES requests (id) ON DELETE CASCADE,
    file_path             TEXT NOT NULL,
    original_name         VARCHAR(255),
    transaction_reference VARCHAR(100),
    uploaded_at           TIMESTAMP DEFAULT NOW()
);

-- 6. Payments   ===> پرداخت ها
CREATE TABLE payments
(
    id           SERIAL PRIMARY KEY,
    request_id   INT            NOT NULL REFERENCES requests (id) ON DELETE CASCADE,
    amount       DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    status       VARCHAR(20) CHECK (status IN ('success', 'failed', 'pending')) DEFAULT 'pending',
    payment_date TIMESTAMP                                                      DEFAULT NOW()
);

-- 7. Notifications   ===> اعلانات   ○ Citizens get notified (in-app or email) when their request status changes.
CREATE TABLE notifications
(
    id         SERIAL PRIMARY KEY,
    user_id    INT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    request_id INT REFERENCES requests (id) ON DELETE CASCADE,
    message    TEXT      NOT NULL,
    channel    VARCHAR(20) CHECK (channel IN ('in_app', 'email', 'both')) DEFAULT 'in_app',
    is_read    BOOLEAN                                                    DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL                                         DEFAULT NOW(),
    updated_at TIMESTAMP                                                  DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_notifications_is_read ON notifications (is_read);

--8. request_notes === > یاداشت های درخواست
CREATE TABLE request_notes
(
    id         SERIAL PRIMARY KEY,
    request_id INT  NOT NULL REFERENCES requests (id) ON DELETE CASCADE,
    officer_id INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    note       TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);


-- 8. activities  ===> فعالیت ها
CREATE TABLE activities
(
    id          SERIAL PRIMARY KEY,
    user_id     INT  NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    target_type VARCHAR(50),
    target_id   INT,
    created_at  TIMESTAMP DEFAULT NOW()
);
