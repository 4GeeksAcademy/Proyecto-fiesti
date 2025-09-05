import enum
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import String, Boolean, Column, Table, ForeignKey, Integer, Enum, Time
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, relationship
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from typing import Optional

db = SQLAlchemy()


class RolEnum(enum.Enum):
    ORGANIZADOR = "organizador"
    PERSONAL = "personal"


class User(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(
        String(120), unique=True, nullable=False)
    role: Mapped[RolEnum] = mapped_column(Enum(RolEnum), nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    age: Mapped[int] = mapped_column(nullable=True)
    city: Mapped[str] = mapped_column(String(120), nullable=True)
    phone: Mapped[int] = mapped_column(unique=True, nullable=False)
    password: Mapped[str] = mapped_column(nullable=False)
    photo: Mapped[str] = mapped_column(String(255), nullable=True)
    horario: Mapped[str] = mapped_column(String(120), nullable=True)
    puesto: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    card_number: Mapped[Optional[str]] = mapped_column(
        String(16), nullable=True)
    card_cvc: Mapped[Optional[str]] = mapped_column(String(4), nullable=True)
    card_expiration: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True)
    card_holder: Mapped[Optional[str]] = mapped_column(
        String(120), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "email": self.email,
            "role": self.role.value,
            "name": self.name,
            "phone": self.phone,
            "photo": self.photo,
            "puesto": self.puesto,
            "horario": self.horario,
            "age": self.age,
            "city": self.city,
            "card_number": self.card_number,
            "card_expiration": self.card_expiration,
            "card_holder": self.card_holder
        }


class Actuacion(db.Model):
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    description: Mapped[str] = mapped_column(String(120), nullable=False)
    photo: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    horario: Mapped[Optional[str]] = mapped_column(String(120), nullable=True)
    escenario: Mapped[Optional[str]] = mapped_column(String(80), nullable=True)
    hora_inicio: Mapped[str] = mapped_column(String(120), nullable=True)
    hora_fin: Mapped[str] = mapped_column(String(120), nullable=True)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "photo": self.photo,
            "horario": self.horario,
            "escenario": self.escenario,
            "horaInicio": self.hora_inicio,
            "horaFin": self.hora_fin
        }
