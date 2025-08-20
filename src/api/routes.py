"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, RolEnum
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200


@api.route('/signup', methods=['POST'])
def signup():
    """
    Registro de usuarios (personal u organizador).
    Recibe JSON: { email, password, name, phone, role, photo? }
    """
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    name = (data.get("name") or "").strip()
    phone = data.get("phone")
    role_str = (data.get("role") or "personal").lower()
    photo = data.get("photo")

    # compruebo que esten todos los campos rellenos, no exista el email y el rol
    if not email or not password or not name or not phone:
        return jsonify({"msg": "Faltan campos obligatorios"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"msg": "El email ya está registrado"}), 400

    try:
        role = RolEnum.ORGANIZADOR if role_str == "organizador" else RolEnum.PERSONAL
    except ValueError:
        return jsonify({"msg": "Rol inválido"}), 400

    hashed = generate_password_hash(password)

    nuevo = User(
        email=email,
        password=hashed,
        name=name,
        phone=phone,
        role=role,
        photo=photo
    )
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"msg": "Usuario creado con éxito", "user": nuevo.serialize()}), 201


@api.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200
