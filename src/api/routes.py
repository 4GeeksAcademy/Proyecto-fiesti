"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, RolEnum, Actuacion
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from datetime import datetime
from sqlalchemy import select
import os
from werkzeug.utils import secure_filename

api = Blueprint('api', __name__)

# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['GET'])
def hello():
    return jsonify({"message": "Hola desde el backend"}), 200


@api.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password")

    if not email or not password:
        return jsonify({"msg": "Email y contraseña son requeridos"}), 400

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"msg": "Contraseña incorrecta"}), 401

    # token con la identidad mínima (id del user)
    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "msg": "Login correcto",
        "access_token": access_token,
        "user": user.serialize()
    }), 200


@api.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    print(get_jwt_identity())
    if not user:
        return jsonify({"msg": "Usuario no encontrado"}), 404
    return jsonify({
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value
    })


@api.route('/signup', methods=['POST'])
def signup():
    """
    Registro de usuarios (personal u organizador).
    Recibe JSON: { email, password, name, phone, role, photo?, ... }
    """
    data = request.get_json() or {}

    email = (data.get("email") or "").strip().lower()
    password = data.get("password")
    name = (data.get("name") or "").strip()
    phone = data.get("phone")
    role_str = (data.get("role") or "personal").lower()
    photo = data.get("photo")
    puesto = data.get("puesto")
    card_number = data.get("card_number")
    card_cvc = data.get("card_cvc")
    card_expiration = data.get("card_expiration")
    card_holder = data.get("card_holder")

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
        photo=photo,
        puesto=puesto if role == RolEnum.PERSONAL else None,
        card_number=card_number if role == RolEnum.ORGANIZADOR else None,
        card_cvc=card_cvc if role == RolEnum.ORGANIZADOR else None,
        card_expiration=card_expiration if role == RolEnum.ORGANIZADOR else None,
        card_holder=card_holder if role == RolEnum.ORGANIZADOR else None
    )
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({"msg": "Usuario creado con éxito", "user": nuevo.serialize()}), 201


@api.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200


@api.route("/actuaciones", methods=["GET"])
def list_actuaciones():
    acts = Actuacion.query.order_by(Actuacion.name.asc()).all()
    return jsonify([a.serialize() for a in acts]), 200


@api.route("/actuaciones/<int:act_id>", methods=["GET"])
def get_actuacion(act_id):
    act = Actuacion.query.get(act_id)
    if not act:
        return jsonify({"msg": "Actuación no encontrada"}), 404
    return jsonify(act.serialize()), 200


def parse_time_or_none(value: str | None):
    if not value:
        return None
    value = value.strip()
    try:
        return datetime.strptime(value, "%H:%M").time()
    except ValueError:
        raise ValueError("Formato de hora inválido. Usa HH:MM")


@api.route("/actuaciones", methods=["POST"])
def create_actuacion():
    data = request.get_json() or {}

    name = (data.get("name") or "").strip()
    description = (data.get("description") or "").strip()
    photo = (data.get("photo") or None)
    hour_str = (data.get("hour") or "").strip()

    if not name or not description:
        return jsonify({"msg": "Faltan campos obligatorios (name, description)"}), 400

    try:
        hour_val = parse_time_or_none(hour_str)
    except ValueError:
        return jsonify({"msg": "Formato de hora inválido. Usa HH:MM"}), 400

    act = Actuacion(
        name=name,
        description=description,
        photo=photo or None,
        hour=hour_val
    )
    db.session.add(act)
    db.session.commit()

    return jsonify({"msg": "Actuación creada", "actuacion": act.serialize()}), 201


@api.route("/actuaciones/<int:act_id>", methods=["DELETE"])
def delete_actuacion(act_id):
    act = Actuacion.query.get(act_id)
    if not act:
        return jsonify({"msg": "Actuación no encontrada"}), 404

    db.session.delete(act)
    db.session.commit()
    return jsonify({"msg": "Actuación eliminada"}), 200


@api.route('/users/personal', methods=['GET'])
def get_personal_users():

    try:
        users = User.query.filter_by(role=RolEnum.PERSONAL).all()
        return jsonify([user.serialize() for user in users]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# -------------------------------ENDPOINTS DE PERFIL----------------------------------

@api.route("/perfil", methods=["GET"])
@jwt_required()
def perfil():
    current_user_id = get_jwt_identity()
    query_user = db.session.execute(
        select(User).where(User.id == int(current_user_id))
    ).scalar_one_or_none()

    if not query_user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    return jsonify({"user": query_user.serialize()}), 200


@api.route("/perfil", methods=["PUT"])
@jwt_required()
def put_perfil():
    current_user_id = get_jwt_identity()
    data = request.get_json() or {}

    query_user = db.session.execute(
        select(User).where(User.id == int(current_user_id))
    ).scalar_one_or_none()

    if not query_user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    # Actualiza solo los campos que vienen en el JSON
    for field in ["email", "name", "phone", "age", "city", "photo", "puesto", "card_number", "card_cvc", "card_expiration", "card_holder"]:
        if field in data:
            setattr(query_user, field, data[field])

    db.session.commit()

    return jsonify({"msg": "Perfil actualizado", "user": query_user.serialize()}), 200


@api.route("/perfil/photo", methods=["PUT"])
@jwt_required()
def upload_profile_photo():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    if not user:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()
    photo_url = data.get("photo")

    if not photo_url:
        return jsonify({"error": "No se recibió la URL de la foto"}), 400

    # Guardamos directamente la URL de Cloudinary en la DB
    user.photo = photo_url
    db.session.commit()

    return jsonify({
        "msg": "Foto de perfil actualizada correctamente",
        "user": user.serialize() 
    }), 200
