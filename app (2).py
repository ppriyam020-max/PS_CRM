from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from functools import wraps
from database import get_db, init_db
import os, re

app = Flask(__name__)
app.secret_key = 'pscrm-secret-key-2026-change-in-production'

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'static', 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_id' not in session:
            flash('Please login to continue.', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated

def role_required(*roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if 'user_id' not in session:
                flash('Please login to continue.', 'warning')
                return redirect(url_for('login'))
            if session.get('role') not in roles:
                flash('You do not have permission to access this page.', 'danger')
                return redirect(url_for('dashboard'))
            return f(*args, **kwargs)
        return decorated
    return decorator

def get_current_user():
    if 'user_id' not in session:
        return None
    db = get_db()
    user = db.execute('SELECT * FROM users WHERE id = ?', (session['user_id'],)).fetchone()
    db.close()
    return user

@app.route('/')
def index():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    role = session.get('role')
    if role == 'admin':
        return redirect(url_for('admin.dashboard'))
    elif role == 'head':
        return redirect(url_for('head.dashboard'))
    else:
        return redirect(url_for('citizen.dashboard'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        email    = request.form.get('email', '').strip().lower()
        password = request.form.get('password', '')
        role     = request.form.get('role', '')
        if not email or not password or not role:
            flash('All fields are required.', 'danger')
            return render_template('auth/login.html')
        db   = get_db()
        user = db.execute(
            'SELECT * FROM users WHERE email = ? AND role = ? AND is_active = 1',
            (email, role)
        ).fetchone()
        db.close()
        if user and check_password_hash(user['password'], password):
            session.clear()
            session['user_id']   = user['id']
            session['user_name'] = user['name']
            session['role']      = user['role']
            session['email']     = user['email']
            session['city']      = user['city']
            session.permanent    = True
            flash(f'Welcome back, {user["name"]}!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid email, password, or role.', 'danger')
    return render_template('auth/login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    if request.method == 'POST':
        name     = request.form.get('name', '').strip()
        email    = request.form.get('email', '').strip().lower()
        phone    = request.form.get('phone', '').strip()
        password = request.form.get('password', '')
        confirm  = request.form.get('confirm_password', '')
        area     = request.form.get('area', '').strip()
        city          = request.form.get('city', 'Delhi').strip()
        phone_verified = request.form.get('phone_verified', '0')
        errors = []
        if not name or len(name) < 2:
            errors.append('Name must be at least 2 characters.')
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            errors.append('Enter a valid email address.')
        if not re.match(r'^\d{10}$', phone):
            errors.append('Phone must be 10 digits.')
        if phone_verified != '1':
            errors.append('Please verify your phone number with OTP before registering.')
        if len(password) < 6:
            errors.append('Password must be at least 6 characters.')
        if password != confirm:
            errors.append('Passwords do not match.')
        if errors:
            for e in errors:
                flash(e, 'danger')
            return render_template('auth/register.html', form_data=request.form)
        db = get_db()
        existing = db.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
        if existing:
            flash('An account with this email already exists.', 'danger')
            db.close()
            return render_template('auth/register.html', form_data=request.form)
        db.execute(
            'INSERT INTO users (name,email,phone,password,role,area,city) VALUES (?,?,?,?,?,?,?)',
            (name, email, phone, generate_password_hash(password), 'citizen', area, city)
        )
        db.commit()
        db.close()
        flash('Account created! Please login.', 'success')
        return redirect(url_for('login'))
    return render_template('auth/register.html', form_data={})

@app.route('/logout')
def logout():
    name = session.get('user_name', 'User')
    session.clear()
    flash(f'Goodbye, {name}! You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/profile', methods=['GET', 'POST'])
@login_required
def profile():
    user = get_current_user()
    if request.method == 'POST':
        name  = request.form.get('name', '').strip()
        phone = request.form.get('phone', '').strip()
        area  = request.form.get('area', '').strip()
        city  = request.form.get('city', '').strip()
        db = get_db()
        db.execute('UPDATE users SET name=?, phone=?, area=?, city=? WHERE id=?',
                   (name, phone, area, city, session['user_id']))
        db.commit()
        db.close()
        session['user_name'] = name
        flash('Profile updated!', 'success')
        return redirect(url_for('profile'))
    return render_template('shared/profile.html', user=user)

@app.route('/change-password', methods=['POST'])
@login_required
def change_password():
    current = request.form.get('current_password', '')
    new_pw  = request.form.get('new_password', '')
    confirm = request.form.get('confirm_password', '')
    db   = get_db()
    user = db.execute('SELECT * FROM users WHERE id=?', (session['user_id'],)).fetchone()
    if not check_password_hash(user['password'], current):
        flash('Current password is incorrect.', 'danger')
    elif len(new_pw) < 6:
        flash('New password must be at least 6 characters.', 'danger')
    elif new_pw != confirm:
        flash('New passwords do not match.', 'danger')
    else:
        db.execute('UPDATE users SET password=? WHERE id=?',
                   (generate_password_hash(new_pw), session['user_id']))
        db.commit()
        flash('Password changed successfully!', 'success')
    db.close()
    return redirect(url_for('profile'))

from routes.admin   import admin_bp
from routes.citizen import citizen_bp
from routes.head    import head_bp
app.register_blueprint(admin_bp,   url_prefix='/admin')
app.register_blueprint(citizen_bp, url_prefix='/citizen')
app.register_blueprint(head_bp,    url_prefix='/head')

# context_processor moved to bottom of file

@app.errorhandler(404)
def not_found(e):
    return render_template('shared/404.html'), 404

@app.errorhandler(413)
def too_large(e):
    flash('File too large. Maximum 5MB allowed.', 'danger')
    return redirect(request.referrer or url_for('dashboard'))

if __name__ == '__main__':
    init_db()
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    app.run(debug=True, port=5000)

# ── GLOBAL SEARCH ──────────────────────────────────────────────────────────────
@app.route('/search')
@login_required
def search():
    q = request.args.get('q', '').strip()
    if len(q) < 2:
        return jsonify({'complaints':[], 'notices':[], 'posts':[]})

    db   = get_db()
    role = session.get('role')
    uid  = session.get('user_id')
    like = f'%{q}%'

    # Complaints — admin/head see all, citizen sees own
    if role in ('admin', 'head'):
        comps = db.execute("""
            SELECT c.id, c.title, c.status, c.area
            FROM complaints c WHERE c.title LIKE ? OR c.area LIKE ? LIMIT 6
        """, (like, like)).fetchall()
    else:
        comps = db.execute("""
            SELECT c.id, c.title, c.status, c.area
            FROM complaints c WHERE c.citizen_id=? AND (c.title LIKE ? OR c.area LIKE ?) LIMIT 6
        """, (uid, like, like)).fetchall()

    notices = db.execute("""
        SELECT id, title, type, created_at FROM notices
        WHERE title LIKE ? OR content LIKE ? LIMIT 5
    """, (like, like)).fetchall()

    posts = db.execute("""
        SELECT id, title, created_at FROM posts
        WHERE title LIKE ? OR content LIKE ? LIMIT 4
    """, (like, like)).fetchall()
    db.close()

    # Build role-appropriate URLs
    def comp_url(cid):
        if role == 'admin': return f'/admin/complaints/{cid}'
        if role == 'head':  return f'/head/overview'
        return f'/citizen/complaints/{cid}'

    def notice_url():
        if role == 'admin': return '/admin/notices'
        if role == 'head':  return '/head/notices'
        return '/citizen/notices'

    def post_url():
        if role == 'admin': return '/admin/problemgram'
        return '/citizen/problemgram'

    return jsonify({
        'complaints': [{'title': c['title'], 'status': c['status'],
                        'area': c['area'] or '', 'url': comp_url(c['id'])} for c in comps],
        'notices':    [{'title': n['title'], 'type': n['type'],
                        'date': n['created_at'][:10], 'url': notice_url()} for n in notices],
        'posts':      [{'title': p['title'],
                        'date': p['created_at'][:10], 'url': post_url()} for p in posts],
    })

# ── SHARED INBOX ───────────────────────────────────────────────────────────────
@app.route('/inbox')
@login_required
def shared_inbox():
    db  = get_db()
    uid = session['user_id']
    messages = db.execute("""
        SELECT m.*, u.name as sender_name, u.role as sender_role,
               c.title as complaint_title
        FROM messages m
        LEFT JOIN users u ON m.sender_id = u.id
        LEFT JOIN complaints c ON m.complaint_id = c.id
        WHERE m.receiver_id = ?
        ORDER BY m.created_at DESC
    """, (uid,)).fetchall()
    # Mark all as read
    db.execute("UPDATE messages SET is_read=1 WHERE receiver_id=?", (uid,))
    db.commit()
    db.close()
    return render_template('shared/inbox.html', messages=messages)

# ── UNREAD COUNT (injected into every template) ────────────────────────────────
@app.context_processor
def inject_user():
    unread = 0
    user   = get_current_user()
    if user:
        db     = get_db()
        unread = db.execute(
            "SELECT COUNT(*) FROM messages WHERE receiver_id=? AND is_read=0",
            (user['id'],)
        ).fetchone()[0]
        db.close()
    return dict(
        current_user=user,
        session_role=session.get('role'),
        session_name=session.get('user_name'),
        unread_count=unread,
    )

# ── PUBLIC MAP PAGE ────────────────────────────────────────────────────────────
@app.route('/map')
def public_map():
    """Public city issues map — no login required."""
    db = get_db()
    depts = db.execute("SELECT id, name, icon FROM departments").fetchall()
    stats = {
        'open':       db.execute("SELECT COUNT(*) FROM complaints WHERE status='Registered'").fetchone()[0],
        'inprogress': db.execute("SELECT COUNT(*) FROM complaints WHERE status='In Progress'").fetchone()[0],
        'resolved':   db.execute("SELECT COUNT(*) FROM complaints WHERE status='Resolved'").fetchone()[0],
    }
    db.close()
    return render_template('public/map.html', depts=depts, stats=stats)

@app.route('/api/map-pins')
def map_pins():
    """JSON API — returns all complaints with coordinates for the map."""
    db = get_db()
    dept_id  = request.args.get('dept_id', '')
    status   = request.args.get('status',  '')

    query = """
        SELECT c.id, c.title, c.description, c.status, c.priority,
               c.area, c.lat, c.lng, c.created_at,
               d.name as dept_name, d.icon as dept_icon
        FROM complaints c
        LEFT JOIN departments d ON c.dept_id = d.id
        WHERE c.lat IS NOT NULL AND c.lng IS NOT NULL
    """
    params = []
    if dept_id:
        query += " AND c.dept_id = ?"
        params.append(dept_id)
    if status:
        query += " AND c.status = ?"
        params.append(status)

    rows = db.execute(query, params).fetchall()
    db.close()

    pins = []
    for r in rows:
        # colour by status
        color = {'Registered': 'red', 'In Progress': 'yellow', 'Resolved': 'green'}.get(r['status'], 'red')
        pins.append({
            'id':        r['id'],
            'title':     r['title'],
            'desc':      (r['description'] or '')[:120],
            'status':    r['status'],
            'priority':  r['priority'],
            'area':      r['area'] or '',
            'dept':      r['dept_name'],
            'icon':      r['dept_icon'],
            'date':      r['created_at'][:10],
            'lat':       r['lat'],
            'lng':       r['lng'],
            'color':     color,
        })
    return jsonify(pins)

# ── PRINT RECEIPT ──────────────────────────────────────────────────────────────
@app.route('/citizen/complaints/<int:cid>/receipt')
@login_required
def complaint_receipt(cid):
    """Print-friendly receipt for a complaint."""
    db = get_db()
    uid  = session['user_id']
    role = session.get('role')

    if role == 'citizen':
        complaint = db.execute("""
            SELECT c.*, d.name as dept_name, d.icon as dept_icon,
                   u.name as citizen_name, u.email as citizen_email,
                   u.phone as citizen_phone, u.area as citizen_area
            FROM complaints c
            LEFT JOIN departments d ON c.dept_id = d.id
            LEFT JOIN users u ON c.citizen_id = u.id
            WHERE c.id=? AND c.citizen_id=?
        """, (cid, uid)).fetchone()
    else:
        complaint = db.execute("""
            SELECT c.*, d.name as dept_name, d.icon as dept_icon,
                   u.name as citizen_name, u.email as citizen_email,
                   u.phone as citizen_phone, u.area as citizen_area
            FROM complaints c
            LEFT JOIN departments d ON c.dept_id = d.id
            LEFT JOIN users u ON c.citizen_id = u.id
            WHERE c.id=?
        """, (cid,)).fetchone()

    if not complaint:
        flash('Complaint not found.', 'danger')
        return redirect(url_for('dashboard'))

    updates = db.execute("""
        SELECT cu.*, u.name as by_name, u.role as by_role
        FROM complaint_updates cu
        LEFT JOIN users u ON cu.updated_by = u.id
        WHERE cu.complaint_id=?
        ORDER BY cu.created_at ASC
    """, (cid,)).fetchall()
    db.close()
    return render_template('shared/receipt.html', complaint=complaint, updates=updates)

# ── OTP SYSTEM ────────────────────────────────────────────────────────────────
import random as _rand_mod
import time   as _time_mod

def _generate_otp():
    return str(_rand_mod.randint(100000, 999999))

def _send_otp_mock(phone, otp):
    """
    Mock OTP sender — prints to console.
    Replace this with Twilio / MSG91 / Fast2SMS for real SMS:

    Twilio example:
        from twilio.rest import Client
        client = Client(TWILIO_SID, TWILIO_TOKEN)
        client.messages.create(
            body=f'Your PS-CRM OTP is {otp}. Valid for 10 minutes.',
            from_='+1XXXXXXXXXX',
            to=f'+91{phone}'
        )
    """
    print(f"\n{'='*40}")
    print(f"📱 OTP for {phone}: {otp}")
    print(f"{'='*40}\n")
    return True

@app.route('/send-otp', methods=['POST'])
def send_otp():
    phone = request.form.get('phone', '').strip()
    if not phone or len(phone) != 10 or not phone.isdigit():
        return jsonify({'success': False, 'message': 'Enter a valid 10-digit phone number.'})

    db  = get_db()
    # Throttle: max 3 OTPs per phone per 10 minutes
    recent = db.execute("""
        SELECT COUNT(*) FROM otp_store
        WHERE phone=? AND used=0
          AND created_at > datetime('now', '-10 minutes')
    """, (phone,)).fetchone()[0]
    if recent >= 3:
        db.close()
        return jsonify({'success': False, 'message': 'Too many OTP requests. Please wait 10 minutes.'})

    otp = _generate_otp()
    db.execute("INSERT INTO otp_store (phone, otp) VALUES (?, ?)", (phone, otp))
    db.commit()
    db.close()

    _send_otp_mock(phone, otp)
    return jsonify({'success': True, 'message': f'OTP sent to {phone[:3]}XXXXXXX.'})

@app.route('/verify-otp', methods=['POST'])
def verify_otp():
    phone = request.form.get('phone', '').strip()
    otp   = request.form.get('otp', '').strip()

    db = get_db()
    record = db.execute("""
        SELECT id FROM otp_store
        WHERE phone=? AND otp=? AND used=0
          AND created_at > datetime('now', '-10 minutes')
        ORDER BY created_at DESC LIMIT 1
    """, (phone, otp)).fetchone()

    if not record:
        db.close()
        return jsonify({'success': False, 'message': 'Invalid or expired OTP. Please try again.'})

    # Mark used
    db.execute("UPDATE otp_store SET used=1 WHERE id=?", (record['id'],))
    db.commit()
    db.close()
    return jsonify({'success': True, 'message': 'Phone number verified ✅'})
