from fastapi import FastAPI, UploadFile, File
from ultralytics import YOLO
import tempfile
import os

app = FastAPI(title="NEXORA Local AI")

model = YOLO("yolo11n.pt")


@app.get("/health")
def health():
    return {
        "status": "ok",
        "ai": "local",
        "cloud_upload": False
    }


@app.post("/analyze")
async def analyze_video(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "video.mp4")[1]

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp:
        temp.write(await file.read())
        video_path = temp.name

    try:
        results = model.predict(
            source=video_path,
            stream=True,
            verbose=False
        )

        detections = []

        for frame_number, result in enumerate(results):
            if result.boxes is None:
                continue

            for box in result.boxes:
                class_id = int(box.cls[0])
                confidence = float(box.conf[0])

                detections.append({
                    "frame": frame_number,
                    "label": model.names[class_id],
                    "confidence": round(confidence, 3)
                })

        return {
            "status": "completed",
            "local_processing": True,
            "cloud_upload": False,
            "detections": detections
        }

    finally:
        if os.path.exists(video_path):
            os.remove(video_path)
