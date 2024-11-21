from flask import Flask, render_template, request, jsonify
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)

# Rotas HTML
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/formulario')
def formulario():
    return render_template('formulario.html')

@app.route('/integrantes')
def integrantes():
    return render_template('integrantes.html')

@app.route('/administrador')
def administrador():
    return render_template('administrador.html')


# Função para conectar/criar banco de dados
def conectar_banco():
    db_file = 'formulario.db'  # Banco de dados consistente
    db_exists = os.path.exists(db_file)
    conn = sqlite3.connect(db_file)
    conn.row_factory = sqlite3.Row  # Retorna resultados como dicionários
    cursor = conn.cursor()
    if not db_exists:
        cursor.execute('''CREATE TABLE formulario (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user TEXT NOT NULL,
            telefone TEXT NOT NULL,
            email TEXT NOT NULL,
            jogo TEXT NOT NULL,
            plataforma TEXT NOT NULL,
            link TEXT NOT NULL
        )''')
        print("Tabela 'formulario' criada com sucesso.")
        conn.commit()
    return conn


@app.route('/api/formulario', methods=['GET'])
def consultar_formulario():
    try:
        con = conectar_banco()
        cur = con.cursor()
        cur.execute("SELECT * FROM formulario")  # Usando 'formulario.db'
        formulario = [dict(row) for row in cur.fetchall()]  # Converte resultados para dicionários
        con.close()
        return jsonify(formulario), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao consultar formulário: {str(e)}"}), 500


@app.route('/api/formulario', methods=['POST'])
def adicionar_inscrito():
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser 'application/json'"}), 415

        dados = request.get_json()
        con = conectar_banco()
        cur = con.cursor()
        cur.execute(""" 
            INSERT INTO formulario (user, telefone, email, jogo, plataforma, link)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (dados['user'], dados['telefone'], dados['email'], 
              dados['jogo'], dados['plataforma'], dados['link']))
        con.commit()
        con.close()
        return jsonify({"mensagem": "Inscrição adicionada com sucesso!"}), 201
    except Exception as e:
        return jsonify({"erro": str(e)}), 400


@app.route('/api/formulario/<int:id>', methods=['PUT'])
def atualizar_inscrito(id):
    try:
        data = request.get_json()  # Obtém os dados enviados no corpo da requisição
        
        # Conectando ao banco de dados 'formulario.db'
        conn = sqlite3.connect('formulario.db')  # Usando 'formulario.db' para garantir consistência
        cursor = conn.cursor()

        # Verifica se o ID existe na tabela
        cursor.execute('SELECT * FROM formulario WHERE id = ?', (id,))
        inscricao = cursor.fetchone()

        if inscricao is None:
            return jsonify({'erro': 'Inscrição não encontrada'}), 404  # Retorna erro 404 se o ID não existir

        # Atualiza o registro na tabela
        cursor.execute('''UPDATE formulario
                          SET user = ?, email = ?, telefone = ?, jogo = ?, plataforma = ?, link = ?
                          WHERE id = ?''', 
                       (data['user'], data['email'], data['telefone'], data['jogo'], data['plataforma'], data['link'], id))
        
        conn.commit()
        conn.close()

        return jsonify({'mensagem': 'Registro atualizado com sucesso!'}), 200
    except Exception as e:
        return jsonify({'erro': str(e)}), 400


@app.route('/api/formulario/<int:id>', methods=['DELETE'])
def deletar_inscrito(id):
    try:
        con = conectar_banco()
        cur = con.cursor()
        cur.execute("DELETE FROM formulario WHERE id = ?", (id,))
        con.commit()
        con.close()
        return jsonify({"mensagem": f"Inscrição com ID {id} deletada com sucesso!"}), 200
    except Exception as e:
        return jsonify({"erro": f"Erro ao deletar inscrição com ID {id}: {str(e)}"}), 400


conectar_banco()

if __name__ == '__main__':
    app.run(debug=True)