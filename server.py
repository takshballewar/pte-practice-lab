import http.server
import socketserver
import os
import sqlite3
import urllib.parse

# Determine database path (use persistent disk path on Render if available)
DB_PATH = '/data/database.db' if os.path.exists('/data') else 'database.db'

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS accounts (
            email TEXT PRIMARY KEY,
            name TEXT,
            password TEXT,
            avatar TEXT,
            progress TEXT
        )
    ''')
    # Seed default user if not present
    cursor.execute("SELECT 1 FROM accounts WHERE email = ?", ('vivek@example.com',))
    if not cursor.fetchone():
        import json
        default_progress = {
            "streak": 0,
            "points": 0,
            "targetScore": 79,
            "targetSpeaking": 79,
            "targetWriting": 79,
            "targetReading": 79,
            "targetListening": 79,
            "examDate": "2026-07",
            "scoreHistory": [],
            "completedTasks": [],
            "unclearedTasks": [],
            "tutorHistory": [
                { "sender": "tutor", "text": "Welcome to Aspire, Vivek! I'm your AI PTE trainer. Let's start practicing to hit your target of PTE 79!", "time": "12:00 PM" }
            ]
        }
        cursor.execute('''
            INSERT INTO accounts (email, name, password, avatar, progress)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            'vivek@example.com',
            'Vivek Ballewar',
            'password',
            None,
            json.dumps(default_progress)
        ))
    conn.commit()
    conn.close()

