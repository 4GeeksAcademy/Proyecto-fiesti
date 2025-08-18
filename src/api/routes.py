"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
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


@api.route('/signup', method=[POST])
def signup():
    data = request.get_json() or []

    nombre = data.get("nombre")
    email = data.get("email")
    password = data.get("password")
    telefono = data.get("telefono")

    # compruebo que todos los campos esten rellenos
    if not nombre or not email or not password:
        return jsonify({"msg": "Faltan campos obligatorios: nombre, email, password"}), 400

    # compruebo usuarios duplicados
    existente = User.query.filter_by(email=email).first()
    if existente:
        return jsonify({"msg": "El email ya está registrado"}), 400

    hashed = generate_password_hash(password)

    nuevo = User(
        nombre=nombre,
        email=email,
        password=hashed,
        telefono=telefono,
        rol="user",
        is_active=True
    )
    db.session.add(nuevo)
    db.session.commit()

    return jsonify({
        "msg": "Usuario creado con éxito",
        "user": nuevo.serialize()
    }), 201


@api.route('/users', methods=['GET'])
def list_users():
    users = User.query.all()
    return jsonify([u.serialize() for u in users]), 200
