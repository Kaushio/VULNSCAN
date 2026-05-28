from urllib import response

from flask import Flask, request, jsonify
from flask_cors import CORS
import nmap
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)

scanner = nmap.PortScanner()

@app.route("/")
def home():
    return {"message": "VULNSCAN AI Backend Running"}

@app.route("/scan", methods=["POST"])
def scan_target():
    data = request.json
    target = data.get("target")

    if not target:
        return jsonify({"error": "Target required"}), 400

    try:
        scanner.scan(target, arguments="-sV")

        results = []

        for host in scanner.all_hosts():
            for proto in scanner[host].all_protocols():
                ports = scanner[host][proto].keys()

                for port in ports:
                    service = scanner[host][proto][port]

                    results.append({
                        "port": port,
                        "service": service.get("name"),
                        "product": service.get("product"),
                        "version": service.get("version"),
                        "state": service.get("state")
                    })

        prompt = f'''
        You are a cybersecurity analyst AI.

        Analyze the scan results and respond STRICTLY in this format:

        ## Security Risks
        - Explain risks for each open port/service

        ## Severity Assessment
        - Mention Low / Medium / High / Critical risks

        ## Remediation Steps
        - Give mitigation and security fixes

        ## Final Recommendation
        - Give an overall security recommendation summary

        Scan Results:
        {results}
        '''

        response = client.chat.completions.create(
                messages=[
                    {
                        "role": "user",
                        "content": prompt,
                    }
                ],
                model="llama-3.1-8b-instant",
        )

        response_text = response.choices[0].message.content

        return jsonify({
            "target": target,
            "results": results,
            "ai_analysis": response_text 
        })

    except Exception as e:
        print("ERROR:", e)
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True)