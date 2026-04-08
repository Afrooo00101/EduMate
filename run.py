import uvicorn


if __name__ == '__main__':
    uvicorn.run('app.main:app', host='127.0.0.1', port=8000, reload=True)



# Test URLs:
# Root: http://127.0.0.1:8000/
# Health: http://127.0.0.1:8000/health
# Swagger docs: http://127.0.0.1:8000/docs