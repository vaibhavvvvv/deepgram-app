from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv

from deepgram import DeepgramClient, PrerecordedOptions, FileSource

load_dotenv()

API_KEY = os.getenv("DG_API_KEY")

app = Flask(__name__)
CORS(app)

@app.route('/transcribe', methods=['POST'])
def transcribe_audio():
    try:
        if 'audio_file' not in request.files:
            return jsonify({'error': 'No audio file uploaded'}), 400

        audio_file = request.files['audio_file']

        audio_data = audio_file.read()

        deepgram = DeepgramClient(API_KEY)

        payload: FileSource = {
            "buffer": audio_data,
        }

        options = PrerecordedOptions(
            model="nova-2",
            smart_format=True,
            diarize=True,
        )

        response = deepgram.listen.prerecorded.v("1").transcribe_file(payload, options)

        # print(response.to_json(indent=4))

        return jsonify(response)

    except Exception as e:
        return jsonify({'error': f'Failed to transcribe audio. {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True, host= "0.0.0.0")
