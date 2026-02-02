from dotenv import load_dotenv
import os

# 1. Load variables before importing the app
load_dotenv() 

from app import create_app

app = create_app()

if __name__ == "__main__":
    # 2. Enable debug mode for a better dev experience
    app.run(debug=True, port=5000)