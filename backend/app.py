from flask import Flask, request, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, date
import os
from dotenv import load_dotenv
load_dotenv()
from functools import wraps

app = Flask(__name__)
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///wishlist_santa.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SESSION_COOKIE_SAMESITE'] = 'None'
app.config['SESSION_COOKIE_SECURE'] = True

db = SQLAlchemy(app)
CORS(app, supports_credentials=True, origins=['https://wishlist-santa-1.onrender.com'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    age = db.Column(db.Integer, nullable=True)
    about = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    events = db.relationship('Event', backref='user', lazy=True, cascade='all, delete-orphan')
    reservations = db.relationship('Reservation', backref='user', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'name': self.name,
            'age': self.age,
            'about': self.about,
            'created_at': self.created_at.isoformat()
        }

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Event(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    date = db.Column(db.Date, nullable=False)
    description = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    wishes = db.relationship('Wish', backref='event', lazy=True, cascade='all, delete-orphan')

    def to_dict(self, include_wishes=False):
        result = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'date': self.date.isoformat(),
            'description': self.description,
            'created_at': self.created_at.isoformat()
        }
        
        if include_wishes:
            result['wishes'] = [wish.to_dict() for wish in self.wishes]
            
        return result


class Wish(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    event_id = db.Column(db.Integer, db.ForeignKey('event.id'), nullable=False)
    description = db.Column(db.Text, nullable=False)
    link = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    reservation = db.relationship('Reservation', backref='wish', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'event_id': self.event_id,
            'description': self.description,
            'link': self.link,
            'reserved': self.reservation is not None,
            'created_at': self.created_at.isoformat()
        }


class Reservation(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    wish_id = db.Column(db.Integer, db.ForeignKey('wish.id'), nullable=False, unique=True)
    reserved_by = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reserved_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'wish_id': self.wish_id,
            'reserved_by': self.reserved_by,
            'reserved_at': self.reserved_at.isoformat()
        }


def require_login(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'error': 'Login required'}), 401
        return f(*args, **kwargs)
    return decorated_function


def get_current_user():
    user_id = session.get('user_id')
    if user_id:
        return User.query.get(user_id)
    return None



def init_db():
    db.create_all()
    print("Database initialized!")


@app.route('/api/auth/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        required_fields = ['username', 'password', 'name']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        user = User(
            username=data['username'],
            name=data['name'],
            age=data.get('age'),
            about=data.get('about', '')
        )
        user.set_password(data['password'])
        
        db.session.add(user)
        db.session.commit()
        
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'Registration successful',
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'details': str(e)}), 500


