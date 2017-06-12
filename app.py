import random
from objects import fetch_model
from flask import Flask, render_template, request, jsonify

app = Flask(__name__,
            template_folder='./',
            static_folder='assets')


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/search', methods=['POST'])
def search():
    q = request.get_json()['query']
    models = fetch_model(q, use_existing=True)
    if models is not None:
        model_file = random.choice(models)
        return jsonify(success=True, path=model_file)
    return jsonify(success=False)


if __name__ == '__main__':
    app.run(debug=True)
