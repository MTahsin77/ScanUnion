#!/usr/bin/env python3
"""
Setup script for Event Scanning System
This script helps set up the project with MAMP MySQL database.
"""
import os
import subprocess
import sys
from pathlib import Path

def run_command(command, description, cwd=None):
    """Run a command and handle errors."""
    print(f"\n🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True, cwd=cwd)
        if result.stdout:
            print(result.stdout)
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"Error details: {e.stderr}")
        return False

def main():
    """Main setup function."""
    project_dir = Path(__file__).parent
    backend_dir = project_dir / "backend"
    frontend_dir = project_dir / "frontend"
    
    print("🚀 Event Scanning System Setup")
    print("=" * 50)
    
    # Check if MAMP is running
    print("\n📋 Setup Checklist:")
    print("1. ✅ Make sure MAMP is installed and running")
    print("2. ✅ Create database 'event_scanning' in phpMyAdmin")
    print("3. ✅ Note MAMP MySQL port (usually 8889)")
    
    response = input("\n❓ Have you completed the above steps? (y/n): ")
    if response.lower() != 'y':
        print("Please complete the checklist first, then run this script again.")
        return
    
    # Backend setup
    print("\n🐍 Setting up Django Backend...")
    
    # Check if virtual environment exists
    venv_path = backend_dir / "venv"
    if not venv_path.exists():
        if not run_command("python3 -m venv venv", "Creating virtual environment", backend_dir):
            print("❌ Failed to create virtual environment")
            return
    
    # Copy environment file
    env_file = backend_dir / ".env"
    env_example = backend_dir / "env.example"
    if not env_file.exists() and env_example.exists():
        import shutil
        shutil.copy(env_example, env_file)
        print("✅ Created .env file with MAMP defaults")
    
    # Install Python dependencies
    activate_cmd = "source venv/bin/activate" if sys.platform != "win32" else "venv\\Scripts\\activate"
    install_cmd = f"{activate_cmd} && pip install -r requirements.txt"
    if not run_command(install_cmd, "Installing Python dependencies", backend_dir):
        print("❌ Failed to install Python dependencies")
        return
    
    # Run migrations
    migrate_cmd = f"{activate_cmd} && python manage.py makemigrations && python manage.py migrate"
    if not run_command(migrate_cmd, "Running database migrations", backend_dir):
        print("❌ Failed to run migrations. Check your MAMP database settings.")
        return
    
    # Frontend setup
    print("\n⚛️  Setting up Next.js Frontend...")
    
    # Copy environment file
    frontend_env = frontend_dir / ".env.local"
    frontend_env_example = frontend_dir / "env.example"
    if not frontend_env.exists() and frontend_env_example.exists():
        import shutil
        shutil.copy(frontend_env_example, frontend_env)
        print("✅ Created frontend .env.local file")
    
    # Install Node dependencies
    if not run_command("npm install", "Installing Node.js dependencies", frontend_dir):
        print("❌ Failed to install Node.js dependencies")
        return
    
    # Create superuser (optional)
    print("\n👤 Creating Django superuser (optional)...")
    create_superuser = input("Would you like to create a Django admin superuser? (y/n): ")
    if create_superuser.lower() == 'y':
        superuser_cmd = f"{activate_cmd} && python manage.py createsuperuser"
        run_command(superuser_cmd, "Creating superuser", backend_dir)
    
    # Final instructions
    print("\n🎉 Setup Complete!")
    print("=" * 50)
    print("\n🚀 To start the application:")
    print("\n1. Start Django Backend:")
    print("   cd backend")
    print("   source venv/bin/activate  # On Windows: venv\\Scripts\\activate")
    print("   python manage.py runserver 8000")
    print("\n2. Start Next.js Frontend (in another terminal):")
    print("   cd frontend")
    print("   npm run dev")
    print("\n📱 Access URLs:")
    print("   - Frontend: http://localhost:9002")
    print("   - Backend API: http://localhost:8000/api")
    print("   - Django Admin: http://localhost:8000/admin")
    print("   - MAMP phpMyAdmin: http://localhost/phpMyAdmin/")
    print("\n🎯 Default Login (create users in Django admin):")
    print("   - Admin: Use Django superuser credentials")
    print("   - Scanner: Create users with PINs in admin panel")

if __name__ == "__main__":
    main()
