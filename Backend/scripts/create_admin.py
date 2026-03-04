"""Create/Update an admin user (local or Render shell).

Usage:
  python scripts/create_admin.py admin@example.com MyStrongPassword
"""
import sys
from database import SessionLocal, User
from auth import hash_password

def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/create_admin.py <email> <password>")
        sys.exit(1)

    email, password = sys.argv[1], sys.argv[2]
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if user:
            user.password_hash = hash_password(password)
            user.role = "admin"
            user.is_active = True
            print(f"Updated admin user: {email}")
        else:
            user = User(email=email, password_hash=hash_password(password), role="admin", is_active=True)
            db.add(user)
            print(f"Created admin user: {email}")
        db.commit()
    finally:
        db.close()

if __name__ == "__main__":
    main()
