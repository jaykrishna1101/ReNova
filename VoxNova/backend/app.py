from flask import Flask, render_template, request, jsonify, Response, session, redirect, url_for
from flask_cors import CORS
import cv2
import os
import re
import json
import base64
import requests
import time
from werkzeug.utils import secure_filename
import threading

app = Flask(__name__, template_folder='../frontend/templates', static_folder='../frontend/static')
app.secret_key = 'your-secret-key-change-this-in-production'
CORS(app)

OPENROUTER_API_KEY = "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"
MODEL_ID = "google/gemini-2.0-flash-001"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
ITEMS_FILE = os.path.join(BASE_DIR, 'listed_items.json')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

if not os.path.exists(ITEMS_FILE):
    with open(ITEMS_FILE, 'w', encoding='utf-8') as f:
        json.dump([], f)

USERS = {
    'seller1': {'password': 'seller123', 'role': 'seller'},
    'seller2': {'password': 'seller123', 'role': 'seller'},
    'buyer1': {'password': 'buyer123', 'role': 'buyer'},
    'buyer2': {'password': 'buyer123', 'role': 'buyer'},
}

camera = None
camera_lock = threading.Lock()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def encode_image_to_base64(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

def scan_ewaste_api(image_path):
    base64_image = encode_image_to_base64(image_path)
    
    prompt = """
    Identify the e-waste item in this image. 
    Provide the output in JSON format with these exact keys:
    - product_name: Name of the device.
    - components: A list of main internal parts.
    - toxicity_level: High, Medium, or Low.
    - recyclable: Boolean (true/false).
    - harmful_substances: List of chemicals/metals present.
    """

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "http-referer": "http://localhost",
    }

    payload = {
        "model": MODEL_ID,
        "messages": [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{base64_image}"}}
                ]
            }
        ]
    }

    try:
        response = requests.post(
            url="https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=30
        )
        if response.status_code == 200:
            try:
                response_data = response.json()
                content = response_data['choices'][0]['message']['content']
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                else:
                    result = json.loads(content)
                
                if 'components' in result and not isinstance(result['components'], list):
                    if isinstance(result['components'], str):
                        result['components'] = [result['components']]
                    else:
                        result['components'] = []
                
                if 'harmful_substances' in result and not isinstance(result['harmful_substances'], list):
                    if isinstance(result['harmful_substances'], str):
                        result['harmful_substances'] = [result['harmful_substances']]
                    else:
                        result['harmful_substances'] = []
                
                if 'recyclable' in result:
                    if isinstance(result['recyclable'], str):
                        result['recyclable'] = result['recyclable'].lower() in ('true', 'yes', '1')
                    elif not isinstance(result['recyclable'], bool):
                        result['recyclable'] = False
                
                return result
            except (KeyError, IndexError, json.JSONDecodeError) as e:
                return {"error": f"Failed to parse API response: {str(e)}"}
        else:
            try:
                error_text = response.text
            except:
                error_text = "Unknown error"
            return {"error": f"API Error {response.status_code}: {error_text}"}
    except Exception as e:
        return {"error": str(e)}

def get_camera():
    global camera
    with camera_lock:
        if camera is None:
            try:
                if hasattr(cv2, 'CAP_DSHOW'):
                    camera = cv2.VideoCapture(0, cv2.CAP_DSHOW)
                else:
                    camera = cv2.VideoCapture(0)
            except Exception as e:
                try:
                    camera = cv2.VideoCapture(0)
                except Exception as e2:
                    raise RuntimeError(f"Could not open webcam: {str(e2)}")
            if not camera.isOpened():
                raise RuntimeError("Could not open webcam")
        return camera

def release_camera():
    global camera
    with camera_lock:
        if camera is not None:
            camera.release()
            camera = None

def load_listed_items():
    try:
        if os.path.exists(ITEMS_FILE):
            with open(ITEMS_FILE, 'r', encoding='utf-8') as f:
                data = json.load(f)
                if not isinstance(data, list):
                    return []
                return data
        return []
    except json.JSONDecodeError as e:
        print(f"Error: Corrupted JSON file. Resetting items file. {e}")
        try:
            with open(ITEMS_FILE, 'w', encoding='utf-8') as f:
                json.dump([], f)
        except:
            pass
        return []
    except Exception as e:
        print(f"Error loading items: {e}")
        return []

