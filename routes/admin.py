from flask import Blueprint, render_template, session, redirect, url_for, request, flash
from functools import wraps
from database import get_db
from werkzeug.utils import secure_filename
import os, datetime

admin_bp = Blueprint('admin', __name__)

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'static', 'uploads')
ALLOWED = {'png','jpg','jpeg','gif','webp'}

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if session.get('role') != 'admin':
            flash('Admin access required.', 'danger')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def save_image(file):
    if file and file.filename:
        ext = file.filename.rsplit('.',1)[-1].lower()
        if ext in ALLOWED:
            fname = f"{datetime.datetime.now().strftime('%Y%m%d%H%M%S')}_{secure_filename(file.filename)}"
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            file.save(os.path.join(UPLOAD_FOLDER, fname))
            return fname
    return None

# ── DASHBOARD ─────────────────────────────────────────────────────────────────
@admin_bp.route('/dashboard')
@admin_required
def dashboard():
    db = get_db()
    stats = {
        'total_complaints':  db.execute("SELECT COUNT(*) FROM complaints").fetchone()[0],
        'open_complaints':   db.execute("SELECT COUNT(*) FROM complaints WHERE status IN ('Registered','In Progress')").fetchone()[0],
        'resolved_today':    db.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved' AND DATE(updated_at)=DATE('now')").fetchone()[0],
        'total_labour':      db.execute("SELECT COUNT(*) FROM labour").fetchone()[0],
        'absent_labour':     db.execute("SELECT COUNT(*) FROM labour WHERE status='Absent'").fetchone()[0],
        'total_notices':     db.execute("SELECT COUNT(*) FROM notices").fetchone()[0],
        'total_citizens':    db.execute("SELECT COUNT(*) FROM users WHERE role='citizen'").fetchone()[0],
        'critical':          db.execute("SELECT COUNT(*) FROM complaints WHERE priority='Critical' AND status!='Resolved'").fetchone()[0],
    }
    recent_complaints = db.execute("""
        SELECT c.*, u.name as citizen_name, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN users u ON c.citizen_id=u.id
        LEFT JOIN departments d ON c.dept_id=d.id
        ORDER BY c.created_at DESC LIMIT 6
    """).fetchall()
    departments = db.execute("""
        SELECT d.*, COUNT(c.id) as complaint_count,
               SUM(CASE WHEN c.status='Resolved' THEN 1 ELSE 0 END) as resolved_count
        FROM departments d
        LEFT JOIN complaints c ON d.id=c.dept_id
        GROUP BY d.id
    """).fetchall()
    recent_notices = db.execute("""
        SELECT n.*, u.name as posted_by_name
        FROM notices n LEFT JOIN users u ON n.posted_by=u.id
        ORDER BY n.created_at DESC LIMIT 4
    """).fetchall()
    events = db.execute("""
        SELECT * FROM events WHERE event_date >= DATE('now')
        ORDER BY event_date ASC LIMIT 5
    """).fetchall()
    posts = db.execute("""
        SELECT p.*, u.name as author, d.name as dept_name
        FROM posts p LEFT JOIN users u ON p.posted_by=u.id
        LEFT JOIN departments d ON p.dept_id=d.id
        ORDER BY p.created_at DESC LIMIT 4
    """).fetchall()
    budget = db.execute("""
        SELECT dept_id,
               SUM(CASE WHEN type='Allocated' THEN amount ELSE 0 END) as allocated,
               SUM(CASE WHEN type='Spent'     THEN amount ELSE 0 END) as spent
        FROM budget_entries GROUP BY dept_id
    """).fetchall()
    db.close()
    return render_template('admin/dashboard.html',
        stats=stats, recent_complaints=recent_complaints,
        departments=departments, recent_notices=recent_notices,
        events=events, posts=posts, budget=budget)

