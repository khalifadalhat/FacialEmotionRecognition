from fastapi import FastAPI

app = FastAPI(title="Facial Emotion Recognition API")

@app.get("/")
def health_check():
    return {"status": "Backend is running perfectly 🚀"}