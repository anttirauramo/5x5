import os
import json
import mysql.connector

API_KEY = os.environ.get('API_KEY', '')


def get_db_connection():
    return mysql.connector.connect(
        host='localhost',
        database=os.environ.get('DB_NAME', ''),
        user=os.environ.get('DB_USERNAME', ''),
        password=os.environ.get('DB_PASSWORD', ''),
    )


def read_request_body(environ):
    try:
        content_length = int(environ.get('CONTENT_LENGTH', 0))
    except (ValueError, TypeError):
        content_length = 0
    if content_length == 0:
        return {}
    body = environ['wsgi.input'].read(content_length)
    return json.loads(body.decode('utf-8'))


def check_api_key(environ):
    auth = environ.get('HTTP_X_API_KEY', '')
    return auth == API_KEY


def handle_status(environ):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute('SELECT VERSION()')
        version = cursor.fetchone()[0]
        cursor.close()
        conn.close()
        return '200 OK', json.dumps({'status': 'ok', 'db_version': version})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def handle_register(environ):
    if not check_api_key(environ):
        return '401 Unauthorized', json.dumps({'error': 'invalid api key'})

    try:
        data = read_request_body(environ)
        username = data.get('username', '').strip()

        if not username:
            return '400 Bad Request', json.dumps({'error': 'username is required'})

        if len(username) > 64:
            return '400 Bad Request', json.dumps({'error': 'username too long (max 64 characters)'})

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO users (username) VALUES (%s)',
            (username,)
        )
        conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        conn.close()

        return '201 Created', json.dumps({'id': user_id, 'username': username})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def route_request(environ):
    path = environ.get('PATH_INFO', '/')
    method = environ.get('REQUEST_METHOD', 'GET')

    if method == 'GET' and path == '/status':
        return handle_status(environ)
    if method == 'POST' and path == '/register':
        return handle_register(environ)

    return '404 Not Found', json.dumps({'error': 'not found'})


def backend(environ, start_response):
    status, body = route_request(environ)
    start_response(status, [('Content-Type', 'application/json')])
    return [body.encode()]