PORT = int(os.environ.get('PORT', 8081))

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def send_head(self):
        # Strip conditional request headers to prevent 304 Not Modified responses
        if 'If-Modified-Since' in self.headers:
            del self.headers['If-Modified-Since']
        if 'If-None-Match' in self.headers:
            del self.headers['If-None-Match']
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/accounts':
            self.handle_get_accounts()
        else:
            super().do_GET()

    def do_POST(self):
        parsed_url = urllib.parse.urlparse(self.path)
        if parsed_url.path == '/api/create-checkout-session':
            self.handle_create_checkout_session()
        elif parsed_url.path == '/api/razorpay/create-order':
            self.handle_razorpay_create_order()
        elif parsed_url.path == '/api/razorpay/verify-payment':
            self.handle_razorpay_verify_payment()
        elif parsed_url.path == '/api/accounts/save':
            self.handle_save_account()
        else:
            self.send_error(404, "Not Found")

    def handle_create_checkout_session(self):
        import json
        import urllib.request
        import urllib.parse
        import urllib.error
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            price_id = data.get('priceId')
            plan = data.get('plan')
            cycle = data.get('cycle')
            
            if not price_id:
                self.send_json_response(400, {"error": "Missing priceId"})
                return
                
            # Get secret key from header, env, or .env file
            secret_key = self.headers.get('x-stripe-secret-key')
            if not secret_key or secret_key.strip() == "":
                secret_key = os.environ.get('STRIPE_SECRET_KEY')
            if not secret_key or secret_key.strip() == "":
                try:
                    if os.path.exists('.env'):
                        with open('.env') as f:
                            for line in f:
                                if line.startswith('STRIPE_SECRET_KEY='):
                                    secret_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                except Exception:
                    pass
                    
            if not secret_key or secret_key.strip() == "":
                self.send_json_response(400, {
                    "error": "Missing Stripe Secret Key. Please configure it in your settings or .env file."
                })
                return
                
            # Call Stripe API
            origin = self.headers.get('Origin')
            if not origin:
                origin = f"http://{self.headers.get('Host', 'localhost:8081')}"
                
            payload = {
                'success_url': f"{origin}/#payment-success?plan={plan}&cycle={cycle}",
                'cancel_url': f"{origin}/#payment-cancel",
                'line_items[0][price]': price_id,
                'line_items[0][quantity]': '1',
                'mode': 'subscription'
            }
            
            req_data = urllib.parse.urlencode(payload).encode('utf-8')
            req = urllib.request.Request(
                'https://api.stripe.com/v1/checkout/sessions',
                data=req_data,
                headers={
                    'Authorization': f'Bearer {secret_key}',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                method='POST'
            )
            
            with urllib.request.urlopen(req) as response:
                resp_data = json.loads(response.read().decode('utf-8'))
                checkout_url = resp_data.get('url')
                self.send_json_response(200, {"url": checkout_url})
                
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            try:
                err_json = json.loads(err_msg)
                stripe_err = err_json.get('error', {}).get('message', 'Stripe API Error')
            except Exception:
                stripe_err = err_msg
            self.send_json_response(400, {"error": stripe_err})
        except Exception as e:
            self.send_json_response(500, {"error": str(e)})

    def handle_razorpay_create_order(self):
        import json
        import urllib.request
        import urllib.parse
        import urllib.error
        import base64
        import time
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            amount = data.get('amount')
            plan = data.get('plan')
            cycle = data.get('cycle')
            
            if not amount:
                self.send_json_response(400, {"error": "Missing amount"})
                return
                
            # Get key ID and secret key
            key_id = self.headers.get('x-razorpay-key-id')
            if not key_id or key_id.strip() == "":
                key_id = os.environ.get('RAZORPAY_KEY_ID')
            if not key_id or key_id.strip() == "":
                try:
                    if os.path.exists('.env'):
                        with open('.env') as f:
                            for line in f:
                                if line.startswith('RAZORPAY_KEY_ID='):
                                    key_id = line.split('=', 1)[1].strip().strip('"').strip("'")
                except Exception: pass
            
            secret_key = self.headers.get('x-razorpay-secret-key')
            if not secret_key or secret_key.strip() == "":
                secret_key = os.environ.get('RAZORPAY_SECRET_KEY')
            if not secret_key or secret_key.strip() == "":
                try:
                    if os.path.exists('.env'):
                        with open('.env') as f:
                            for line in f:
                                if line.startswith('RAZORPAY_SECRET_KEY='):
                                    secret_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                except Exception: pass
                    
            if not key_id or not secret_key:
                self.send_json_response(400, {
                    "error": "Missing Razorpay Credentials. Please check settings or .env file."
                })
                return
                
            # Call Razorpay API to create an order
            auth_str = f"{key_id}:{secret_key}"
            auth_bytes = auth_str.encode('utf-8')
            auth_b64 = base64.b64encode(auth_bytes).decode('utf-8')
            
            payload = {
                'amount': int(amount * 100), # in paise
                'currency': 'INR',
                'receipt': f"receipt_{plan}_{cycle}_{int(time.time())}"
            }
            req_data = json.dumps(payload).encode('utf-8')
            
            req = urllib.request.Request(
                'https://api.razorpay.com/v1/orders',
                data=req_data,
                headers={
                    'Authorization': f'Basic {auth_b64}',
                    'Content-Type': 'application/json'
                },
                method='POST'
            )
            
            with urllib.request.urlopen(req) as response:
                resp_data = json.loads(response.read().decode('utf-8'))
                self.send_json_response(200, resp_data)
                
        except urllib.error.HTTPError as e:
            err_msg = e.read().decode('utf-8')
            try:
                err_json = json.loads(err_msg)
                stripe_err = err_json.get('error', {}).get('description', 'Razorpay API Error')
            except Exception:
                stripe_err = err_msg
            self.send_json_response(400, {"error": stripe_err})
        except Exception as e:
            self.send_json_response(500, {"error": str(e)})

    def handle_razorpay_verify_payment(self):
        import json
        import hmac
        import hashlib
        
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            data = json.loads(body) if body else {}
            
            order_id = data.get('razorpay_order_id')
            payment_id = data.get('razorpay_payment_id')
            signature = data.get('razorpay_signature')
            
            if not order_id or not payment_id or not signature:
                self.send_json_response(400, {"error": "Missing signature verification details"})
                return
                
            secret_key = self.headers.get('x-razorpay-secret-key')
            if not secret_key or secret_key.strip() == "":
                secret_key = os.environ.get('RAZORPAY_SECRET_KEY')
            if not secret_key or secret_key.strip() == "":
                try:
                    if os.path.exists('.env'):
                        with open('.env') as f:
                            for line in f:
                                if line.startswith('RAZORPAY_SECRET_KEY='):
                                    secret_key = line.split('=', 1)[1].strip().strip('"').strip("'")
                except Exception: pass
                
            if not secret_key:
                self.send_json_response(400, {"error": "Missing Secret Key for signature verification"})
                return
                
            # Compute signature: order_id + "|" + payment_id
            msg = f"{order_id}|{payment_id}"
            generated_signature = hmac.new(
                secret_key.encode('utf-8'),
                msg.encode('utf-8'),
                hashlib.sha256
            ).hexdigest()
            
            if hmac.compare_digest(generated_signature, signature):
                self.send_json_response(200, {"status": "ok"})
            else:
                self.send_json_response(400, {"error": "Signature verification failed"})
                
        except Exception as e:
            self.send_json_response(500, {"error": str(e)})

    def handle_get_accounts(self):
        import json
        import sqlite3
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute("SELECT email, name, password, avatar, progress FROM accounts")
            rows = cursor.fetchall()
            accounts = []
            for row in rows:
                progress_val = None
                if row[4]:
                    try:
                        progress_val = json.loads(row[4])
                    except Exception:
                        progress_val = row[4]
                accounts.append({
                    "email": row[0],
                    "name": row[1],
                    "password": row[2],
                    "avatar": row[3],
                    "progress": progress_val
                })
            conn.close()
            self.send_json_response(200, accounts)
        except Exception as e:
            self.send_json_response(500, {"error": str(e)})

    def handle_save_account(self):
        import json
        import sqlite3
        try:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            account = json.loads(body) if body else {}
            
            email = account.get('email')
            name = account.get('name')
            password = account.get('password')
            avatar = account.get('avatar')
            progress = account.get('progress')
            
            if not email:
                self.send_json_response(400, {"error": "Missing email"})
                return
                
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Serialize progress if it's a dict or list
            progress_str = json.dumps(progress) if isinstance(progress, (dict, list)) else progress
            
            cursor.execute("SELECT 1 FROM accounts WHERE email = ?", (email,))
            if cursor.fetchone():
                cursor.execute('''
                    UPDATE accounts
                    SET name = ?, password = ?, avatar = ?, progress = ?
                    WHERE email = ?
                ''', (name, password, avatar, progress_str, email))
            else:
                cursor.execute('''
                    INSERT INTO accounts (email, name, password, avatar, progress)
                    VALUES (?, ?, ?, ?, ?)
                ''', (email, name, password, avatar, progress_str))
            
            conn.commit()
            conn.close()
            self.send_json_response(200, {"status": "success"})
        except Exception as e:
            self.send_json_response(500, {"error": str(e)})

    def send_json_response(self, status, data):
        import json
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))

if __name__ == '__main__':
    # Ensure we serve the directory where this script is located
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    # Initialize the SQLite database
    init_db()
    # Allow port reuse to avoid 'Address already in use' errors
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
        print(f"Serving at port {PORT} with no-cache headers")
        httpd.serve_forever()
