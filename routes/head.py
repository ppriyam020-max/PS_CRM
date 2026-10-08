from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from functools import wraps
from database import get_db

head_bp = Blueprint('head', __name__)

def head_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') != 'head':
            flash('Municipal Head access required.', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

# ── DASHBOARD ──────────────────────────────────────────────────────────────────
@head_bp.route('/dashboard')
@head_required
def dashboard():
    db = get_db()

    stats = {
        'total_complaints':  db.execute("SELECT COUNT(*) FROM complaints").fetchone()[0],
        'open_complaints':   db.execute("SELECT COUNT(*) FROM complaints WHERE status IN ('Registered','In Progress')").fetchone()[0],
        'resolved':          db.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'").fetchone()[0],
        'critical':          db.execute("SELECT COUNT(*) FROM complaints WHERE priority='Critical' AND status!='Resolved'").fetchone()[0],
        'total_citizens':    db.execute("SELECT COUNT(*) FROM users WHERE role='citizen'").fetchone()[0],
        'total_labour':      db.execute("SELECT COUNT(*) FROM labour").fetchone()[0],
        'absent_labour':     db.execute("SELECT COUNT(*) FROM labour WHERE status IN ('Absent','On Leave')").fetchone()[0],
        'total_budget':      db.execute("SELECT COALESCE(SUM(amount),0) FROM budget_entries WHERE type='Allocated'").fetchone()[0],
        'spent_budget':      db.execute("SELECT COALESCE(SUM(amount),0) FROM budget_entries WHERE type='Spent'").fetchone()[0],
        'total_notices':     db.execute("SELECT COUNT(*) FROM notices").fetchone()[0],
    }

    dept_stats = db.execute("""
        SELECT d.id, d.name, d.icon,
               COUNT(DISTINCT c.id)                                             AS total,
               SUM(CASE WHEN c.status='Resolved'    THEN 1 ELSE 0 END)         AS resolved,
               SUM(CASE WHEN c.status IN ('Registered','In Progress') THEN 1 ELSE 0 END) AS open_c,
               SUM(CASE WHEN c.priority='Critical' AND c.status!='Resolved' THEN 1 ELSE 0 END) AS critical,
               COUNT(DISTINCT l.id)                                             AS workers
        FROM departments d
        LEFT JOIN complaints c ON d.id = c.dept_id
        LEFT JOIN labour     l ON d.id = l.dept_id
        GROUP BY d.id
    """).fetchall()

    priority_breakdown = db.execute("""
        SELECT priority, COUNT(*) as cnt
        FROM complaints WHERE status != 'Resolved'
        GROUP BY priority ORDER BY cnt DESC
    """).fetchall()

    status_breakdown = db.execute("""
        SELECT status, COUNT(*) as cnt
        FROM complaints GROUP BY status
    """).fetchall()

    recent_critical = db.execute("""
        SELECT c.*, u.name as citizen_name, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN users u ON c.citizen_id = u.id
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE c.priority IN ('Critical','High') AND c.status != 'Resolved'
        ORDER BY c.created_at DESC LIMIT 6
    """).fetchall()

    budget_summary = db.execute("""
        SELECT d.name, d.icon,
               COALESCE(SUM(CASE WHEN b.type='Allocated' THEN b.amount ELSE 0 END),0) AS allocated,
               COALESCE(SUM(CASE WHEN b.type='Spent'     THEN b.amount ELSE 0 END),0) AS spent
        FROM departments d
        LEFT JOIN budget_entries b ON d.id = b.dept_id
        GROUP BY d.id
    """).fetchall()

    labour_summary = db.execute("""
        SELECT status, COUNT(*) as cnt FROM labour GROUP BY status
    """).fetchall()

    recent_notices = db.execute("""
        SELECT n.*, u.name as posted_by_name FROM notices n
        LEFT JOIN users u ON n.posted_by = u.id
        ORDER BY n.created_at DESC LIMIT 5
    """).fetchall()

    events = db.execute("""
        SELECT e.*, d.name as dept_name FROM events e
        LEFT JOIN departments d ON e.dept_id = d.id
        WHERE e.event_date >= DATE('now')
        ORDER BY e.event_date ASC LIMIT 5
    """).fetchall()

    db.close()
    return render_template('head/dashboard.html',
        stats=stats, dept_stats=dept_stats,
        priority_breakdown=priority_breakdown, status_breakdown=status_breakdown,
        recent_critical=recent_critical, budget_summary=budget_summary,
        labour_summary=labour_summary, recent_notices=recent_notices,
        events=events)

# ── CITY OVERVIEW ──────────────────────────────────────────────────────────────
@head_bp.route('/overview')
@head_required
def overview():
    db = get_db()
    all_complaints = db.execute("""
        SELECT c.*, u.name as citizen_name, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN users u ON c.citizen_id = u.id
        LEFT JOIN departments d ON c.dept_id = d.id
        ORDER BY c.created_at DESC
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('head/overview.html',
        complaints=all_complaints, depts=depts)

# ── BUDGET OVERVIEW ────────────────────────────────────────────────────────────
@head_bp.route('/budget')
@head_required
def budget():
    db = get_db()
    summary = db.execute("""
        SELECT d.id, d.name, d.icon, d.budget as dept_budget,
               COALESCE(SUM(CASE WHEN b.type='Allocated' THEN b.amount ELSE 0 END),0) AS allocated,
               COALESCE(SUM(CASE WHEN b.type='Spent'     THEN b.amount ELSE 0 END),0) AS spent,
               COALESCE(SUM(CASE WHEN b.type='Returned'  THEN b.amount ELSE 0 END),0) AS returned
        FROM departments d
        LEFT JOIN budget_entries b ON d.id = b.dept_id
        GROUP BY d.id
    """).fetchall()
    entries = db.execute("""
        SELECT b.*, d.name as dept_name, d.icon as dept_icon, u.name as created_by_name
        FROM budget_entries b
        LEFT JOIN departments d ON b.dept_id = d.id
        LEFT JOIN users u ON b.created_by = u.id
        ORDER BY b.created_at DESC LIMIT 30
    """).fetchall()
    db.close()
    return render_template('head/budget.html', summary=summary, entries=entries)

# ── LABOUR OVERVIEW ────────────────────────────────────────────────────────────
@head_bp.route('/labour')
@head_required
def labour():
    db = get_db()
    workers = db.execute("""
        SELECT l.*, d.name as dept_name, d.icon as dept_icon
        FROM labour l LEFT JOIN departments d ON l.dept_id = d.id
        ORDER BY d.name, l.status
    """).fetchall()
    dept_labour = db.execute("""
        SELECT d.name, d.icon,
               COUNT(*) as total,
               SUM(CASE WHEN l.status='Active'   THEN 1 ELSE 0 END) as active,
               SUM(CASE WHEN l.status='Absent'   THEN 1 ELSE 0 END) as absent,
               SUM(CASE WHEN l.status='On Leave' THEN 1 ELSE 0 END) as on_leave,
               SUM(CASE WHEN l.status='Vacant'   THEN 1 ELSE 0 END) as vacant
        FROM departments d LEFT JOIN labour l ON d.id = l.dept_id
        GROUP BY d.id
    """).fetchall()
    db.close()
    return render_template('head/labour.html', workers=workers, dept_labour=dept_labour)

# ── NOTICES (read + post as Head) ─────────────────────────────────────────────
@head_bp.route('/notices')
@head_required
def notices():
    db = get_db()
    notices = db.execute("""
        SELECT n.*, u.name as posted_by_name, d.name as dept_name
        FROM notices n
        LEFT JOIN users u ON n.posted_by = u.id
        LEFT JOIN departments d ON n.dept_id = d.id
        ORDER BY n.created_at DESC
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('head/notices.html', notices=notices, depts=depts)

@head_bp.route('/notices/add', methods=['POST'])
@head_required
def add_notice():
    db = get_db()
    db.execute("""
        INSERT INTO notices (title, content, type, posted_by, dept_id)
        VALUES (?,?,?,?,?)
    """, (
        request.form.get('title'),
        request.form.get('content'),
        request.form.get('type', 'General'),
        session['user_id'],
        request.form.get('dept_id') or None
    ))
    db.commit()
    db.close()
    flash('Notice posted from Municipal Head.', 'success')
    return redirect(url_for('head.notices'))

# ── DEPARTMENTS REPORT ─────────────────────────────────────────────────────────
@head_bp.route('/departments')
@head_required
def departments():
    db = get_db()
    depts = db.execute("""
        SELECT d.*,
               COUNT(DISTINCT c.id)  AS total_complaints,
               SUM(CASE WHEN c.status='Resolved'    THEN 1 ELSE 0 END) AS resolved,
               SUM(CASE WHEN c.status IN ('Registered','In Progress') THEN 1 ELSE 0 END) AS open_c,
               SUM(CASE WHEN c.priority='Critical'  THEN 1 ELSE 0 END) AS critical,
               COUNT(DISTINCT l.id)  AS total_workers,
               SUM(CASE WHEN l.status='Active' THEN 1 ELSE 0 END)      AS active_workers,
               COALESCE(SUM(CASE WHEN b.type='Spent' THEN b.amount ELSE 0 END),0) AS spent
        FROM departments d
        LEFT JOIN complaints   c ON d.id = c.dept_id
        LEFT JOIN labour       l ON d.id = l.dept_id
        LEFT JOIN budget_entries b ON d.id = b.dept_id
        GROUP BY d.id
    """).fetchall()
    db.close()
    return render_template('head/departments.html', depts=depts)

# ── CALENDAR ──────────────────────────────────────────────────────────────────
@head_bp.route('/calendar')
@head_required
def calendar():
    db = get_db()
    events = db.execute("""
        SELECT e.*, d.name as dept_name, u.name as created_by_name
        FROM events e
        LEFT JOIN departments d ON e.dept_id = d.id
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.event_date ASC
    """).fetchall()
    db.close()
    return render_template('head/calendar.html', events=events)

# ── RAISE VERIFICATION QUERY ───────────────────────────────────────────────────
@head_bp.route('/complaints/<int:cid>/verify', methods=['POST'])
@head_required
def raise_query(cid):
    db       = get_db()
    question = request.form.get('question', '').strip()
    comp     = db.execute("SELECT area, title FROM complaints WHERE id=?", (cid,)).fetchone()
    if not comp or not question:
        flash('Question is required.', 'danger')
        db.close()
        return redirect(url_for('head.overview'))

    area = comp['area'] or ''
    db.execute("""
        INSERT INTO verification_queries (complaint_id, raised_by, question, area)
        VALUES (?,?,?,?)
    """, (cid, session['user_id'], question, area))
    qid = db.execute("SELECT last_insert_rowid()").fetchone()[0]

    # Auto-notify citizens in the same area via inbox message
    if area:
        citizens = db.execute("""
            SELECT id FROM users WHERE role='citizen' AND area LIKE ? AND is_active=1
        """, (f'%{area.split()[0]}%',)).fetchall()
        for cit in citizens:
            db.execute("""
                INSERT INTO messages (complaint_id, sender_id, receiver_id, subject, body)
                VALUES (?,?,?,?,?)
            """, (cid, session['user_id'], cit['id'],
                  f'🔔 Verification needed near {area}',
                  f'The Municipal Head has raised a verification query about a complaint in your area ({area}).\n\nQuestion: "{question}"\n\nPlease visit City Issues and respond to help verify this complaint.'))
    db.commit()
    db.close()
    flash(f'Verification query raised! Nearby citizens in "{area}" have been notified.', 'success')
    return redirect(url_for('head.verification_queries'))

# ── ALL VERIFICATION QUERIES ───────────────────────────────────────────────────
@head_bp.route('/queries')
@head_required
def verification_queries():
    db = get_db()
    queries = db.execute("""
        SELECT vq.*, c.title as comp_title, c.area as comp_area,
               u.name as raised_by_name,
               COUNT(vr.id) as response_count
        FROM verification_queries vq
        LEFT JOIN complaints c  ON vq.complaint_id = c.id
        LEFT JOIN users u       ON vq.raised_by = u.id
        LEFT JOIN verification_responses vr ON vq.id = vr.query_id
        GROUP BY vq.id
        ORDER BY vq.created_at DESC
    """).fetchall()
    db.close()
    return render_template('head/queries.html', queries=queries)

@head_bp.route('/queries/<int:qid>')
@head_required
def query_detail(qid):
    db = get_db()
    query = db.execute("""
        SELECT vq.*, c.title as comp_title, c.area,
               u.name as raised_by_name
        FROM verification_queries vq
        LEFT JOIN complaints c ON vq.complaint_id = c.id
        LEFT JOIN users u      ON vq.raised_by = u.id
        WHERE vq.id=?
    """, (qid,)).fetchone()
    responses = db.execute("""
        SELECT vr.*, u.name as citizen_name, u.area as citizen_area
        FROM verification_responses vr
        LEFT JOIN users u ON vr.citizen_id = u.id
        WHERE vr.query_id=?
        ORDER BY vr.created_at ASC
    """, (qid,)).fetchall()
    db.close()
    return render_template('head/query_detail.html', query=query, responses=responses)

@head_bp.route('/queries/<int:qid>/close', methods=['POST'])
@head_required
def close_query(qid):
    db = get_db()
    db.execute("UPDATE verification_queries SET status='Closed' WHERE id=?", (qid,))
    db.commit(); db.close()
    flash('Query closed.', 'info')
    return redirect(url_for('head.verification_queries'))
