from app import app, db
from flask_appbuilder import AppBuilder

def init_app():
    with app.app_context():
        db.create_all()
        appbuilder = AppBuilder(app, db.session)
        return appbuilder

if __name__ == "__main__":
    init_app()
