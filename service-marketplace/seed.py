from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.models.profile import ProviderProfile
from app.models.message import Message
from app.models.media import Media
from passlib.context import CryptContext
from datetime import datetime, timedelta

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    # Check if already seeded
    if db.query(User).filter(User.username == "amara_lekki").first():
        print("Database already seeded with production data.")
        db.close()
        return

    # 1. Create a Test Client
    client_user = User(
        username="daniel_client",
        hashed_password=pwd_context.hash("password123"),
        role=UserRole.client,
        email="daniel@example.com",
        phone_number="+2348012345678"
    )
    db.add(client_user)
    db.flush()

    # 2. Define 6 Production-Grade Providers (Matching frontend mocks)
    providers_data = [
        {
            "username": "amara_lekki",
            "display_name": "Amara",
            "age": 24,
            "location": "Lekki",
            "bio": "High-class companion. Available for refined gentlemen seeking genuine connection and unforgettable experiences. Discretion guaranteed.",
            "st_rate": True,
            "ovn_rate": True,
            "avatar_url": "/p1.png",
            "is_verified": True,
            "is_online": True
        },
        {
            "username": "zara_vi",
            "display_name": "Zara",
            "age": 27,
            "location": "Victoria Island",
            "bio": "Elegant and sophisticated. I offer curated companionship for the discerning professional. Prior booking required.",
            "st_rate": False,
            "ovn_rate": True,
            "avatar_url": "/p2.png",
            "is_verified": True,
            "is_online": False
        },
        {
            "username": "kemi_ikoyi",
            "display_name": "Kemi",
            "age": 22,
            "location": "Ikoyi",
            "bio": "Young, vibrant, and fun. Perfect for evenings out or quiet in-room meetings. Always on time, always discreet.",
            "st_rate": True,
            "ovn_rate": False,
            "avatar_url": "/p3.png",
            "is_verified": True,
            "is_online": True
        },
        {
            "username": "nadia_ikeja",
            "display_name": "Nadia",
            "age": 29,
            "location": "Ikeja",
            "bio": "Experienced and nurturing. I specialize in creating comfortable and relaxed experiences. Full-night bookings preferred.",
            "st_rate": True,
            "ovn_rate": True,
            "avatar_url": "/p4.png",
            "is_verified": False,
            "is_online": True
        },
        {
            "username": "temi_ajah",
            "display_name": "Temi",
            "age": 25,
            "location": "Ajah",
            "bio": "Playful and attentive. I love deep conversations as much as great company. Available most evenings.",
            "st_rate": True,
            "ovn_rate": True,
            "avatar_url": "/p5.png",
            "is_verified": True,
            "is_online": False
        },
        {
            "username": "jade_surulere",
            "display_name": "Jade",
            "age": 31,
            "location": "Surulere",
            "bio": "Mature, grounded, and deeply engaging. Ideal for long-stay bookings with a personal touch.",
            "st_rate": False,
            "ovn_rate": True,
            "avatar_url": "/p6.png",
            "is_verified": True,
            "is_online": True
        }
    ]

    for p in providers_data:
        user = User(
            username=p["username"],
            hashed_password=pwd_context.hash("password123"),
            role=UserRole.provider
        )
        db.add(user)
        db.flush()
        
        profile = ProviderProfile(
            user_id=user.id,
            display_name=p["display_name"],
            age=p["age"],
            location=p["location"],
            bio=p["bio"],
            st_rate=p["st_rate"],
            ovn_rate=p["ovn_rate"],
            avatar_url=p["avatar_url"],
            is_verified=p["is_verified"],
            is_online=p["is_online"]
        )
        db.add(profile)
        
        # Add sample media
        for i in range(1, 4):
            media = Media(
                provider_id=user.id,
                file_url=f"promo{i}.png",
                media_type="image",
                is_featured=(i == 1)
            )
            db.add(media)

        # 3. Create sample messages between Client and this Provider
        # One incoming, one outgoing
        msg1 = Message(
            sender_id=user.id,
            receiver_id=client_user.id,
            message_text=f"Hello from {p['display_name']}! Hope you are having a great day.",
            timestamp=datetime.now() - timedelta(hours=2),
            is_read=False
        )
        db.add(msg1)
        
        msg2 = Message(
            sender_id=client_user.id,
            receiver_id=user.id,
            message_text="Hi! Yes, I am. I wanted to ask about your availability.",
            timestamp=datetime.now() - timedelta(hours=1),
            is_read=True
        )
        db.add(msg2)

    db.commit()
    db.close()
    print("Production-grade database seeded successfully.")

if __name__ == "__main__":
    seed()