# ── COMPLAINTS ────────────────────────────────────────────────────────────────
@admin_bp.route('/complaints')
@admin_required
def complaints():
    db = get_db()
    status   = request.args.get('status', '')
    priority = request.args.get('priority', '')
    dept_id  = request.args.get('dept_id', '')
    query = """
        SELECT c.*, u.name as citizen_name, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN users u ON c.citizen_id=u.id
        LEFT JOIN departments d ON c.dept_id=d.id
        WHERE 1=1
    """
    params = []
    if status:   query += " AND c.status=?";   params.append(status)
    if priority: query += " AND c.priority=?"; params.append(priority)
    if dept_id:  query += " AND c.dept_id=?";  params.append(dept_id)
    query += " ORDER BY c.created_at DESC"
    complaints = db.execute(query, params).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/complaints.html',
        complaints=complaints, depts=depts,
        filter_status=status, filter_priority=priority, filter_dept=dept_id)

@admin_bp.route('/complaints/<int:cid>')
@admin_required
def complaint_detail(cid):
    db = get_db()
    complaint = db.execute("""
        SELECT c.*, u.name as citizen_name, u.phone as citizen_phone,
               u.area as citizen_area, d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN users u ON c.citizen_id=u.id
        LEFT JOIN departments d ON c.dept_id=d.id
        WHERE c.id=?
    """, (cid,)).fetchone()
    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('admin.complaints'))
    updates = db.execute("""
        SELECT cu.*, u.name as updated_by_name, u.role as updated_by_role
        FROM complaint_updates cu
        LEFT JOIN users u ON cu.updated_by=u.id
        WHERE cu.complaint_id=? ORDER BY cu.created_at ASC
    """, (cid,)).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/complaint_detail.html',
        complaint=complaint, updates=updates, depts=depts)

@admin_bp.route('/complaints/<int:cid>/update', methods=['POST'])
@admin_required
def update_complaint(cid):
    status = request.form.get('status')
    note   = request.form.get('note', '').strip()
    db = get_db()
    db.execute("UPDATE complaints SET status=?, updated_at=CURRENT_TIMESTAMP WHERE id=?", (status, cid))
    if note:
        db.execute("INSERT INTO complaint_updates (complaint_id, updated_by, note, status) VALUES (?,?,?,?)",
                   (cid, session['user_id'], note, status))
    db.commit()
    db.close()
    flash('Complaint updated successfully!', 'success')
    return redirect(url_for('admin.complaint_detail', cid=cid))

