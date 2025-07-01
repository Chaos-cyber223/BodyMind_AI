from fastapi import FastAPI

app = FastAPI(title="Test API", description="Simple test")

@app.get("/")
def read_root():
    return {"Hello": "World"}

@app.get("/test")
def test_endpoint():
    return {"message": "This is a test endpoint"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)