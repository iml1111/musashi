#!/usr/bin/env python3

print("=== Simple FastAPI Test ===")

try:
    print("1. Testing basic imports...")
    import sys
    import os
    print(f"Python path: {sys.path}")
    print(f"Python version: {sys.version}")
    
    print("\n2. Testing pydantic_core...")
    import pydantic_core
    print(f"pydantic_core version: {pydantic_core.__version__}")
    
    print("\n3. Testing pydantic...")
    import pydantic
    print(f"pydantic version: {pydantic.__version__}")
    
    print("\n4. Testing FastAPI...")
    from fastapi import FastAPI
    print("FastAPI imported successfully!")
    
    print("\n5. Creating simple FastAPI app...")
    app = FastAPI(title="Test API")
    
    @app.get("/")
    def read_root():
        return {"Hello": "World"}
    
    print("Simple FastAPI app created successfully!")
    print("=== Test completed successfully! ===")
    
except Exception as e:
    print(f"\n❌ Error: {e}")
    print(f"Error type: {type(e)}")
    import traceback
    traceback.print_exc()