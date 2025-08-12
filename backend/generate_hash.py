from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

password = "secret123"
hashed = pwd_context.hash(password)
print(f"Password: {password}")
print(f"Hash: {hashed}")

# Verify
print(f"Verify: {pwd_context.verify(password, hashed)}")
