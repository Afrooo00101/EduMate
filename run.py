import uvicorn


if __name__ == '__main__':
    print("--------------------------------------------------")
    print("EduMate Platform Starting...")
    print("Student Dashboard: http://localhost:8000/")
    print("API Documentation: http://localhost:8000/docs")
    print("--------------------------------------------------")

    uvicorn.run('app.main:app', host='0.0.0.0', port=8000, reload=False)
