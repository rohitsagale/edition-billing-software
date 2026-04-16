# migrate_db.py
from app import create_app
from models import db, EventType

app = create_app()
with app.app_context():
    # Add new tables if not exist
    db.create_all()
    # Seed default event types
    default_events = ['Wedding', 'Engagement', 'Birthday', 'Corporate', 'Pre-wedding', 'Baby Shower']
    for ev in default_events:
        if not EventType.query.filter_by(name=ev).first():
            db.session.add(EventType(name=ev))
    db.session.commit()
    print("Migration complete: New tables added and default event types seeded.")