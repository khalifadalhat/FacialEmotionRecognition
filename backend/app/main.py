from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from deepface import DeepFace
import base64
import numpy as np
import cv2
from PIL import Image
import io
import logging

app = FastAPI()

logging.getLogger("deepface").setLevel(logging.ERROR)


class FrameRequest(BaseModel):
    image: str 


@app.get("/")
def root():
    return {"message": "Facial Emotion Recognition API is running"}


@app.post("/analyze-frame")
async def analyze_frame(data: FrameRequest):
    """
    Analyze a single camera frame sent as base64 string.
    Designed for real-time mobile camera streaming (Expo).
    """

    try:
        if "," in data.image:
            base64_data = data.image.split(",")[1]
        else:
            base64_data = data.image

        image_bytes = base64.b64decode(base64_data)

        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        frame = np.array(image)

        frame = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)

        result = DeepFace.analyze(
            img_path=frame,
            actions=["emotion"],
            enforce_detection=False,
            detector_backend="opencv",
        )

        if isinstance(result, list):
            result = result[0]

        dominant_emotion = result.get("dominant_emotion")
        emotions = result.get("emotion", {})

        return {
            "success": True,
            "dominant_emotion": dominant_emotion,
            "emotions": emotions,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))