"""Conexão com o MongoDB.

Escolhi MongoDB aqui porque gastos e metas são documentos com formato
flexível (uma meta de carro tem campos diferentes de uma meta de video
game) — um caso clássico em que um banco de documentos brilha.
"""
import os

from pymongo import MongoClient

_cliente = MongoClient(os.getenv("MONGO_URL", "mongodb://localhost:27017"))
banco = _cliente[os.getenv("MONGO_DB", "metagrana")]

gastos = banco["gastos"]
metas = banco["metas"]
historico_precos = banco["historico_precos"]
