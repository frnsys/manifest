import os
import config
import random
import zipfile
import requests
from glob import glob

BASE_URL = 'https://clara.io/api'

def download(uuid, fname):
    url = '{}{}'.format(BASE_URL,
        '/scenes/{}/export/threejs'.format(uuid))
    params = {
        'zip': True,
        'centerScene': True
    }
    resp = requests.get(
        url,
        streem=True,
        params=params,
        auth=(config.USERNAME, config.API_TOKEN))
    with open(fname, 'wb') as f:
        for chunk in resp.iter_content(chunk_size=1024):
            if chunk:
                f.write(chunk)
    return fname


def search(query, page=1, per_page=100):
    url = '{}{}'.format(BASE_URL, '/scenes')
    params = {
        'query': query,
        'public': True,
        'page': page,
        'perPage': per_page,
        'type': 'library',
    }
    resp = requests.get(url, params=params)
    return resp.json()


def fetch_model(query, use_existing=False):
    fname = '/tmp/model.zip'
    models_dir = 'assets/models/{}'.format(query)
    if use_existing and os.path.isdir(models_dir):
        return glob('{}/*.json'.format(models_dir))
    ids = [m['_id'] for m in search(query)['models']]
    if not ids:
        return None
    id = random.choice(ids)
    download(id, fname)
    try:
        zip = zipfile.ZipFile(fname, 'r')
        zip.extractall(models_dir)
        zip.close()
    except zipfile.BadZipFile:
        return None
    return glob('{}/*.json'.format(models_dir))


if __name__ == '__main__':
    query = 'boat'
    print(fetch_model(query))