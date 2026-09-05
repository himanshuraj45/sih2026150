from fastapi import FastAPI

app = FastAPI(title="NEXORA Backend")


@app.get("/")
def home():
    return {"message": "NEXORA backend is running"}


@app.get("/health")
def health():
    return {"status": "healthy"}