def save_listed_item(item_data):
    try:
        items = load_listed_items()
        new_item = item_data.copy()
        new_item['id'] = int(time.time() * 1000)
        new_item['listed_at'] = time.strftime('%Y-%m-%d %H:%M:%S')
        
        if 'recyclable' in new_item:
            if isinstance(new_item['recyclable'], str):
                new_item['recyclable'] = new_item['recyclable'].lower() in ('true', 'yes', '1')
            elif not isinstance(new_item['recyclable'], bool):
                new_item['recyclable'] = False
        
        items.append(new_item)
        with open(ITEMS_FILE, 'w', encoding='utf-8') as f:
            json.dump(items, f, indent=2, ensure_ascii=False)
        return True
    except Exception as e:
        print(f"Error saving item: {e}")
        return False

def generate_frames():
    cap = None
    try:
        cap = get_camera()
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            ret, buffer = cv2.imencode('.jpg', frame)
            if not ret:
                continue
            
            frame_bytes = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')
    except Exception as e:
        print(f"Error in generate_frames: {e}")
    finally:
        pass

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/logout')
def logout():
    release_camera()
    session.clear()
    return redirect(url_for('index'))

@app.route('/scanner')
def scanner():
    return render_template('scanner.html', username='User')

@app.route('/buyer-dashboard')
def buyer_dashboard():
    return render_template('buyer_dashboard.html', username='Recycler')

@app.route('/video_feed')
def video_feed():
    try:
        return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')
    except Exception as e:
        return f"Error accessing webcam: {str(e)}", 500

@app.route('/capture', methods=['POST'])
def capture():
    try:
        cap = get_camera()
        ret, frame = cap.read()
        if not ret:
            return jsonify({"error": "Failed to capture frame from webcam"}), 500
        
        filename = f"capture_{int(time.time())}.jpg"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        if not cv2.imwrite(filepath, frame):
            return jsonify({"error": "Failed to save captured image"}), 500
        
        result = scan_ewaste_api(filepath)
        
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass
        
        return jsonify(result)
    except RuntimeError as e:
        return jsonify({"error": f"Webcam error: {str(e)}"}), 500
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        result = scan_ewaste_api(filepath)
        
        if os.path.exists(filepath):
            os.remove(filepath)
        
        return jsonify(result)
    
    return jsonify({"error": "Invalid file type"}), 400

@app.route('/list-item', methods=['POST'])
def list_item():
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
        
        required_fields = ['product_name', 'toxicity_level', 'recyclable']
        for field in required_fields:
            if field not in data:
                return jsonify({"error": f"Missing required field: {field}"}), 400
        
        if save_listed_item(data):
            return jsonify({"success": True, "message": "Item listed successfully"}), 200
        else:
            return jsonify({"error": "Failed to save item"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/get-items', methods=['GET'])
def get_items():
    try:
        items = load_listed_items()
        return jsonify({"items": items}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/delete-item', methods=['POST'])
def delete_item():
    try:
        data = request.get_json()
        
        if not data or 'id' not in data:
            return jsonify({"error": "Item ID is required"}), 400
        
        item_id = data['id']
        items = load_listed_items()
        
        original_count = len(items)
        items = [item for item in items if item.get('id') != item_id]
        
        if len(items) == original_count:
            return jsonify({"error": "Item not found"}), 404
        
        try:
            with open(ITEMS_FILE, 'w', encoding='utf-8') as f:
                json.dump(items, f, indent=2, ensure_ascii=False)
            return jsonify({"success": True, "message": "Item deleted successfully"}), 200
        except Exception as e:
            print(f"Error saving items after deletion: {e}")
            return jsonify({"error": "Failed to save changes"}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    try:
        app.run(debug=True, host='0.0.0.0', port=5000, threaded=True)
    finally:
        release_camera()

