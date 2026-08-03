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


def handle_completions(environ):
    if not check_api_key(environ):
        return '401 Unauthorized', json.dumps({'error': 'invalid api key'})

    try:
        data = read_request_body(environ)
        user_id = data.get('user_id')
        completions = data.get('completions', [])

        if not user_id:
            return '400 Bad Request', json.dumps({'error': 'user_id is required'})

        if not completions or not isinstance(completions, list):
            return '400 Bad Request', json.dumps({'error': 'completions array is required'})

        conn = get_db_connection()
        cursor = conn.cursor()

        inserted = 0
        for completion in completions:
            grid = completion.get('grid', '')
            wordlist = completion.get('wordlist', '')

            if not grid or not wordlist:
                continue

            if len(grid) > 64 or len(wordlist) > 64:
                continue

            # Skip duplicates
            cursor.execute(
                'SELECT id FROM completions WHERE user_id = %s AND grid = %s AND wordlist = %s',
                (user_id, grid, wordlist)
            )
            if cursor.fetchone():
                continue

            cursor.execute(
                'INSERT INTO completions (user_id, grid, wordlist) VALUES (%s, %s, %s)',
                (user_id, grid, wordlist)
            )
            inserted += 1

        conn.commit()
        cursor.close()
        conn.close()

        return '201 Created', json.dumps({'inserted': inserted})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def handle_initiation(environ):
    if not check_api_key(environ):
        return '401 Unauthorized', json.dumps({'error': 'invalid api key'})

    try:
        data = read_request_body(environ)
        user_id = data.get('user_id')  # nullable
        wordlist = data.get('wordlist', '').strip()

        if not wordlist:
            return '400 Bad Request', json.dumps({'error': 'wordlist is required'})

        if len(wordlist) > 64:
            return '400 Bad Request', json.dumps({'error': 'wordlist too long'})

        conn = get_db_connection()
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO initiations (user_id, wordlist) VALUES (%s, %s)',
            (user_id, wordlist)
        )
        conn.commit()
        cursor.close()
        conn.close()

        return '201 Created', json.dumps({'status': 'ok'})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def handle_user_status(environ):
    if not check_api_key(environ):
        return '401 Unauthorized', json.dumps({'error': 'invalid api key'})

    try:
        query_string = environ.get('QUERY_STRING', '')
        params = dict(p.split('=', 1) for p in query_string.split('&') if '=' in p)
        user_id = params.get('user_id', '').strip()

        if not user_id:
            return '400 Bad Request', json.dumps({'error': 'user_id query parameter is required'})

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute('SELECT id, username FROM users WHERE id = %s', (user_id,))
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if user:
            return '200 OK', json.dumps({'exists': True, 'id': user['id'], 'username': user['username']})
        else:
            return '200 OK', json.dumps({'exists': False})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def handle_highscores(environ):
    if not check_api_key(environ):
        return '401 Unauthorized', json.dumps({'error': 'invalid api key'})

    try:
        # Get wordlist from query string
        query_string = environ.get('QUERY_STRING', '')
        params = dict(p.split('=', 1) for p in query_string.split('&') if '=' in p)
        wordlist = params.get('wordlist', '').strip()

        if not wordlist:
            return '400 Bad Request', json.dumps({'error': 'wordlist query parameter is required'})

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get top 10 solvers for this wordlist
        cursor.execute('''
            SELECT u.id as user_id, u.username, COUNT(c.id) as score
            FROM users u
            JOIN completions c ON c.user_id = u.id
            WHERE c.wordlist = %s
            GROUP BY u.id, u.username
            ORDER BY score DESC
            LIMIT 10
        ''', (wordlist,))
        top_ten = cursor.fetchall()

        cursor.close()
        conn.close()

        return '200 OK', json.dumps({'highscores': top_ten})
    except Exception as e:
        return '500 Internal Server Error', json.dumps({'status': 'error', 'message': str(e)})


def route_request(environ):
    path = environ.get('PATH_INFO', '/')
    method = environ.get('REQUEST_METHOD', 'GET')

    if method == 'GET' and path == '/v0.4/status':
        return handle_status(environ)
    if method == 'GET' and path == '/v0.4/user_status':
        return handle_user_status(environ)
    if method == 'GET' and path == '/v0.4/highscores':
        return handle_highscores(environ)
    if method == 'POST' and path == '/v0.4/register':
        return handle_register(environ)
    if method == 'POST' and path == '/v0.4/completions':
        return handle_completions(environ)
    if method == 'POST' and path == '/v0.4/initiation':
        return handle_initiation(environ)

    return '404 Not Found', json.dumps({'error': 'not found'})


def backend(environ, start_response):
    status, body = route_request(environ)
    start_response(status, [('Content-Type', 'application/json')])
    return [body.encode()]