# ── NOTICES ───────────────────────────────────────────────────────────────────
@admin_bp.route('/notices')
@admin_required
def notices():
    db = get_db()
    notices = db.execute("""
        SELECT n.*, u.name as posted_by_name, d.name as dept_name
        FROM notices n
        LEFT JOIN users u ON n.posted_by=u.id
        LEFT JOIN departments d ON n.dept_id=d.id
        ORDER BY n.created_at DESC
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/notices.html', notices=notices, depts=depts)

@admin_bp.route('/notices/add', methods=['POST'])
@admin_required
def add_notice():
    title   = request.form.get('title','').strip()
    content = request.form.get('content','').strip()
    ntype   = request.form.get('type','General')
    dept_id = request.form.get('dept_id') or None
    if not title or not content:
        flash('Title and content are required.', 'danger')
        return redirect(url_for('admin.notices'))
    db = get_db()
    db.execute("INSERT INTO notices (title,content,type,posted_by,dept_id) VALUES (?,?,?,?,?)",
               (title, content, ntype, session['user_id'], dept_id))
    db.commit()
    db.close()
    flash('Notice posted successfully!', 'success')
    return redirect(url_for('admin.notices'))

@admin_bp.route('/notices/<int:nid>/delete', methods=['POST'])
@admin_required
def delete_notice(nid):
    db = get_db()
    db.execute("DELETE FROM notices WHERE id=?", (nid,))
    db.commit()
    db.close()
    flash('Notice deleted.', 'info')
    return redirect(url_for('admin.notices'))

# ── LABOUR ────────────────────────────────────────────────────────────────────
@admin_bp.route('/labour')
@admin_required
def labour():
    db = get_db()
    dept_id = request.args.get('dept_id','')
    status  = request.args.get('status','')
    query = "SELECT l.*, d.name as dept_name, d.icon as dept_icon FROM labour l LEFT JOIN departments d ON l.dept_id=d.id WHERE 1=1"
    params = []
    if dept_id: query += " AND l.dept_id=?"; params.append(dept_id)
    if status:  query += " AND l.status=?";  params.append(status)
    query += " ORDER BY l.dept_id, l.name"
    workers   = db.execute(query, params).fetchall()
    depts     = db.execute("SELECT * FROM departments").fetchall()
    lab_stats = db.execute("""
        SELECT status, COUNT(*) as count FROM labour GROUP BY status
    """).fetchall()
    db.close()
    return render_template('admin/labour.html',
        workers=workers, depts=depts, lab_stats=lab_stats,
        filter_dept=dept_id, filter_status=status)

@admin_bp.route('/labour/add', methods=['POST'])
@admin_required
def add_labour():
    db = get_db()
    db.execute("INSERT INTO labour (name,role,dept_id,status,area,phone) VALUES (?,?,?,?,?,?)", (
        request.form.get('name'), request.form.get('role'),
        request.form.get('dept_id'), request.form.get('status','Active'),
        request.form.get('area'), request.form.get('phone')
    ))
    db.commit(); db.close()
    flash('Worker added!', 'success')
    return redirect(url_for('admin.labour'))

@admin_bp.route('/labour/<int:lid>/status', methods=['POST'])
@admin_required
def update_labour_status(lid):
    status = request.form.get('status')
    db = get_db()
    db.execute("UPDATE labour SET status=? WHERE id=?", (status, lid))
    db.commit(); db.close()
    flash('Status updated!', 'success')
    return redirect(url_for('admin.labour'))

@admin_bp.route('/labour/<int:lid>/delete', methods=['POST'])
@admin_required
def delete_labour(lid):
    db = get_db()
    db.execute("DELETE FROM labour WHERE id=?", (lid,))
    db.commit(); db.close()
    flash('Worker removed.', 'info')
    return redirect(url_for('admin.labour'))

# ── BUDGET ────────────────────────────────────────────────────────────────────
@admin_bp.route('/budget')
@admin_required
def budget():
    db = get_db()
    entries = db.execute("""
        SELECT b.*, d.name as dept_name, d.icon as dept_icon, u.name as created_by_name
        FROM budget_entries b
        LEFT JOIN departments d ON b.dept_id=d.id
        LEFT JOIN users u ON b.created_by=u.id
        ORDER BY b.created_at DESC
    """).fetchall()
    summary = db.execute("""
        SELECT d.id, d.name, d.icon, d.budget as total_budget,
               SUM(CASE WHEN b.type='Allocated' THEN b.amount ELSE 0 END) as allocated,
               SUM(CASE WHEN b.type='Spent'     THEN b.amount ELSE 0 END) as spent
        FROM departments d
        LEFT JOIN budget_entries b ON d.id=b.dept_id
        GROUP BY d.id
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/budget.html', entries=entries, summary=summary, depts=depts)

@admin_bp.route('/budget/add', methods=['POST'])
@admin_required
def add_budget():
    db = get_db()
    db.execute("INSERT INTO budget_entries (dept_id,amount,type,description,created_by) VALUES (?,?,?,?,?)", (
        request.form.get('dept_id'), request.form.get('amount'),
        request.form.get('type'), request.form.get('description'),
        session['user_id']
    ))
    db.commit(); db.close()
    flash('Budget entry added!', 'success')
    return redirect(url_for('admin.budget'))

# ── PROBLEMGRAM ───────────────────────────────────────────────────────────────
@admin_bp.route('/problemgram')
@admin_required
def problemgram():
    db = get_db()
    posts = db.execute("""
        SELECT p.*, u.name as author, d.name as dept_name, d.icon as dept_icon
        FROM posts p LEFT JOIN users u ON p.posted_by=u.id
        LEFT JOIN departments d ON p.dept_id=d.id
        ORDER BY p.is_pinned DESC, p.created_at DESC
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/problemgram.html', posts=posts, depts=depts)

@admin_bp.route('/problemgram/add', methods=['POST'])
@admin_required
def add_post():
    db = get_db()
    db.execute("INSERT INTO posts (title,content,posted_by,dept_id) VALUES (?,?,?,?)", (
        request.form.get('title'), request.form.get('content'),
        session['user_id'], request.form.get('dept_id') or None
    ))
    db.commit(); db.close()
    flash('Post published!', 'success')
    return redirect(url_for('admin.problemgram'))

@admin_bp.route('/problemgram/<int:pid>/pin', methods=['POST'])
@admin_required
def pin_post(pid):
    db = get_db()
    cur = db.execute("SELECT is_pinned FROM posts WHERE id=?", (pid,)).fetchone()
    db.execute("UPDATE posts SET is_pinned=? WHERE id=?", (0 if cur['is_pinned'] else 1, pid))
    db.commit(); db.close()
    flash('Post pin toggled.', 'info')
    return redirect(url_for('admin.problemgram'))

@admin_bp.route('/problemgram/<int:pid>/delete', methods=['POST'])
@admin_required
def delete_post(pid):
    db = get_db()
    db.execute("DELETE FROM posts WHERE id=?", (pid,))
    db.commit(); db.close()
    flash('Post deleted.', 'info')
    return redirect(url_for('admin.problemgram'))

# ── DEPARTMENTS ───────────────────────────────────────────────────────────────
@admin_bp.route('/departments')
@admin_required
def departments():
    db = get_db()
    depts = db.execute("""
        SELECT d.*,
               COUNT(DISTINCT c.id) as total_complaints,
               SUM(CASE WHEN c.status='Resolved' THEN 1 ELSE 0 END) as resolved,
               SUM(CASE WHEN c.status IN ('Registered','In Progress') THEN 1 ELSE 0 END) as open_c,
               COUNT(DISTINCT l.id) as total_workers
        FROM departments d
        LEFT JOIN complaints c ON d.id=c.dept_id
        LEFT JOIN labour l ON d.id=l.dept_id
        GROUP BY d.id
    """).fetchall()
    db.close()
    return render_template('admin/departments.html', depts=depts)

# ── CALENDAR ─────────────────────────────────────────────────────────────────
@admin_bp.route('/calendar')
@admin_required
def calendar():
    db = get_db()
    events = db.execute("""
        SELECT e.*, d.name as dept_name, u.name as created_by_name
        FROM events e
        LEFT JOIN departments d ON e.dept_id=d.id
        LEFT JOIN users u ON e.created_by=u.id
        ORDER BY e.event_date ASC
    """).fetchall()
    depts = db.execute("SELECT * FROM departments").fetchall()
    db.close()
    return render_template('admin/calendar.html', events=events, depts=depts)

@admin_bp.route('/calendar/add', methods=['POST'])
@admin_required
def add_event():
    db = get_db()
    db.execute("INSERT INTO events (title,description,event_date,dept_id,created_by,type) VALUES (?,?,?,?,?,?)", (
        request.form.get('title'), request.form.get('description'),
        request.form.get('event_date'), request.form.get('dept_id') or None,
        session['user_id'], request.form.get('type','Work')
    ))
    db.commit(); db.close()
    flash('Event added!', 'success')
    return redirect(url_for('admin.calendar'))

@admin_bp.route('/calendar/<int:eid>/delete', methods=['POST'])
@admin_required
def delete_event(eid):
    db = get_db()
    db.execute("DELETE FROM events WHERE id=?", (eid,))
    db.commit(); db.close()
    flash('Event deleted.', 'info')
    return redirect(url_for('admin.calendar'))

# ── USERS ─────────────────────────────────────────────────────────────────────
@admin_bp.route('/users')
@admin_required
def users():
    db = get_db()
    users = db.execute("""
        SELECT u.*,
               COUNT(c.id) as complaint_count
        FROM users u
        LEFT JOIN complaints c ON u.id=c.citizen_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
    """).fetchall()
    db.close()
    return render_template('admin/users.html', users=users)

@admin_bp.route('/users/<int:uid>/toggle', methods=['POST'])
@admin_required
def toggle_user(uid):
    db = get_db()
    cur = db.execute("SELECT is_active FROM users WHERE id=?", (uid,)).fetchone()
    db.execute("UPDATE users SET is_active=? WHERE id=?", (0 if cur['is_active'] else 1, uid))
    db.commit(); db.close()
    flash('User status toggled.', 'info')
    return redirect(url_for('admin.users'))

# ── SEND MESSAGE TO CITIZEN ────────────────────────────────────────────────────
@admin_bp.route('/complaints/<int:cid>/message', methods=['POST'])
@admin_required
def send_message(cid):
    db      = get_db()
    subject = request.form.get('subject', '').strip()
    body    = request.form.get('body', '').strip()
    comp    = db.execute("SELECT citizen_id, title FROM complaints WHERE id=?", (cid,)).fetchone()
    if not comp or not body:
        flash('Message body is required.', 'danger')
        db.close()
        return redirect(url_for('admin.complaint_detail', cid=cid))
    db.execute("""
        INSERT INTO messages (complaint_id, sender_id, receiver_id, subject, body)
        VALUES (?,?,?,?,?)
    """, (cid, session['user_id'], comp['citizen_id'],
          subject or f'Re: {comp["title"]}', body))
    # Also add to complaint timeline
    db.execute("""
        INSERT INTO complaint_updates (complaint_id, updated_by, note, status)
        VALUES (?,?,?,?)
    """, (cid, session['user_id'], f'📩 Admin sent a message: "{body[:80]}"', None))
    db.commit()
    db.close()
    flash('Message sent to citizen successfully!', 'success')
    return redirect(url_for('admin.complaint_detail', cid=cid))

# ── ANALYTICS DASHBOARD ────────────────────────────────────────────────────────
@admin_bp.route('/analytics')
@admin_required
def analytics():
    db = get_db()

    # Complaints per department
    dept_data = db.execute("""
        SELECT d.name, d.icon,
               COUNT(c.id) as total,
               SUM(CASE WHEN c.status='Resolved' THEN 1 ELSE 0 END) as resolved,
               SUM(CASE WHEN c.status IN ('Registered','In Progress') THEN 1 ELSE 0 END) as open_c
        FROM departments d LEFT JOIN complaints c ON d.id=c.dept_id
        GROUP BY d.id
    """).fetchall()

    # Complaints by priority
    priority_data = db.execute("""
        SELECT priority, COUNT(*) as cnt FROM complaints GROUP BY priority
    """).fetchall()

    # Complaints by status
    status_data = db.execute("""
        SELECT status, COUNT(*) as cnt FROM complaints GROUP BY status
    """).fetchall()

    # Labour by department
    labour_dept = db.execute("""
        SELECT d.name, d.icon, COUNT(l.id) as total,
               SUM(CASE WHEN l.status='Active' THEN 1 ELSE 0 END) as active
        FROM departments d LEFT JOIN labour l ON d.id=l.dept_id GROUP BY d.id
    """).fetchall()

    # Budget utilisation
    budget_data = db.execute("""
        SELECT d.name, d.icon,
               COALESCE(SUM(CASE WHEN b.type='Allocated' THEN b.amount ELSE 0 END),0) as allocated,
               COALESCE(SUM(CASE WHEN b.type='Spent'     THEN b.amount ELSE 0 END),0) as spent
        FROM departments d LEFT JOIN budget_entries b ON d.id=b.dept_id GROUP BY d.id
    """).fetchall()

    # Totals
    totals = {
        'complaints': db.execute("SELECT COUNT(*) FROM complaints").fetchone()[0],
        'resolved':   db.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'").fetchone()[0],
        'citizens':   db.execute("SELECT COUNT(*) FROM users WHERE role='citizen'").fetchone()[0],
        'labour':     db.execute("SELECT COUNT(*) FROM labour").fetchone()[0],
    }
    db.close()
    return render_template('admin/analytics.html',
        dept_data=dept_data, priority_data=priority_data,
        status_data=status_data, labour_dept=labour_dept,
        budget_data=budget_data, totals=totals)
