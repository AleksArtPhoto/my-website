from flask import Flask, request, jsonify
import json
import datetime

app = Flask(__name__)
DATA_FILE = "bookings.json"

def load_bookings():
    try:
        with open(DATA_FILE, "r") as f:
            return json.load(f)
    except:
        return []

def save_bookings(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.route("/book", methods=["POST"])
def book_slot():
    data = request.get_json()
    bookings = load_bookings()
    bookings.append(data)
    save_bookings(bookings)
    return jsonify({"status": "ok", "message": "Бронирование сохранено!"})

@app.route("/bookings", methods=["GET"])
def get_bookings():
    return jsonify(load_bookings())

if __name__ == "__main__":
    app.run(debug=True)
