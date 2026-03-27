from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from functools import wraps
from database import get_db
from werkzeug.utils import secure_filename
import os, datetime

citizen_bp = Blueprint('citizen', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
ALLOWED = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def citizen_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') not in ('citizen', 'admin', 'head'):
            flash('Please login to continue.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def save_image(file):
    if file and file.filename:
        ext = file.filename.rsplit('.', 1)[-1].lower()
        if ext in ALLOWED:
            fname = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{secure_filename(file.filename)}"
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, fname))
            return fname
    return None

# ── DASHBOARD ──────────────────────────────────────────────────────────────────
@citizen_bp.route('/dashboard')
@citizen_required
def dashboard():
    db = get_db()
    uid = session['user_id']

    my_stats = {
        'total':       db.execute("SELECT COUNT(*) FROM complaints WHERE citizen_id=?", (uid,)).fetchone()[0],
        'open':        db.execute("SELECT COUNT(*) FROM complaints WHERE citizen_id=? AND status IN ('Registered','In Progress')", (uid,)).fetchone()[0],
        'resolved':    db.execute("SELECT COUNT(*) FROM complaints WHERE citizen_id=? AND status='Resolved'", (uid,)).fetchone()[0],
        'rejected':    db.execute("SELECT COUNT(*) FROM complaints WHERE citizen_id=? AND status='Rejected'", (uid,)).fetchone()[0],
    }

    my_complaints = db.execute("""
        SELECT c.*, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE c.citizen_id = ?
        ORDER BY c.created_at DESC LIMIT 5
    """, (uid,)).fetchall()

    notices = db.execute("""
        SELECT n.*, u.name as posted_by_name
        FROM notices n LEFT JOIN users u ON n.posted_by = u.id
        WHERE n.is_public = 1
        ORDER BY n.created_at DESC LIMIT 4
    """).fetchall()

    posts = db.execute("""
        SELECT p.*, u.name as author, d.name as dept_name
        FROM posts p
        LEFT JOIN users u ON p.posted_by = u.id
        LEFT JOIN departments d ON p.dept_id = d.id
        ORDER BY p.is_pinned DESC, p.created_at DESC LIMIT 4
    """).fetchall()

    events = db.execute("""
        SELECT e.*, d.name as dept_name
        FROM events e LEFT JOIN departments d ON e.dept_id = d.id
        WHERE e.event_date >= DATE('now')
        ORDER BY e.event_date ASC LIMIT 4
    """).fetchall()

    city_stats = {
        'open_city':     db.execute("SELECT COUNT(*) FROM complaints WHERE status IN ('Registered','In Progress')").fetchone()[0],
        'resolved_city': db.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'").fetchone()[0],
    }

    db.close()
    return render_template('citizen/dashboard.html',
        my_stats=my_stats, my_complaints=my_complaints,
        notices=notices, posts=posts, events=events, city_stats=city_stats)

# ── MY COMPLAINTS ──────────────────────────────────────────────────────────────
@citizen_bp.route('/complaints')
@citizen_required
def complaints():
    db = get_db()
    uid = session['user_id']
    status = request.args.get('status', '')

    query = """
        SELECT c.*, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE c.citizen_id = ?
    """
    params = [uid]
    if status:
        query += " AND c.status = ?"
        params.append(status)
    query += " ORDER BY c.created_at DESC"

    my_complaints = db.execute(query, params).fetchall()
    db.close()
    return render_template('citizen/complaints.html',
        complaints=my_complaints, filter_status=status)

# ── COMPLAINT DETAIL ───────────────────────────────────────────────────────────
@citizen_bp.route('/complaints/<int:cid>')
@citizen_required
def complaint_detail(cid):
    db = get_db()
    uid = session['user_id']

    complaint = db.execute("""
        SELECT c.*, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE c.id = ? AND c.citizen_id = ?
    """, (cid, uid)).fetchone()

    if not complaint:
        flash('Complaint not found or access denied.', 'danger')
        return redirect(url_for('citizen.complaints'))

    updates = db.execute("""
        SELECT cu.*, u.name as updated_by_name, u.role as updated_by_role
        FROM complaint_updates cu
        LEFT JOIN users u ON cu.updated_by = u.id
        WHERE cu.complaint_id = ?
        ORDER BY cu.created_at ASC
    """, (cid,)).fetchall()

    db.close()
    return render_template('citizen/complaint_detail.html',
        complaint=complaint, updates=updates)

