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


@api.route("/actuaciones/<int:act_id>/asignacion", methods=["PATCH"])
def asignar_actuacion(act_id):
    data = request.get_json() or {}

    escenario = (data.get("escenario") or "").strip() or None
    inicio_str = (data.get("horaInicio") or data.get(
        "hora_inicio") or "").strip()
    fin_str = (data.get("horaFin") or data.get("hora_fin") or "").strip()

    try:
        inicio = parse_time_or_none(inicio_str)
        fin = parse_time_or_none(fin_str)
    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    if inicio and fin and fin <= inicio:
        return jsonify({"msg": "La hora de fin debe ser posterior a la de inicio"}), 400

    act = Actuacion.query.get(act_id)
    if not act:
        return jsonify({"msg": "Actuación no encontrada"}), 404

    # Guardar asignación
    act.escenario = escenario
    act.hora_inicio = inicio
    act.hora_fin = fin

    # para ocultar la preferencia inicial una vez asignado:
    act.hour = None

    db.session.commit()
    return jsonify({"msg": "Asignación guardada", "actuacion": act.serialize()}), 200


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

# -------------------------------ENDPOINT PARA PAGO ORGANIZADOR----------------------------------
@api.route("/perfil/pago", methods=["POST"])
@jwt_required()
def perfil_pago():
    uid = get_jwt_identity()
    try:
        uid = int(uid)
    except (TypeError, ValueError):
        return jsonify({"msg": "Token inválido"}), 401

    user = User.query.get(uid)
    if not user:
        return jsonify({"msg": "No autorizado"}), 401

    if user.role != RolEnum.ORGANIZADOR:
        return jsonify({"msg": "Solo organizadores pueden pagar"}), 403

    data = request.get_json() or {}
    card_number = (data.get("card_number") or "").replace(" ", "")
    card_cvc = (data.get("card_cvc") or "").strip()
    card_expiration = (data.get("card_expiration") or "").strip() 
    card_holder = (data.get("card_holder") or "").strip()

    # Validaciones mínimas
    if not (card_number and card_cvc and card_expiration and card_holder):
        return jsonify({"msg": "Faltan datos de pago"}), 400

    if not card_number.isdigit() or not (12 <= len(card_number) <= 19):
        return jsonify({"msg": "Tarjeta inválida"}), 400

    if "/" not in card_expiration:
        return jsonify({"msg": "Fecha inválida, usa MM/AAAA"}), 400
    try:
        mm, yyyy = card_expiration.split("/")
        mm_i = int(mm)
        yyyy_i = int(yyyy)
        if mm_i < 1 or mm_i > 12 or yyyy_i < 2000:
            raise ValueError
    except Exception:
        return jsonify({"msg": "Fecha inválida, usa MM/AAAA"}), 400

    if not card_cvc.isdigit() or len(card_cvc) not in (3, 4):
        return jsonify({"msg": "CVC inválido"}), 400

    # Enmascarar número (guardamos solo últimos 4)
    masked = f"{'*' * (len(card_number) - 4)}{card_number[-4:]}"

    user.card_number = masked
    user.card_expiration = card_expiration
    user.card_holder = card_holder
    user.card_cvc = None  # nunca guardar CVC

    db.session.commit()

    return jsonify({
        "msg": "Pago registrado, ahora tienes el plan activo",
        "user": user.serialize()
    }), 200
