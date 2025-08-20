#!/usr/bin/env python
"""
Quick start script for the Django backend.
This script handles common setup tasks and starts the development server.
"""
import os
import sys
import subprocess
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors."""
    print(f"\n{description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def main():
    """Main setup and run function."""
    # Change to backend directory
    backend_dir = Path(__file__).parent
    os.chdir(backend_dir)
    
    print("🚀 Starting Django Event Scanning System Backend")
    print("=" * 50)
    
    # Check if virtual environment exists
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        print("⚠️  Virtual environment not found. Please create one first:")
        print("   python -m venv venv")
        print("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
        print("   pip install -r requirements.txt")
        return
    
    # Check if .env file exists
    env_path = backend_dir / ".env"
    if not env_path.exists():
        print("⚠️  .env file not found. Copying from env.example...")
        try:
            import shutil
            shutil.copy("env.example", ".env")
            print("✅ .env file created with MAMP MySQL defaults.")
            print("📝 Default MAMP settings:")
            print("   - Database: event_scanning")
            print("   - User: root")
            print("   - Password: root")
            print("   - Host: localhost")
            print("   - Port: 8889")
            print("🔧 Make sure MAMP is running and create the database 'event_scanning'")
        except Exception as e:
            print(f"❌ Failed to create .env file: {e}")
            return
    
    # Check if migrations have been run
    if not run_command("python manage.py showmigrations --plan | grep -q '\\[X\\]'", "Checking for applied migrations"):
        print("\n🔄 Running database migrations...")
        if not run_command("python manage.py makemigrations", "Creating migrations"):
            return
        if not run_command("python manage.py migrate", "Applying migrations"):
            return
    
    # Check if superuser exists
    print("\n👤 Checking for admin user...")
    check_admin = subprocess.run(
        'python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); print(User.objects.filter(role=\'ADMIN\').exists())"',
        shell=True, capture_output=True, text=True
    )
    
    if "True" not in check_admin.stdout:
        print("ℹ️  No admin user found. You may want to create one:")
        print("   python manage.py createsuperuser")
    
    # Start the development server
    print("\n🌐 Starting development server...")
    print("Backend will be available at: http://localhost:8000")
    print("API endpoints at: http://localhost:8000/api/")
    print("Admin interface at: http://localhost:8000/admin/")
    print("\nPress Ctrl+C to stop the server")
    print("=" * 50)
    
    try:
        subprocess.run("python manage.py runserver 8000", shell=True, check=True)
    except KeyboardInterrupt:
        print("\n\n👋 Server stopped. Goodbye!")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Server failed to start: {e}")

if __name__ == "__main__":
    main()
