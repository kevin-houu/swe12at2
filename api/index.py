import os
import sqlite3
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import (
    JWTManager, create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, set_access_cookies,
    set_refresh_cookies, unset_jwt_cookies
)
from dotenv import load_dotenv
from datetime import timedelta
from flask_cors import CORS

load_dotenv()

app = Flask(__name__)

CORS(app, 
     supports_credentials=True,
     resources={
         r"/api/*": {
             "origins": ["http://localhost:3000"],
             "methods": ["GET", "POST", "OPTIONS"],
             "allow_headers": ["Content-Type"],
             "expose_headers": ["Set-Cookie"],
         }
     })

app.config['ADMIN_SECRET'] = os.getenv('ADMIN_SECRET')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=1)
app.config['JWT_REFRESH_TOKEN_EXPIRES'] = timedelta(days=30)
app.config['JWT_COOKIE_SECURE'] = True
app.config['JWT_COOKIE_CSRF_PROTECT'] = False
app.config['JWT_COOKIE_SAMESITE'] = 'Strict'
app.config['DATABASE'] = os.path.join(os.getcwd(), 'jyra.db')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_ACCESS_COOKIE_PATH'] = '/api/'
app.config['JWT_REFRESH_COOKIE_PATH'] = '/api/refresh'

jwt = JWTManager(app)

class ApiResponse:
    @staticmethod
    def success(message: str, body: Optional[Any] = None, status_code: int = 200) -> tuple:
        response = {"message": message}
        if body is not None:
            response["body"] = body
        return jsonify(response), status_code

    @staticmethod
    def error(message: str, status_code: int = 400) -> tuple:
        return jsonify({"error": message}), status_code


def get_db():
    """ Return a new database connection. """
    db = sqlite3.connect(app.config['DATABASE'])
    db.row_factory = sqlite3.Row
    return db


def init_db():
    """ Initializes the database and creates tables if they do not exist. """
    db = get_db()
    cursor = db.cursor()

    cursor.execute('''CREATE TABLE IF NOT EXISTS workplaces
                      (id INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS users
                      (id INTEGER PRIMARY KEY AUTOINCREMENT,
                       name TEXT NOT NULL,
                       email TEXT UNIQUE NOT NULL,
                       password TEXT NOT NULL,
                       is_admin INTEGER DEFAULT 0,
                       workplace_id INTEGER,
                       FOREIGN KEY (workplace_id) REFERENCES workplaces (id))''')

    cursor.execute('''CREATE TABLE IF NOT EXISTS tickets
                      (id INTEGER PRIMARY KEY AUTOINCREMENT,
                       title TEXT NOT NULL,
                       description TEXT NOT NULL,
                       status TEXT NOT NULL,
                       priority TEXT NOT NULL,
                       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                       owner_id INTEGER,
                       workplace_id INTEGER,
                       FOREIGN KEY (owner_id) REFERENCES users (id),
                       FOREIGN KEY (workplace_id) REFERENCES workplaces (id))''')

    db.commit()
    db.close()


@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    admin_secret = data.get('adminSecret')

    if not email or not password:
        return ApiResponse.error("Email and password are required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    if cursor.fetchone():
        db.close()
        return ApiResponse.error("Email already registered")

    try:
        hashed_password = generate_password_hash(password)
        
        cursor.execute("INSERT INTO workplaces (name) VALUES (?)", (f"{email}'s workspace",))
        workplace_id = cursor.lastrowid

        is_admin = 1 if admin_secret == app.config['ADMIN_SECRET'] else 0
        
        cursor.execute("""
            INSERT INTO users (name, email, password, is_admin, workplace_id)
            VALUES (?, ?, ?, ?, ?)
        """, (email.split('@')[0], email, hashed_password, is_admin, workplace_id))
        user_id = cursor.lastrowid

        db.commit()
        db.close()

        access_token = create_access_token(identity=str(user_id))
        refresh_token = create_refresh_token(identity=str(user_id))

        user_data = {
            "id": user_id,
            "email": email,
            "is_admin": bool(is_admin)
        }
        
        response = ApiResponse.success(
            message="User created successfully",
            body={"user": user_data},
            status_code=201
        )[0]

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response, 201

    except Exception as e:
        db.close()
        return ApiResponse.error(f"Failed to create user: {str(e)}", 500)


@app.route('/api/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return ApiResponse.error("Email and password are required")

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    db.close()

    if not user:
        return ApiResponse.error("Invalid email or password", 401)

    if check_password_hash(user['password'], password):
        access_token = create_access_token(identity=str(user['id']))
        refresh_token = create_refresh_token(identity=str(user['id']))

        user_data = {
            "id": user['id'],
            "email": user['email'],
            "is_admin": bool(user['is_admin'])
        }

        response = ApiResponse.success(
            message="Login successful",
            body={"user": user_data}
        )[0]

        set_access_cookies(response, access_token)
        set_refresh_cookies(response, refresh_token)
        
        return response, 200
    
    return ApiResponse.error("Invalid email or password", 401)


@app.route('/api/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    try:
        current_user_id = get_jwt_identity()
        access_token = create_access_token(identity=str(current_user_id))
        
        response = ApiResponse.success("Token refreshed successfully")[0]
        set_access_cookies(response, access_token)
        
        return response, 200
    except Exception as e:
        return ApiResponse.error("Token refresh failed", 401)


@app.route('/api/signout', methods=['POST'])
def signout():
    response = ApiResponse.success("Logged out successfully")[0]
    unset_jwt_cookies(response)
    return response, 200


@app.route('/api/user', methods=['GET'])
@jwt_required()
def get_user():
    try:
        current_user_id = get_jwt_identity()
        
        db = get_db()
        cursor = db.cursor()

        cursor.execute("""
            SELECT id, name, email, is_admin, workplace_id 
            FROM users WHERE id = ?
        """, (current_user_id,))
        user = cursor.fetchone()

        db.close()

        if user:
            user_data = {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "is_admin": bool(user['is_admin']),
                "workplace_id": user['workplace_id']
            }
            return ApiResponse.success("User retrieved successfully", user_data)
        
        return ApiResponse.error("User not found", 404)
    except Exception as e:
        return ApiResponse.error(f"Failed to retrieve user: {str(e)}", 500)


if __name__ == '__main__':
    init_db()
    app.run(debug=True)