# ── FILE NEW COMPLAINT ─────────────────────────────────────────────────────────
@citizen_bp.route('/complaints/new', methods=['GET', 'POST'])
@citizen_required
def new_complaint():
    db = get_db()
    depts = db.execute("SELECT * FROM departments").fetchall()

    if request.method == 'POST':
        title   = request.form.get('title', '').strip()
        desc    = request.form.get('description', '').strip()
        dept_id = request.form.get('dept_id')
        area    = request.form.get('area', '').strip()
        priority = request.form.get('priority', 'Medium')

        errors = []
        if not title or len(title) < 5:
            errors.append('Title must be at least 5 characters.')
        if not desc or len(desc) < 10:
            errors.append('Description must be at least 10 characters.')
        if not dept_id:
            errors.append('Please select a department.')

        if errors:
            for e in errors:
                flash(e, 'danger')
            db.close()
            return render_template('citizen/new_complaint.html', depts=depts, form_data=request.form)

        # Handle image upload
        image_path = None
        if 'image' in request.files:
            image_path = save_image(request.files['image'])

        # Grab lat/lng from geolocation widget
        try:
            lat = float(request.form.get('lat', '') or 0) or None
            lng = float(request.form.get('lng', '') or 0) or None
        except ValueError:
            lat = lng = None

        db.execute("""
            INSERT INTO complaints (title, description, dept_id, citizen_id, priority, area, image_path, lat, lng)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (title, desc, dept_id, session['user_id'], priority, area, image_path, lat, lng))
        db.commit()

        cid = db.execute("SELECT last_insert_rowid()").fetchone()[0]
        db.execute("""
            INSERT INTO complaint_updates (complaint_id, updated_by, note, status)
            VALUES (?, ?, ?, ?)
        """, (cid, session['user_id'], 'Complaint filed by citizen.', 'Registered'))
        db.commit()
        db.close()

        flash('Complaint filed successfully! We will look into it shortly.', 'success')
        return redirect(url_for('citizen.complaint_detail', cid=cid))

    db.close()
    return render_template('citizen/new_complaint.html', depts=depts, form_data={})

# ── NOTICES ────────────────────────────────────────────────────────────────────
@citizen_bp.route('/notices')
@citizen_required
def notices():
    db = get_db()
    ntype = request.args.get('type', '')
    query = """
        SELECT n.*, u.name as posted_by_name, d.name as dept_name
        FROM notices n
        LEFT JOIN users u ON n.posted_by = u.id
        LEFT JOIN departments d ON n.dept_id = d.id
        WHERE n.is_public = 1
    """
    params = []
    if ntype:
        query += " AND n.type = ?"
        params.append(ntype)
    query += " ORDER BY n.created_at DESC"

    notices = db.execute(query, params).fetchall()
    db.close()
    return render_template('citizen/notices.html', notices=notices, filter_type=ntype)

# ── PROBLEMGRAM (read-only) ────────────────────────────────────────────────────
@citizen_bp.route('/problemgram')
@citizen_required
def problemgram():
    db = get_db()
    dept_id = request.args.get('dept_id', '')
    query = """
        SELECT p.*, u.name as author, d.name as dept_name, d.icon as dept_icon
        FROM posts p
        LEFT JOIN users u ON p.posted_by = u.id
        LEFT JOIN departments d ON p.dept_id = d.id
        WHERE 1=1
    """
    params = []
    if dept_id:
        query += " AND p.dept_id = ?"
        params.append(dept_id)
    query += " ORDER BY p.is_pinned DESC, p.created_at DESC"

    posts  = db.execute(query, params).fetchall()
    depts  = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('citizen/problemgram.html',
        posts=posts, depts=depts, filter_dept=dept_id)

# ── CITY ISSUES (public feed) ─────────────────────────────────────────────────
@citizen_bp.route('/city-issues')
@citizen_required
def city_issues():
    db = get_db()
    dept_id  = request.args.get('dept_id', '')
    priority = request.args.get('priority', '')

    query = """
        SELECT c.title, c.area, c.priority, c.status, c.created_at,
               d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE 1=1
    """
    params = []
    if dept_id:
        query += " AND c.dept_id = ?"
        params.append(dept_id)
    if priority:
        query += " AND c.priority = ?"
        params.append(priority)
    query += " ORDER BY c.created_at DESC LIMIT 50"

    issues = db.execute(query, params).fetchall()
    depts  = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('citizen/city_issues.html',
        issues=issues, depts=depts,
        filter_dept=dept_id, filter_priority=priority)

# ── RESPOND TO VERIFICATION QUERY ─────────────────────────────────────────────
@citizen_bp.route('/queries')
@citizen_required
def open_queries():
    db  = get_db()
    uid = session['user_id']
    user = db.execute("SELECT area FROM users WHERE id=?", (uid,)).fetchone()
    area_word = (user['area'] or '').split()[0] if user and user['area'] else ''

    if area_word:
        queries = db.execute("""
            SELECT vq.*, c.title as comp_title,
                   u.name as raised_by_name,
                   COUNT(vr.id) as response_count,
                   SUM(CASE WHEN vr.citizen_id=? THEN 1 ELSE 0 END) as already_responded
            FROM verification_queries vq
            LEFT JOIN complaints c ON vq.complaint_id = c.id
            LEFT JOIN users u      ON vq.raised_by = u.id
            LEFT JOIN verification_responses vr ON vq.id = vr.query_id
            WHERE vq.status='Open' AND vq.area LIKE ?
            GROUP BY vq.id
            ORDER BY vq.created_at DESC
        """, (uid, f'%{area_word}%')).fetchall()
    else:
        queries = db.execute("""
            SELECT vq.*, c.title as comp_title,
                   u.name as raised_by_name,
                   COUNT(vr.id) as response_count,
                   SUM(CASE WHEN vr.citizen_id=? THEN 1 ELSE 0 END) as already_responded
            FROM verification_queries vq
            LEFT JOIN complaints c ON vq.complaint_id = c.id
            LEFT JOIN users u      ON vq.raised_by = u.id
            LEFT JOIN verification_responses vr ON vq.id = vr.query_id
            WHERE vq.status='Open'
            GROUP BY vq.id
            ORDER BY vq.created_at DESC
        """, (uid,)).fetchall()
    db.close()
    return render_template('citizen/queries.html', queries=queries)

@citizen_bp.route('/queries/<int:qid>/respond', methods=['POST'])
@citizen_required
def respond_query(qid):
    db       = get_db()
    response = request.form.get('response', '').strip()
    if not response:
        flash('Response cannot be empty.', 'danger')
        return redirect(url_for('citizen.open_queries'))
    # Check not already responded
    existing = db.execute("""
        SELECT id FROM verification_responses
        WHERE query_id=? AND citizen_id=?
    """, (qid, session['user_id'])).fetchone()
    if existing:
        flash('You have already responded to this query.', 'warning')
        db.close()
        return redirect(url_for('citizen.open_queries'))
    # Verify citizen exists before inserting
    user_check = db.execute("SELECT id FROM users WHERE id=?", (session['user_id'],)).fetchone()
    if not user_check:
        flash('Session error. Please log in again.', 'danger')
        db.close()
        return redirect(url_for('login'))
    # Verify query exists
    query_check = db.execute("SELECT id FROM verification_queries WHERE id=?", (qid,)).fetchone()
    if not query_check:
        flash('Query not found.', 'danger')
        db.close()
        return redirect(url_for('citizen.open_queries'))
    db.execute("""
        INSERT INTO verification_responses (query_id, citizen_id, response)
        VALUES (?,?,?)
    """, (qid, session['user_id'], response))
    db.commit(); db.close()
    flash('Your response has been submitted. Thank you for helping verify!', 'success')
    return redirect(url_for('citizen.open_queries'))
