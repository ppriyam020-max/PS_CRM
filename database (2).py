import sqlite3
import os
from werkzeug.security import generate_password_hash

DB_PATH = os.path.join(os.path.dirname(__file__), 'pscrm.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # rows behave like dicts
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()

    # ── USERS ──────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            email       TEXT    UNIQUE NOT NULL,
            phone       TEXT,
            password    TEXT    NOT NULL,
            role        TEXT    NOT NULL CHECK(role IN ('admin','citizen','head')),
            area        TEXT,
            city        TEXT    DEFAULT 'Gurugram',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            is_active   INTEGER DEFAULT 1
        )
    ''')

    # ── DEPARTMENTS ────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS departments (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            icon        TEXT,
            head_id     INTEGER REFERENCES users(id),
            budget      REAL    DEFAULT 0,
            description TEXT
        )
    ''')

    # ── COMPLAINTS ─────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS complaints (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            title        TEXT    NOT NULL,
            description  TEXT    NOT NULL,
            dept_id      INTEGER REFERENCES departments(id),
            citizen_id   INTEGER REFERENCES users(id),
            assigned_to  INTEGER REFERENCES users(id),
            status       TEXT    DEFAULT 'Registered'
                         CHECK(status IN ('Registered','In Progress','Resolved','Rejected')),
            priority     TEXT    DEFAULT 'Medium'
                         CHECK(priority IN ('Low','Medium','High','Critical')),
            area         TEXT,
            image_path   TEXT,
    lat          REAL,
    lng          REAL,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── COMPLAINT UPDATES (timeline) ──────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS complaint_updates (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER REFERENCES complaints(id),
            updated_by   INTEGER REFERENCES users(id),
            note         TEXT    NOT NULL,
            status       TEXT,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── NOTICES ────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS notices (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            type        TEXT    DEFAULT 'General'
                        CHECK(type IN ('General','Budget','Rules','Tender','Emergency','Forum')),
            posted_by   INTEGER REFERENCES users(id),
            dept_id     INTEGER REFERENCES departments(id),
            is_public   INTEGER DEFAULT 1,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── BUDGET ─────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS budget_entries (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            dept_id     INTEGER REFERENCES departments(id),
            amount      REAL    NOT NULL,
            type        TEXT    CHECK(type IN ('Allocated','Spent','Returned')),
            description TEXT,
            fiscal_year TEXT    DEFAULT '2025-26',
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_by  INTEGER REFERENCES users(id)
        )
    ''')

    # ── PROBLEMGRAM POSTS ──────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS posts (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            content     TEXT    NOT NULL,
            posted_by   INTEGER REFERENCES users(id),
            dept_id     INTEGER REFERENCES departments(id),
            upvotes     INTEGER DEFAULT 0,
            is_pinned   INTEGER DEFAULT 0,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── LABOUR ─────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS labour (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            name        TEXT    NOT NULL,
            role        TEXT    NOT NULL,
            dept_id     INTEGER REFERENCES departments(id),
            status      TEXT    DEFAULT 'Active'
                        CHECK(status IN ('Active','Absent','On Leave','Vacant')),
            area        TEXT,
            phone       TEXT,
            joined_at   DATE    DEFAULT CURRENT_DATE
        )
    ''')

    # ── CALENDAR EVENTS ────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS events (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       TEXT    NOT NULL,
            description TEXT,
            event_date  DATE    NOT NULL,
            dept_id     INTEGER REFERENCES departments(id),
            created_by  INTEGER REFERENCES users(id),
            type        TEXT    DEFAULT 'Work'
                        CHECK(type IN ('Work','Inspection','Meeting','Holiday','Deadline'))
        )
    ''')

    conn.commit()
    _seed_data(conn)
    conn.close()
    print("✅ Database initialized at", DB_PATH)

def _seed_data(conn):
    c = conn.cursor()

    # Check if already seeded
    c.execute("SELECT COUNT(*) FROM users")
    if c.fetchone()[0] > 0:
        return

    print("🌱 Seeding initial data...")

    # Seed users
    users = [
        ('Admin Kumar',   'admin@pscrm.in',   '9876543210', generate_password_hash('admin123'),   'admin',   'City Center', 'Gurugram'),
        ('Yoshit Kumar',  'head@pscrm.in',    '9876543211', generate_password_hash('head123'),    'head',    'City Center', 'Gurugram'),
        ('Rahul Sharma',  'citizen@pscrm.in', '9876543212', generate_password_hash('citizen123'), 'citizen', 'Sector 14',   'Gurugram'),
        ('Priya Singh',   'priya@pscrm.in',   '9876543213', generate_password_hash('priya123'),   'citizen', 'Sector 47',   'Gurugram'),
    ]
    c.executemany(
        "INSERT INTO users (name,email,phone,password,role,area,city) VALUES (?,?,?,?,?,?,?)",
        users
    )

    # Seed departments
    depts = [
        ('Road',            '🛣️',  500000),
        ('Water',           '💧',  300000),
        ('Electricity',     '⚡',  400000),
        ('Waste/Pollution', '♻️',  250000),
        ('Sewers',          '🔩',  200000),
        ('Construction',    '🏗️',  600000),
    ]
    c.executemany(
        "INSERT INTO departments (name,icon,budget) VALUES (?,?,?)",
        depts
    )

    # Seed complaints
    complaints = [
        ('Sewer pipe blown up near Main Road',
         'Due to heavy waste collection, the sewer pipe has blown up causing road blockage and foul smell.',
         5, 3, 'Registered', 'High',   'Sector 14'),
        ('Factory pollution in industrial area',
         'Factories are emitting pollution more than ever. Air quality index is critical. Immediate action required.',
         4, 3, 'In Progress','Critical','GZB Industrial'),
        ('Large potholes near Railway Station',
         'Huge potholes near GZB Railway Station are causing accidents. Multiple injuries reported this week.',
         1, 4, 'In Progress','High',   'GZB Station'),
        ('Water supply irregular in Sector 47',
         'Water supply has been inconsistent for the past week. Residents struggling.',
         2, 4, 'Registered', 'Medium', 'Sector 47'),
        ('Street light not working for 2 weeks',
         'Street lights on MG Road have not been working for 2 weeks causing safety concerns at night.',
         3, 3, 'Resolved',   'Low',    'MG Road'),
    ]
    import random as _rnd
    _delhi_pts = [
        (28.6139,77.2090),(28.5355,77.3910),(28.6562,77.2410),
        (28.5921,77.0460),(28.6304,77.2177),(28.7041,77.1025),
    ]
    for _i,_row in enumerate(complaints):
        _rnd.seed(_i*17+3)
        _blat,_blng = _delhi_pts[_i % len(_delhi_pts)]
        _lat = round(_blat + _rnd.uniform(-0.025,0.025), 6)
        _lng = round(_blng + _rnd.uniform(-0.025,0.025), 6)
        c.execute(
            "INSERT INTO complaints (title,description,dept_id,citizen_id,status,priority,area,lat,lng) VALUES (?,?,?,?,?,?,?,?,?)",
            (*_row, _lat, _lng)
        )

    # Seed notices
    notices = [
        ('Budget Allocation FY 2025-26',
         'The total municipal budget for FY 2025-26 has been finalized at ₹42 Crore. Department-wise breakdown attached.',
         'Budget', 1, None),
        ('New Rules for Waste Disposal',
         'Citizens are requested to follow new waste segregation rules effective from 1st April. Dry and wet waste must be separated.',
         'Rules', 1, 4),
        ('Tender Open: Road Resurfacing NH-48',
         'Tender is open for road resurfacing project on NH-48. Last date to apply: 20th March 2026.',
         'Tender', 1, 1),
        ('Emergency: Water Supply Disruption',
         'Water supply will be disrupted in Sectors 14, 15, 47 on 10th March for maintenance. Duration: 8AM–4PM.',
         'Emergency', 1, 2),
        ('Forum Overview: March 2026',
         'Monthly forum summary is now available. Key issues discussed: Pollution, Labour shortage, Budget transparency.',
         'Forum', 2, None),
    ]
    c.executemany(
        "INSERT INTO notices (title,content,type,posted_by,dept_id) VALUES (?,?,?,?,?)",
        notices
    )

    # Seed budget entries
    budget_data = [
        (1, 500000, 'Allocated', 'Annual budget for Road dept',            '2025-26', 1),
        (1, 180000, 'Spent',     'NH-48 resurfacing Phase 1',              '2025-26', 1),
        (2, 300000, 'Allocated', 'Annual budget for Water dept',           '2025-26', 1),
        (2,  45000, 'Spent',     'Pipeline repair Sector 47',              '2025-26', 1),
        (3, 400000, 'Allocated', 'Annual budget for Electricity dept',     '2025-26', 1),
        (3, 120000, 'Spent',     'Sector 22 substation upgrade',           '2025-26', 1),
        (4, 250000, 'Allocated', 'Annual budget for Waste/Pollution dept', '2025-26', 1),
        (5, 200000, 'Allocated', 'Annual budget for Sewers dept',          '2025-26', 1),
        (6, 600000, 'Allocated', 'Annual budget for Construction dept',    '2025-26', 1),
    ]
    c.executemany(
        "INSERT INTO budget_entries (dept_id,amount,type,description,fiscal_year,created_by) VALUES (?,?,?,?,?,?)",
        budget_data
    )

    # Seed problemgram posts
    posts = [
        ('Water issue in GZB — Solved in GHR',
         'The water supply issue that was reported 2 weeks ago in GZB has been resolved in the GHR area. Citizens can now expect regular supply.',
         1, 2),
        ('Road resurfacing on MG Road 60% complete',
         'We are happy to report that the MG Road resurfacing project is 60% complete. Alternate routes requested for the next 2 days.',
         1, 1),
        ('Progress update: Sector 47 pipeline repair',
         'Repair team has been dispatched to Sector 47 for the pipeline issue. Work starts tomorrow 9AM.',
         1, 2),
        ('Shortage of labour in Construction dept',
         'We are currently facing a shortage of 34 workers in the Construction department. Hiring drive underway.',
         1, 6),
    ]
    c.executemany(
        "INSERT INTO posts (title,content,posted_by,dept_id) VALUES (?,?,?,?)",
        posts
    )

    # Seed labour
    labour_data = [
        ('Suresh Kumar',  'Road Worker',       1, 'Active',  'Sector 14'),
        ('Manoj Singh',   'Plumber',           2, 'Active',  'Sector 47'),
        ('Ravi Sharma',   'Electrician',       3, 'Active',  'MG Road'),
        ('Deepak Verma',  'Sweeper',           4, 'Absent',  'City Center'),
        ('Anil Yadav',    'Sewer Inspector',   5, 'Active',  'Sector 22'),
        ('Pradeep Gupta', 'Construction Lead', 6, 'On Leave','DLF Phase 3'),
        ('Vikram Das',    'Road Inspector',    1, 'Active',  'NH-48'),
        ('Sunita Devi',   'Waste Collector',   4, 'Active',  'Sector 14'),
    ]
    c.executemany(
        "INSERT INTO labour (name,role,dept_id,status,area) VALUES (?,?,?,?,?)",
        labour_data
    )

    # Seed calendar events
    events = [
        ('Road Inspection NH-48',       'Weekly progress inspection of NH-48 resurfacing', '2026-03-09', 1, 1, 'Inspection'),
        ('Water Supply Maintenance',    'Planned disruption for pipeline work',             '2026-03-10', 2, 1, 'Work'),
        ('Budget Review Meeting',       'Monthly budget review with all department heads',  '2026-03-11', None, 2, 'Meeting'),
        ('Tender Deadline: Road',       'Last date for NH-48 tender applications',          '2026-03-20', 1, 1, 'Deadline'),
        ('Pollution Drive',             'City-wide pollution control inspection',            '2026-03-15', 4, 1, 'Inspection'),
        ('Labour Hiring Drive',         'Walk-in interviews for Construction dept workers', '2026-03-22', 6, 1, 'Work'),
    ]
    c.executemany(
        "INSERT INTO events (title,description,event_date,dept_id,created_by,type) VALUES (?,?,?,?,?,?)",
        events
    )

    conn.commit()
    print("✅ Seed data inserted")

if __name__ == '__main__':
    init_db()

def migrate_db():
    """
    Safe migration — adds all new tables and columns to an existing DB.
    Uses CREATE TABLE IF NOT EXISTS and PRAGMA checks so it is
    completely safe to run on every startup, even on an old database.
    """
    conn = get_db()
    c = conn.cursor()

    # ── MESSAGES ──────────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER REFERENCES complaints(id),
            sender_id    INTEGER REFERENCES users(id),
            receiver_id  INTEGER REFERENCES users(id),
            subject      TEXT    NOT NULL,
            body         TEXT    NOT NULL,
            is_read      INTEGER DEFAULT 0,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── VERIFICATION QUERIES ──────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS verification_queries (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            complaint_id INTEGER REFERENCES complaints(id),
            raised_by    INTEGER REFERENCES users(id),
            question     TEXT    NOT NULL,
            area         TEXT    NOT NULL,
            status       TEXT    DEFAULT 'Open'
                         CHECK(status IN ('Open','Closed')),
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── VERIFICATION RESPONSES ────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS verification_responses (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            query_id     INTEGER REFERENCES verification_queries(id),
            citizen_id   INTEGER REFERENCES users(id),
            response     TEXT    NOT NULL,
            verified     INTEGER DEFAULT 0,
            created_at   DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    ''')

    # ── OTP STORE ─────────────────────────────────────────────────
    c.execute('''
        CREATE TABLE IF NOT EXISTS otp_store (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            phone       TEXT NOT NULL,
            otp         TEXT NOT NULL,
            created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
            used        INTEGER DEFAULT 0
        )
    ''')

    # ── ADD lat/lng TO complaints (safe ALTER) ────────────────────
    cols = [r[1] for r in conn.execute("PRAGMA table_info(complaints)").fetchall()]
    if 'lat' not in cols:
        try:
            c.execute("ALTER TABLE complaints ADD COLUMN lat REAL")
            c.execute("ALTER TABLE complaints ADD COLUMN lng REAL")
            # Back-fill Delhi-area coordinates for existing complaints
            import random
            base_coords = [
                (28.6139, 77.2090), (28.5355, 77.3910), (28.6562, 77.2410),
                (28.5921, 77.0460), (28.6304, 77.2177), (28.7041, 77.1025),
            ]
            rows = conn.execute("SELECT id FROM complaints").fetchall()
            for i, row in enumerate(rows):
                random.seed(row[0] * 13)
                lat, lng = base_coords[i % len(base_coords)]
                lat += random.uniform(-0.02, 0.02)
                lng += random.uniform(-0.02, 0.02)
                conn.execute(
                    "UPDATE complaints SET lat=?, lng=? WHERE id=?",
                    (round(lat, 6), round(lng, 6), row[0])
                )
        except Exception:
            pass  # columns may already exist from a previous partial run

    conn.commit()
    conn.close()
    print("✅ Migration complete")

if __name__ == '__main__':
    init_db()
    migrate_db()
