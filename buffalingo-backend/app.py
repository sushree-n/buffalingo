from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import re
from prompts import get_random_prompt
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

load_dotenv()  # Load variables from .env

API_KEY = os.environ.get("OPENROUTER_API_KEY")

@app.route("/prompt", methods=["GET"])
def get_prompt():
    prompt = get_random_prompt()
    return jsonify({"prompt": prompt})

@app.route("/evaluate", methods=["POST"])
def evaluate_word():
    data = request.get_json()
    original = data.get("prompt")
    user_word = data.get("response")

    if not request.is_json:
        return jsonify({"error": "Content-Type must be application/json"}), 415

    if not original or not user_word:
        return jsonify({"error": "Missing input: 'prompt' and 'response' are required"}), 400

    # Easter Eggs 🥚
    easter_eggs = {
        ("wings", "ranch"): ("RANCH?! You just got banned from Buffalo. It's bleu cheese or bust.", 0),
        ("zubaz", "pants"): ("Certified Bills Mafia fashion legend. Those pants scream 'I yell on third down.'", 1),
        ("blizzard", "shorts"): ("Wearing shorts in a blizzard? Yep, you’re from Buffalo.", 1),
        ("tailgate", "beer"): ("Correct. That’s the entire food pyramid.", 1),
    }

    key = (original.lower(), user_word.lower())
    if key in easter_eggs:
        feedback, score = easter_eggs[key]
        return jsonify({"feedback": feedback, "score": score})


    if user_word.strip().lower() == "716":
        return jsonify({"feedback": "Ah, the sacred digits. You’ve unlocked true Buffalove.", "score": 1})

    # AI Request
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }

    prompt_message = {
        "role": "system",
        "content": (
            "You're a die-hard, sarcastic Buffalo native judging a word association game. "
            "You MUST respond in strict JSON format ONLY like this:\n"
            '{ "feedback": "witty response", "score": 0 or 1 }\n\n'
            "Be fun, sarcastic, dramatic, Buffalo-themed. Don't say 'Correct!'. Say stuff like:\n"
            ' - "You clearly know Buffalo better than most weathermen."\n'
            ' - "Bleu cheese? You’re hired."\n'
            "ABSOLUTELY NO extra commentary. Just return JSON."
        )
    }

    user_message = {
        "role": "user",
        "content": f'The prompt is "{original}" and the user said "{user_word}". What do you think?'
    }

    payload = {
        "model": "mistralai/mistral-7b-instruct",
        "temperature": 0.7,
        "messages": [prompt_message, user_message]
    }

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            data=json.dumps(payload)
        )

        if response.status_code != 200:
            return jsonify({"error": "OpenRouter request failed", "details": response.text}), response.status_code

        result = response.json()
        content = result["choices"][0]["message"]["content"]
        print("🔍 AI Raw Response:", content)

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError:
            match = re.search(r'\{.*?"feedback"\s*:\s*".*?".*?"score"\s*:\s*[01].*?\}', content, re.DOTALL)
            if match:
                try:
                    parsed = json.loads(match.group())
                except:
                    parsed = {"feedback": content, "score": 0}
            else:
                parsed = {"feedback": content, "score": 0}

        return jsonify({
            "feedback": parsed.get("feedback", "No feedback."),
            "score": int(parsed.get("score", 0))
        })

    except Exception as e:
        return jsonify({"error": "Internal server error", "details": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)
