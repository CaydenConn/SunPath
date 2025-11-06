# backend/routes/api.py
from flask import Blueprint, request, jsonify
from datetime import datetime
from firebase_admin import firestore

api_bp = Blueprint("api", __name__)
RECENTS_LIMIT = 10


def _require_uid():
    uid = request.headers.get("X-User-Id")
    if not uid:
        return None, (jsonify({"error": "Missing X-User-Id header"}), 400)
    return uid, None


@api_bp.route("/health", methods=["GET"])
def health():
    """Lightweight health endpoint to verify the blueprint is mounted."""
    return jsonify({"ok": True, "service": "api"})


@api_bp.route("/recents", methods=["GET"])
def get_recents():
    uid, err = _require_uid()
    if err:
        return err
    db = firestore.client()
    doc = db.collection("users").document(uid).get()
    data = doc.to_dict() or {}
    recents = data.get("recent_destinations", [])
    limit = request.args.get("limit", RECENTS_LIMIT, type=int)
    return jsonify(recents[:limit])


@api_bp.route("/recents", methods=["POST"])
def add_recent():
    uid, err = _require_uid()
    if err:
        return err

    body = request.get_json(silent=True) or {}
    required = ("label", "address", "lat", "lng")
    if any(k not in body for k in required):
        return jsonify({"error": "label, address, lat, lng are required"}), 400

    try:
        lat = float(body["lat"])
        lng = float(body["lng"])
    except (TypeError, ValueError):
        return jsonify({"error": "lat and lng must be numbers"}), 400

    entry = {
        "label": body["label"],
        "address": body["address"],
        "lat": lat,
        "lng": lng,
        "place_id": body.get("place_id"),
        "ts": datetime.utcnow().isoformat() + "Z",
    }

    db = firestore.client()
    user_ref = db.collection("users").document(uid)
    doc = user_ref.get()
    current = (doc.to_dict() or {}).get("recent_destinations", [])

    # de-dupe by place_id if present, otherwise by (label, lat, lng)
    def _key(x):
        return x.get("place_id") or (x.get("label"), x.get("lat"), x.get("lng"))

    merged = [entry] + [r for r in current if _key(r) != _key(entry)]
    user_ref.set({"recent_destinations": merged[:RECENTS_LIMIT]}, merge=True)
    return jsonify({"ok": True, "count": len(merged[:RECENTS_LIMIT])})


@api_bp.route("/recents", methods=["DELETE"])
def clear_recents():
    uid, err = _require_uid()
    if err:
        return err
    db = firestore.client()
    db.collection("users").document(uid).set({"recent_destinations": []}, merge=True)
    return jsonify({"ok": True})