@app.route('/api/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'error': 'Username and password are required'}), 400
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        session['user_id'] = user.id
        
        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Login failed', 'details': str(e)}), 500


@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.pop('user_id', None)
    return jsonify({'message': 'Logout successful'}), 200


@app.route('/api/auth/me', methods=['GET'])
@require_login
def get_current_user_info():
    user = get_current_user()
    return jsonify({'user': user.to_dict()}), 200


@app.route('/api/auth/check', methods=['GET'])
def check_auth():
    user = get_current_user()
    if user:
        return jsonify({'authenticated': True, 'user': user.to_dict()}), 200
    else:
        return jsonify({'authenticated': False}), 200


@app.route('/api/users', methods=['GET'])
def get_all_users():
    try:
        users = User.query.all()
        users_data = []
        
        for user in users:
            user_info = user.to_dict()
            user_info['event_count'] = len(user.events)
            users_data.append(user_info)
        
        return jsonify({'users': users_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch users', 'details': str(e)}), 500


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        events = Event.query.filter_by(user_id=user_id).all()
        events_data = []
        
        for event in events:
            event_data = event.to_dict(include_wishes=True)
            events_data.append(event_data)
        
        return jsonify({
            'user': user.to_dict(),
            'events': events_data
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch user profile', 'details': str(e)}), 500


@app.route('/api/users/profile', methods=['PUT'])
@require_login
def update_user_profile():
    try:
        user = get_current_user()
        data = request.get_json()
        
        if 'name' in data:
            user.name = data['name']
        if 'age' in data:
            user.age = data['age']
        if 'about' in data:
            user.about = data['about']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update profile', 'details': str(e)}), 500


@app.route('/api/events', methods=['GET'])
@require_login
def get_user_events():
    try:
        user = get_current_user()
        events = Event.query.filter_by(user_id=user.id).all()
        events_data = [event.to_dict(include_wishes=True) for event in events]
        
        return jsonify({'events': events_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch events', 'details': str(e)}), 500


@app.route('/api/events', methods=['POST'])
@require_login
def create_event():
    try:
        user = get_current_user()
        data = request.get_json()
        
        if not data.get('title') or not data.get('date'):
            return jsonify({'error': 'Title and date are required'}), 400
        
        try:
            event_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        event = Event(
            user_id=user.id,
            title=data['title'],
            date=event_date,
            description=data.get('description', '')
        )
        
        db.session.add(event)
        db.session.commit()
        
        return jsonify({
            'message': 'Event created successfully',
            'event': event.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to create event', 'details': str(e)}), 500


@app.route('/api/events/<int:event_id>', methods=['PUT'])
@require_login
def update_event(event_id):
    try:
        user = get_current_user()
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if event.user_id != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        data = request.get_json()
        
        if 'title' in data:
            event.title = data['title']
        if 'date' in data:
            try:
                event.date = datetime.strptime(data['date'], '%Y-%m-%d').date()
            except ValueError:
                return jsonify({'error': 'Invalid date format'}), 400
        if 'description' in data:
            event.description = data['description']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Event updated successfully',
            'event': event.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update event', 'details': str(e)}), 500


@app.route('/api/events/<int:event_id>', methods=['DELETE'])
@require_login
def delete_event(event_id):
    try:
        user = get_current_user()
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if event.user_id != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        db.session.delete(event)
        db.session.commit()
        
        return jsonify({'message': 'Event deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete event', 'details': str(e)}), 500


@app.route('/api/events/<int:event_id>/wishes', methods=['POST'])
@require_login
def add_wish(event_id):
    try:
        user = get_current_user()
        event = Event.query.get(event_id)
        
        if not event:
            return jsonify({'error': 'Event not found'}), 404
        
        if event.user_id != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        data = request.get_json()
        
        if not data.get('description'):
            return jsonify({'error': 'Description is required'}), 400
        
        wish = Wish(
            event_id=event_id,
            description=data['description'],
            link=data.get('link', '')
        )
        
        db.session.add(wish)
        db.session.commit()
        
        return jsonify({
            'message': 'Wish added successfully',
            'wish': wish.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to add wish', 'details': str(e)}), 500


@app.route('/api/wishes/<int:wish_id>', methods=['PUT'])
@require_login
def update_wish(wish_id):
    try:
        user = get_current_user()
        wish = Wish.query.get(wish_id)
        
        if not wish:
            return jsonify({'error': 'Wish not found'}), 404
        
        if wish.event.user_id != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        data = request.get_json()
        
        if 'description' in data:
            wish.description = data['description']
        if 'link' in data:
            wish.link = data['link']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Wish updated successfully',
            'wish': wish.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to update wish', 'details': str(e)}), 500


@app.route('/api/wishes/<int:wish_id>', methods=['DELETE'])
@require_login
def delete_wish(wish_id):
    try:
        user = get_current_user()
        wish = Wish.query.get(wish_id)
        
        if not wish:
            return jsonify({'error': 'Wish not found'}), 404
        
        if wish.event.user_id != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        db.session.delete(wish)
        db.session.commit()
        
        return jsonify({'message': 'Wish deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to delete wish', 'details': str(e)}), 500


@app.route('/api/wishes/<int:wish_id>/reserve', methods=['POST'])
@require_login
def reserve_wish(wish_id):
    try:
        user = get_current_user()
        wish = Wish.query.get(wish_id)
        
        if not wish:
            return jsonify({'error': 'Wish not found'}), 404
        
        if wish.event.user_id == user.id:
            return jsonify({'error': 'Cannot reserve your own wish'}), 400
        
        if wish.reservation:
            return jsonify({'error': 'Wish already reserved'}), 400
        
        reservation = Reservation(
            wish_id=wish_id,
            reserved_by=user.id
        )
        
        db.session.add(reservation)
        db.session.commit()
        
        return jsonify({
            'message': 'Wish reserved successfully',
            'wish': wish.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to reserve wish', 'details': str(e)}), 500


@app.route('/api/wishes/<int:wish_id>/unreserve', methods=['DELETE'])
@require_login
def unreserve_wish(wish_id):
    try:
        user = get_current_user()
        wish = Wish.query.get(wish_id)
        
        if not wish:
            return jsonify({'error': 'Wish not found'}), 404
        
        if not wish.reservation:
            return jsonify({'error': 'Wish is not reserved'}), 400
        
        if wish.reservation.reserved_by != user.id:
            return jsonify({'error': 'Not authorized'}), 403
        
        db.session.delete(wish.reservation)
        db.session.commit()
        
        return jsonify({
            'message': 'Wish unreserved successfully',
            'wish': wish.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Failed to unreserve wish', 'details': str(e)}), 500


@app.route('/api/my-reservations', methods=['GET'])
@require_login
def get_my_reservations():
    try:
        user = get_current_user()
        reservations = Reservation.query.filter_by(reserved_by=user.id).all()
        
        reservations_data = []
        for reservation in reservations:
            wish_data = reservation.wish.to_dict()
            event_data = reservation.wish.event.to_dict()
            user_data = reservation.wish.event.user.to_dict()
            
            reservations_data.append({
                'reservation': reservation.to_dict(),
                'wish': wish_data,
                'event': event_data,
                'event_owner': user_data
            })
        
        return jsonify({'reservations': reservations_data}), 200
        
    except Exception as e:
        return jsonify({'error': 'Failed to fetch reservations', 'details': str(e)}), 500


if __name__ == '__main__':
    if not os.path.exists('wishlist_santa.db'):
        with app.app_context():
            init_db()
    app.run(debug=True, host='0.0.0.0', port=5000)