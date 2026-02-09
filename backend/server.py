from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
from enum import Enum

# Square Payment SDK
from square.client import Client as SquareClient

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Square Payment client
square_client = None
square_location_id = os.environ.get('SQUARE_LOCATION_ID', '')

def get_square_client():
    global square_client
    if square_client is None:
        access_token = os.environ.get('SQUARE_ACCESS_TOKEN', '')
        environment = os.environ.get('SQUARE_ENVIRONMENT', 'sandbox')
        square_client = SquareClient(
            access_token=access_token,
            environment=environment
        )
    return square_client

# Create the main app
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= ENUMS =============
class CruiseType(str, Enum):
    CABIN = "cabin"
    PRIVATE = "private"
    BOTH = "both"

class AvailabilityStatus(str, Enum):
    AVAILABLE = "available"
    LIMITED = "limited"
    FULL = "full"

# ============= MODELS =============

# Cruise Models - NEW DETAILED STRUCTURE
class CruiseAvailability(BaseModel):
    """Detailed availability with date range, price, and status"""
    date_range: str  # e.g., "du 23 mai au 6 juin 2026"
    price: float  # Price per passenger
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    remaining_places: Optional[int] = None  # e.g., 4 if "Reste 4 places"
    status_label: Optional[str] = None  # e.g., "COMPLET", "Reste 4 places"

class ProgramDay(BaseModel):
    """Detailed day-by-day program"""
    day: int
    title: str
    description: str

class CruisePricing(BaseModel):
    cabin_price: Optional[float] = None  # Base price (starting from)
    private_price: Optional[float] = None
    currency: str = "EUR"

class Cruise(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name_fr: str
    name_en: str
    subtitle_fr: str
    subtitle_en: str
    description_fr: str
    description_en: str
    image_url: str
    destination: str
    cruise_type: CruiseType
    duration: str
    departure_port: str
    pricing: CruisePricing
    highlights_fr: List[str] = []
    highlights_en: List[str] = []
    # NEW: Detailed availabilities with date range, price, status
    availabilities: List[CruiseAvailability] = []
    # NEW: Detailed program day by day
    detailed_program_fr: List[ProgramDay] = []
    detailed_program_en: List[ProgramDay] = []
    # Legacy fields (kept for backward compatibility)
    available_dates: List[dict] = []
    program_fr: List[str] = []
    program_en: List[str] = []
    # Boarding pass image for each cruise
    boarding_pass_image: Optional[str] = None
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CruiseCreate(BaseModel):
    name_fr: str
    name_en: str
    subtitle_fr: str
    subtitle_en: str
    description_fr: str
    description_en: str
    image_url: str
    destination: str
    cruise_type: CruiseType
    duration: str
    departure_port: str
    pricing: CruisePricing
    highlights_fr: List[str] = []
    highlights_en: List[str] = []
    availabilities: List[CruiseAvailability] = []
    detailed_program_fr: List[ProgramDay] = []
    detailed_program_en: List[ProgramDay] = []
    available_dates: List[dict] = []
    program_fr: List[str] = []
    program_en: List[str] = []
    is_active: bool = True
    order: int = 0

class CruiseUpdate(BaseModel):
    name_fr: Optional[str] = None
    name_en: Optional[str] = None
    subtitle_fr: Optional[str] = None
    subtitle_en: Optional[str] = None
    description_fr: Optional[str] = None
    description_en: Optional[str] = None
    image_url: Optional[str] = None
    destination: Optional[str] = None
    cruise_type: Optional[CruiseType] = None
    duration: Optional[str] = None
    departure_port: Optional[str] = None
    pricing: Optional[CruisePricing] = None
    highlights_fr: Optional[List[str]] = None
    highlights_en: Optional[List[str]] = None
    availabilities: Optional[List[CruiseAvailability]] = None
    detailed_program_fr: Optional[List[ProgramDay]] = None
    detailed_program_en: Optional[List[ProgramDay]] = None
    available_dates: Optional[List[dict]] = None
    program_fr: Optional[List[str]] = None
    program_en: Optional[List[str]] = None
    is_active: Optional[bool] = None
    order: Optional[int] = None

# Club Member Models
class ClubMember(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio_fr: Optional[str] = None
    bio_en: Optional[str] = None
    cruises_done: List[str] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ClubMemberCreate(BaseModel):
    username: str
    email: str
    avatar_url: Optional[str] = None
    bio_fr: Optional[str] = None
    bio_en: Optional[str] = None

# Community Post Models
class PostComment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    author_name: str
    content: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class CommunityPost(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    title: str
    content: str
    image_url: Optional[str] = None
    category: str = "general"  # general, trip_report, tips, meetup
    likes: List[str] = []
    comments: List[PostComment] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CommunityPostCreate(BaseModel):
    author_id: str
    author_name: str
    author_avatar: Optional[str] = None
    title: str
    content: str
    image_url: Optional[str] = None
    category: str = "general"

class CommentCreate(BaseModel):
    author_id: str
    author_name: str
    content: str

# ============= CRUISE ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Sognudimare!"}

@api_router.get("/cruises", response_model=List[Cruise])
async def get_cruises(active_only: bool = True):
    query = {"is_active": True} if active_only else {}
    cruises = await db.cruises.find(query).sort("order", 1).to_list(100)
    return [Cruise(**cruise) for cruise in cruises]

@api_router.get("/cruises/{cruise_id}", response_model=Cruise)
async def get_cruise(cruise_id: str):
    cruise = await db.cruises.find_one({"id": cruise_id})
    if not cruise:
        raise HTTPException(status_code=404, detail="Cruise not found")
    return Cruise(**cruise)

@api_router.post("/cruises", response_model=Cruise)
async def create_cruise(cruise_data: CruiseCreate):
    cruise = Cruise(**cruise_data.dict())
    await db.cruises.insert_one(cruise.dict())
    return cruise

@api_router.put("/cruises/{cruise_id}", response_model=Cruise)
async def update_cruise(cruise_id: str, cruise_data: CruiseUpdate):
    existing = await db.cruises.find_one({"id": cruise_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Cruise not found")
    
    update_data = {k: v for k, v in cruise_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.cruises.update_one({"id": cruise_id}, {"$set": update_data})
    updated = await db.cruises.find_one({"id": cruise_id})
    return Cruise(**updated)

@api_router.delete("/cruises/{cruise_id}")
async def delete_cruise(cruise_id: str):
    result = await db.cruises.delete_one({"id": cruise_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cruise not found")
    return {"message": "Cruise deleted successfully"}

# ============= CLUB MEMBER ROUTES =============

@api_router.get("/members", response_model=List[ClubMember])
async def get_members():
    members = await db.members.find({"is_active": True}).to_list(1000)
    return [ClubMember(**member) for member in members]

@api_router.get("/members/{member_id}", response_model=ClubMember)
async def get_member(member_id: str):
    member = await db.members.find_one({"id": member_id})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return ClubMember(**member)

@api_router.post("/members", response_model=ClubMember)
async def create_member(member_data: ClubMemberCreate):
    # Check if email already exists
    existing = await db.members.find_one({"email": member_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    member = ClubMember(**member_data.dict())
    await db.members.insert_one(member.dict())
    return member

@api_router.get("/members/email/{email}", response_model=ClubMember)
async def get_member_by_email(email: str):
    member = await db.members.find_one({"email": email, "is_active": True})
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    return ClubMember(**member)

# ============= COMMUNITY POSTS ROUTES =============

@api_router.get("/posts", response_model=List[CommunityPost])
async def get_posts(category: Optional[str] = None, limit: int = 50):
    query = {"category": category} if category else {}
    posts = await db.posts.find(query).sort("created_at", -1).to_list(limit)
    return [CommunityPost(**post) for post in posts]

@api_router.get("/posts/{post_id}", response_model=CommunityPost)
async def get_post(post_id: str):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return CommunityPost(**post)

@api_router.post("/posts", response_model=CommunityPost)
async def create_post(post_data: CommunityPostCreate):
    post = CommunityPost(**post_data.dict())
    await db.posts.insert_one(post.dict())
    return post

@api_router.post("/posts/{post_id}/like")
async def toggle_like(post_id: str, member_id: str = Query(...)):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    likes = post.get("likes", [])
    if member_id in likes:
        likes.remove(member_id)
    else:
        likes.append(member_id)
    
    await db.posts.update_one({"id": post_id}, {"$set": {"likes": likes}})
    return {"likes_count": len(likes), "liked": member_id in likes}

@api_router.post("/posts/{post_id}/comments", response_model=CommunityPost)
async def add_comment(post_id: str, comment_data: CommentCreate):
    post = await db.posts.find_one({"id": post_id})
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    comment = PostComment(**comment_data.dict())
    await db.posts.update_one(
        {"id": post_id},
        {
            "$push": {"comments": comment.dict()},
            "$set": {"updated_at": datetime.utcnow()}
        }
    )
    
    updated = await db.posts.find_one({"id": post_id})
    return CommunityPost(**updated)

@api_router.delete("/posts/{post_id}")
async def delete_post(post_id: str):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted successfully"}

# ============= DIRECT MESSAGING =============

class DirectMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    is_from_captain: bool = False
    is_read: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)

class DirectMessageCreate(BaseModel):
    sender_id: str
    sender_name: str
    receiver_id: str
    receiver_name: str
    content: str
    is_from_captain: bool = False

class Conversation(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    participant_ids: List[str]
    participant_names: List[str]
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Captain account (special account for direct communication)
CAPTAIN_ID = "captain-sognudimare"
CAPTAIN_NAME = "Capitaine Sognudimare"

@api_router.get("/messages/conversations/{user_id}")
async def get_conversations(user_id: str):
    """Get all conversations for a user"""
    conversations = await db.conversations.find({
        "participant_ids": user_id
    }).sort("last_message_at", -1).to_list(50)
    return conversations

@api_router.get("/messages/{user_id}/{other_user_id}")
async def get_messages(user_id: str, other_user_id: str):
    """Get messages between two users"""
    messages = await db.messages.find({
        "$or": [
            {"sender_id": user_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": user_id}
        ]
    }).sort("created_at", 1).to_list(100)
    
    # Mark messages as read
    await db.messages.update_many(
        {"sender_id": other_user_id, "receiver_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    
    return messages

@api_router.post("/messages")
async def send_message(message_data: DirectMessageCreate):
    """Send a direct message"""
    message = DirectMessage(**message_data.dict())
    await db.messages.insert_one(message.dict())
    
    # Update or create conversation
    conversation_id = "-".join(sorted([message_data.sender_id, message_data.receiver_id]))
    existing_conv = await db.conversations.find_one({"id": conversation_id})
    
    if existing_conv:
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$set": {
                    "last_message": message_data.content[:50],
                    "last_message_at": datetime.utcnow()
                },
                "$inc": {"unread_count": 1}
            }
        )
    else:
        conv = Conversation(
            id=conversation_id,
            participant_ids=[message_data.sender_id, message_data.receiver_id],
            participant_names=[message_data.sender_name, message_data.receiver_name],
            last_message=message_data.content[:50],
            last_message_at=datetime.utcnow(),
            unread_count=1
        )
        await db.conversations.insert_one(conv.dict())
    
    return message.dict()

@api_router.get("/messages/captain")
async def get_captain_info():
    """Get captain info for messaging"""
    return {
        "id": CAPTAIN_ID,
        "name": CAPTAIN_NAME,
        "avatar": "captain",
        "is_captain": True
    }

# ============= ADMIN / MODERATION =============

class AdminCredentials(BaseModel):
    username: str
    password: str

# Simple admin password (loaded from environment)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "admin")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "sognudimare2024")

@api_router.post("/admin/login")
async def admin_login(credentials: AdminCredentials):
    """Admin login"""
    if credentials.username == ADMIN_USERNAME and credentials.password == ADMIN_PASSWORD:
        return {"success": True, "token": "admin-token-sognudimare"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@api_router.get("/admin/posts")
async def admin_get_all_posts():
    """Get all posts for moderation"""
    posts = await db.posts.find().sort("created_at", -1).to_list(100)
    return [
        {**post, "_id": str(post["_id"])} if "_id" in post else post 
        for post in posts
    ]

@api_router.delete("/admin/posts/{post_id}")
async def admin_delete_post(post_id: str):
    """Admin delete a post"""
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"message": "Post deleted by admin"}

@api_router.delete("/admin/posts/{post_id}/comments/{comment_id}")
async def admin_delete_comment(post_id: str, comment_id: str):
    """Admin delete a comment"""
    result = await db.posts.update_one(
        {"id": post_id},
        {"$pull": {"comments": {"id": comment_id}}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted by admin"}

@api_router.get("/admin/members")
async def admin_get_all_members():
    """Get all members for moderation"""
    members = await db.members.find().to_list(100)
    return [
        {**member, "_id": str(member["_id"])} if "_id" in member else member 
        for member in members
    ]

@api_router.put("/admin/members/{member_id}/ban")
async def admin_ban_member(member_id: str):
    """Ban a member"""
    result = await db.members.update_one(
        {"id": member_id},
        {"$set": {"is_banned": True, "banned_at": datetime.utcnow()}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member banned"}

@api_router.put("/admin/members/{member_id}/unban")
async def admin_unban_member(member_id: str):
    """Unban a member"""
    result = await db.members.update_one(
        {"id": member_id},
        {"$set": {"is_banned": False}, "$unset": {"banned_at": ""}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Member not found")
    return {"message": "Member unbanned"}

@api_router.get("/admin/messages")
async def admin_get_all_messages():
    """Get all messages for moderation"""
    messages = await db.messages.find().sort("created_at", -1).to_list(200)
    return messages

@api_router.delete("/admin/messages/{message_id}")
async def admin_delete_message(message_id: str):
    """Admin delete a message"""
    result = await db.messages.delete_one({"id": message_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"message": "Message deleted by admin"}

# ============= ADMIN CRUISES MANAGEMENT =============

@api_router.get("/admin/cruises")
async def admin_get_all_cruises():
    """Get all cruises for admin"""
    cruises = await db.cruises.find().sort("order", 1).to_list(100)
    # Convert MongoDB documents to proper format
    return [
        {**cruise, "_id": str(cruise["_id"])} if "_id" in cruise else cruise 
        for cruise in cruises
    ]

@api_router.put("/admin/cruises/{cruise_id}")
async def admin_update_cruise(cruise_id: str, cruise_data: CruiseUpdate):
    """Admin update cruise"""
    existing = await db.cruises.find_one({"id": cruise_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Cruise not found")
    
    update_data = {k: v for k, v in cruise_data.dict().items() if v is not None}
    update_data["updated_at"] = datetime.utcnow()
    
    await db.cruises.update_one({"id": cruise_id}, {"$set": update_data})
    updated = await db.cruises.find_one({"id": cruise_id})
    return Cruise(**updated)

@api_router.delete("/admin/cruises/{cruise_id}")
async def admin_delete_cruise(cruise_id: str):
    """Admin delete cruise"""
    result = await db.cruises.delete_one({"id": cruise_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Cruise not found")
    return {"message": "Cruise deleted"}

# ============= SEED DATA =============

@api_router.post("/seed")
async def seed_database():
    """Seed the database with initial cruise data"""
    
    # Check if already seeded
    existing = await db.cruises.find_one()
    if existing:
        return {"message": "Database already seeded"}
    
    cruises = [
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Tour de Corse",
            "name_en": "Tour of Corsica",
            "subtitle_fr": "L'Inoubliable",
            "subtitle_en": "The Unforgettable",
            "description_fr": "Partez pour une aventure inoubliable autour de l'Île de Beauté. Découvrez les criques sauvages, les villages de pêcheurs authentiques et les paysages à couper le souffle de la Corse.",
            "description_en": "Embark on an unforgettable adventure around the Island of Beauty. Discover wild coves, authentic fishing villages and breathtaking landscapes of Corsica.",
            "image_url": "https://images.unsplash.com/photo-1592314963065-87659404f412?w=800",
            "destination": "corsica",
            "cruise_type": "both",
            "duration": "2 semaines",
            "departure_port": "Ajaccio",
            "pricing": {"cabin_price": 2560, "private_price": 12900, "currency": "EUR"},
            "highlights_fr": ["Scandola (UNESCO)", "Bonifacio", "Cap Corse", "Îles Lavezzi"],
            "highlights_en": ["Scandola (UNESCO)", "Bonifacio", "Cap Corse", "Lavezzi Islands"],
            "available_dates": [
                {"date": "2025-05-02", "status": "available"},
                {"date": "2025-05-09", "status": "full"},
                {"date": "2025-05-16", "status": "available"},
                {"date": "2025-06-13", "status": "limited", "remaining_places": 4},
                {"date": "2025-06-20", "status": "limited", "remaining_places": 4}
            ],
            "program_fr": [
                "Jour 1: Ajaccio - Îles Sanguinaires",
                "Jour 2: Girolata - Réserve de Scandola",
                "Jour 3: Calvi - Citadelle",
                "Jour 4: Saint-Florent - Cap Corse",
                "Jour 5: Bastia - Villages du Cap",
                "Jour 6: Porto-Vecchio",
                "Jour 7: Bonifacio - Îles Lavezzi",
                "Jour 8: Retour Ajaccio"
            ],
            "program_en": [
                "Day 1: Ajaccio - Sanguinaires Islands",
                "Day 2: Girolata - Scandola Reserve",
                "Day 3: Calvi - Citadel",
                "Day 4: Saint-Florent - Cap Corse",
                "Day 5: Bastia - Cap villages",
                "Day 6: Porto-Vecchio",
                "Day 7: Bonifacio - Lavezzi Islands",
                "Day 8: Return to Ajaccio"
            ],
            "is_active": True,
            "order": 1,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Corse du Sud",
            "name_en": "South Corsica",
            "subtitle_fr": "La Radieuse",
            "subtitle_en": "The Radiant",
            "description_fr": "Explorez les plus belles plages et criques du sud de la Corse. Eaux turquoise, falaises de Bonifacio et authenticité corse vous attendent.",
            "description_en": "Explore the most beautiful beaches and coves of southern Corsica. Turquoise waters, Bonifacio cliffs and Corsican authenticity await you.",
            "image_url": "https://images.unsplash.com/photo-1592285273835-78c20c0aab5d?w=800",
            "destination": "corsica_south",
            "cruise_type": "both",
            "duration": "8 jours / 7 nuits",
            "departure_port": "Ajaccio",
            "pricing": {"cabin_price": 1690, "private_price": 11900, "currency": "EUR"},
            "highlights_fr": ["Bonifacio", "Îles Lavezzi", "Porto-Vecchio", "Palombaggia"],
            "highlights_en": ["Bonifacio", "Lavezzi Islands", "Porto-Vecchio", "Palombaggia"],
            "available_dates": [
                {"date": "2025-05-23", "status": "available"},
                {"date": "2025-05-30", "status": "available"},
                {"date": "2025-06-06", "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Ajaccio - Îles Sanguinaires",
                "Jour 2: Propriano - Campomoro",
                "Jour 3: Bonifacio",
                "Jour 4: Îles Lavezzi",
                "Jour 5: Porto-Vecchio - Palombaggia",
                "Jour 6: Rondinara",
                "Jour 7: Cala Rossa",
                "Jour 8: Retour Ajaccio"
            ],
            "program_en": [
                "Day 1: Ajaccio - Sanguinaires Islands",
                "Day 2: Propriano - Campomoro",
                "Day 3: Bonifacio",
                "Day 4: Lavezzi Islands",
                "Day 5: Porto-Vecchio - Palombaggia",
                "Day 6: Rondinara",
                "Day 7: Cala Rossa",
                "Day 8: Return to Ajaccio"
            ],
            "is_active": True,
            "order": 2,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Ouest Corse",
            "name_en": "West Corsica",
            "subtitle_fr": "L'Indomptée",
            "subtitle_en": "The Untamed",
            "description_fr": "Découvrez la côte sauvage de l'ouest corse avec ses calanques de Piana, la réserve de Scandola et le golfe de Porto.",
            "description_en": "Discover the wild west coast of Corsica with its Piana calanques, Scandola reserve and Porto gulf.",
            "image_url": "https://images.unsplash.com/photo-1599580792927-de3b03c5dc20?w=800",
            "destination": "corsica_west",
            "cruise_type": "both",
            "duration": "8 jours / 7 nuits",
            "departure_port": "Ajaccio",
            "pricing": {"cabin_price": 1590, "private_price": 10900, "currency": "EUR"},
            "highlights_fr": ["Scandola (UNESCO)", "Calanques de Piana", "Girolata", "Calvi"],
            "highlights_en": ["Scandola (UNESCO)", "Piana Calanques", "Girolata", "Calvi"],
            "available_dates": [
                {"date": "2025-06-27", "status": "available"},
                {"date": "2025-07-04", "status": "available"},
                {"date": "2025-07-11", "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Ajaccio - Cargèse",
                "Jour 2: Calanques de Piana",
                "Jour 3: Réserve de Scandola",
                "Jour 4: Girolata",
                "Jour 5: Calvi",
                "Jour 6: L'Île-Rousse",
                "Jour 7: Saint-Florent",
                "Jour 8: Retour Ajaccio"
            ],
            "program_en": [
                "Day 1: Ajaccio - Cargèse",
                "Day 2: Piana Calanques",
                "Day 3: Scandola Reserve",
                "Day 4: Girolata",
                "Day 5: Calvi",
                "Day 6: L'Île-Rousse",
                "Day 7: Saint-Florent",
                "Day 8: Return to Ajaccio"
            ],
            "is_active": True,
            "order": 3,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Sardaigne & Corse du Sud",
            "name_en": "Sardinia & South Corsica",
            "subtitle_fr": "La Sublime",
            "subtitle_en": "The Sublime",
            "description_fr": "Une croisière exceptionnelle entre deux îles méditerranéennes. De la Corse à la Sardaigne, vivez une expérience unique.",
            "description_en": "An exceptional cruise between two Mediterranean islands. From Corsica to Sardinia, live a unique experience.",
            "image_url": "https://images.unsplash.com/photo-1699287956455-25988986f105?w=800",
            "destination": "sardinia",
            "cruise_type": "both",
            "duration": "8 jours / 7 nuits",
            "departure_port": "Ajaccio",
            "pricing": {"cabin_price": 2190, "private_price": 14900, "currency": "EUR"},
            "highlights_fr": ["Costa Smeralda", "La Maddalena", "Bonifacio", "Îles Lavezzi"],
            "highlights_en": ["Costa Smeralda", "La Maddalena", "Bonifacio", "Lavezzi Islands"],
            "available_dates": [
                {"date": "2025-08-01", "status": "limited", "remaining_places": 4},
                {"date": "2025-08-15", "status": "available"},
                {"date": "2025-08-22", "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Ajaccio - Propriano",
                "Jour 2: Bonifacio",
                "Jour 3: Îles Lavezzi - La Maddalena",
                "Jour 4: Archipel de La Maddalena",
                "Jour 5: Costa Smeralda",
                "Jour 6: Retour Corse - Porto-Vecchio",
                "Jour 7: Rondinara",
                "Jour 8: Retour Ajaccio"
            ],
            "program_en": [
                "Day 1: Ajaccio - Propriano",
                "Day 2: Bonifacio",
                "Day 3: Lavezzi Islands - La Maddalena",
                "Day 4: La Maddalena Archipelago",
                "Day 5: Costa Smeralda",
                "Day 6: Return Corsica - Porto-Vecchio",
                "Day 7: Rondinara",
                "Day 8: Return to Ajaccio"
            ],
            "is_active": True,
            "order": 4,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Grèce Authentique",
            "name_en": "Authentic Greece",
            "subtitle_fr": "La Sérénissime",
            "subtitle_en": "The Serene",
            "description_fr": "Naviguez dans les eaux cristallines des îles Ioniennes. Découvrez la Grèce authentique loin des sentiers battus.",
            "description_en": "Sail in the crystal clear waters of the Ionian Islands. Discover authentic Greece off the beaten path.",
            "image_url": "https://images.unsplash.com/photo-1601581875309-fafbf2d3ed3a?w=800",
            "destination": "greece",
            "cruise_type": "private",
            "duration": "8 jours / 7 nuits",
            "departure_port": "Lefkas",
            "pricing": {"cabin_price": None, "private_price": 13900, "currency": "EUR"},
            "highlights_fr": ["Céphalonie", "Ithaque", "Zakynthos", "Lefkas"],
            "highlights_en": ["Kefalonia", "Ithaca", "Zakynthos", "Lefkas"],
            "available_dates": [
                {"date": "2025-09-05", "status": "available"},
                {"date": "2025-09-12", "status": "available"},
                {"date": "2025-09-19", "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Lefkas - Meganisi",
                "Jour 2: Ithaque - Vathy",
                "Jour 3: Céphalonie - Fiskardo",
                "Jour 4: Céphalonie - Sami",
                "Jour 5: Zakynthos - Navagio",
                "Jour 6: Zakynthos - Port",
                "Jour 7: Kastos - Kalamos",
                "Jour 8: Retour Lefkas"
            ],
            "program_en": [
                "Day 1: Lefkas - Meganisi",
                "Day 2: Ithaca - Vathy",
                "Day 3: Kefalonia - Fiskardo",
                "Day 4: Kefalonia - Sami",
                "Day 5: Zakynthos - Navagio",
                "Day 6: Zakynthos - Port",
                "Day 7: Kastos - Kalamos",
                "Day 8: Return to Lefkas"
            ],
            "is_active": True,
            "order": 5,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "name_fr": "Îles Grenadines",
            "name_en": "Grenadines Islands",
            "subtitle_fr": "Les Éclatantes",
            "subtitle_en": "The Dazzling",
            "description_fr": "Évasion tropicale aux Caraïbes. Naviguez entre les îles paradisiaques des Grenadines pour une expérience inoubliable.",
            "description_en": "Tropical escape in the Caribbean. Sail between the paradise islands of the Grenadines for an unforgettable experience.",
            "image_url": "https://images.unsplash.com/photo-1609097172762-1faf6cc8a0d2?w=800",
            "destination": "caribbean",
            "cruise_type": "private",
            "duration": "8 jours / 7 nuits",
            "departure_port": "Le Marin (Martinique)",
            "pricing": {"cabin_price": None, "private_price": 18900, "currency": "EUR"},
            "highlights_fr": ["Tobago Cays", "Mustique", "Bequia", "Saint-Vincent"],
            "highlights_en": ["Tobago Cays", "Mustique", "Bequia", "Saint Vincent"],
            "available_dates": [
                {"date": "2025-12-05", "status": "available"},
                {"date": "2025-12-19", "status": "available"},
                {"date": "2026-01-02", "status": "available"}
            ],
            "program_fr": [
                "Jour 1-2: Le Marin - Sainte-Lucie",
                "Jour 3-4: Saint-Vincent",
                "Jour 5-6: Bequia",
                "Jour 7-8: Mustique",
                "Jour 9-10: Tobago Cays",
                "Jour 11-12: Union Island",
                "Jour 13-14: Retour Le Marin"
            ],
            "program_en": [
                "Day 1-2: Le Marin - Saint Lucia",
                "Day 3-4: Saint Vincent",
                "Day 5-6: Bequia",
                "Day 7-8: Mustique",
                "Day 9-10: Tobago Cays",
                "Day 11-12: Union Island",
                "Day 13-14: Return to Le Marin"
            ],
            "is_active": True,
            "order": 6,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.cruises.insert_many(cruises)
    
    # Add some sample community posts
    sample_posts = [
        {
            "id": str(uuid.uuid4()),
            "author_id": "sample_user_1",
            "author_name": "Marie D.",
            "author_avatar": None,
            "title": "Incroyable semaine en Corse du Sud!",
            "content": "Nous avons passé une semaine extraordinaire avec Nicolas et Maud. Les paysages sont à couper le souffle, Bonifacio est magnifique et les îles Lavezzi... un paradis! La cuisine à bord était délicieuse, tous les produits locaux. Je recommande vivement!",
            "image_url": None,
            "category": "trip_report",
            "likes": [],
            "comments": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "id": str(uuid.uuid4()),
            "author_id": "sample_user_2",
            "author_name": "Jean-Pierre L.",
            "author_avatar": None,
            "title": "Conseils pour préparer sa croisière",
            "content": "Après 3 croisières avec Sognudimare, voici mes conseils: 1) Apportez des chaussures d'eau, 2) N'oubliez pas la crème solaire bio, 3) Un sac étanche pour vos affaires lors des baignades. Le reste, l'équipage s'occupe de tout!",
            "image_url": None,
            "category": "tips",
            "likes": [],
            "comments": [],
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    await db.posts.insert_many(sample_posts)
    
    return {"message": "Database seeded successfully", "cruises_count": len(cruises), "posts_count": len(sample_posts)}

# ============= APPLY CORRECTIONS =============

@api_router.post("/apply-corrections")
async def apply_cruise_corrections():
    """Apply all user-requested corrections: fix programs, images, prices and delete unwanted cruises"""
    
    results = {
        "programs_updated": [],
        "images_updated": [],
        "prices_updated": [],
        "cruises_deleted": [],
        "errors": []
    }
    
    # 1. Delete "Grèce Authentique" and "Îles Grenadines" cruises
    try:
        delete_result = await db.cruises.delete_many({
            "name_fr": {"$in": ["Grèce Authentique", "Îles Grenadines"]}
        })
        results["cruises_deleted"].append(f"Deleted {delete_result.deleted_count} cruises (Grèce and Caraïbes)")
    except Exception as e:
        results["errors"].append(f"Error deleting cruises: {str(e)}")
    
    # 2. Update Tour de Corse - Program, Price (20480€ privatisation)
    tour_de_corse_program = [
        "JOUR 1 : AJACCIO & LES ÎLES SANGUINAIRES",
        "JOUR 2 : CARGÈSE",
        "JOUR 3 : LES CALANQUES DE PIANA & LE GOLFE DE PORTO",
        "JOUR 4 : LE PETIT VILLAGE DE GIROLATA",
        "JOUR 5 : LA RÉSERVE NATURELLE DE SCANDOLA & GALÉRIA",
        "JOUR 6 : LE GOLFE DE LA REVELATTA & CALVI",
        "JOUR 7 : LES PLAGES DE SALECCIA ET LE PORT DE SAINT FLORENT",
        "JOUR 8 : LA PLAGE DE NONZA & LE PORT DE CENTURI",
        "JOUR 9 : CAP CORSE, ERBALUNGA & BASTIA",
        "JOUR 10 : SOLENZARA",
        "JOUR 11 : PORTO VECCHIO & SANTA GIULIA",
        "JOUR 12 : BONIFACIO",
        "JOUR 13 : LA PLAGE DE ROCCAPINA & TIZZANO",
        "JOUR 14 : RETOUR SUR AJACCIO AVEC ARRÊT SUR CALA DI CONCA",
        "JOUR 15 : DEBARQUEMENT PORT TINO ROSSI À AJACCIO"
    ]
    
    try:
        result = await db.cruises.update_one(
            {"name_fr": "Tour de Corse"},
            {"$set": {
                "program_fr": tour_de_corse_program,
                "pricing.private_price": 20480,
                "boarding_pass_image": "https://static.wixstatic.com/media/ce6ce7_170fb96af2764aecb7eb7c526a48eb27~mv2.png/v1/fill/w_400,h_267,al_c,q_85,enc_avif,quality_auto/croisiere%20catamaran%20le%20tour%20de%20Corse%20sognudimare.png",
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            results["programs_updated"].append("Tour de Corse")
            results["prices_updated"].append("Tour de Corse (privatisation: 20480€)")
    except Exception as e:
        results["errors"].append(f"Error updating Tour de Corse: {str(e)}")
    
    # 3. Update Ouest Corse - Program and boarding pass image
    ouest_corse_program = [
        "JOUR 1 : AJACCIO & LES ÎLES SANGUINAIRES",
        "JOUR 2 : CARGÈSE & CALA DI PALU",
        "JOUR 3 : LES CALANQUES DE PIANA & FICAJOLA",
        "JOUR 4 : LE GOLFE DE PORTO & LE PETIT VILLAGE DE GIROLATA",
        "JOUR 5 : LA RÉSERVE NATURELLE DE SCANDOLA & GALÉRIA",
        "JOUR 6 : LE GOLFE DE LA REVELATTA & CALVI",
        "JOUR 7 : RETOUR SUR AJACCIO AVEC ARRÊT SUR LA PLAGE D'ARONE",
        "JOUR 8 : DEBARQUEMENT PORT TINO ROSSI À AJACCIO"
    ]
    
    try:
        result = await db.cruises.update_one(
            {"name_fr": "Ouest Corse"},
            {"$set": {
                "program_fr": ouest_corse_program,
                "boarding_pass_image": "https://static.wixstatic.com/media/ce6ce7_bdc5406402ea4be3b94eeeb747d2da1a~mv2.png/v1/fill/w_400,h_267,al_c,q_85,enc_avif,quality_auto/croisiere%20catamaran%20ouest%20corse%20sognudimare.png",
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            results["programs_updated"].append("Ouest Corse")
            results["images_updated"].append("Ouest Corse boarding pass")
    except Exception as e:
        results["errors"].append(f"Error updating Ouest Corse: {str(e)}")
    
    # 4. Update Corse du Sud - Program and boarding pass image
    corse_sud_program = [
        "JOUR 1 : AJACCIO & ANSE DE CACALU",
        "JOUR 2 : CAMPOMORO & ROCCAPINA",
        "JOUR 3 : ANSE D'ARBITRU (PLAGE D'ARGENT) & BONIFACIO",
        "JOUR 4 : SANT' AMANZA & CAVALLO",
        "JOUR 5 : LES ÎLES LAVEZZI",
        "JOUR 6 : GOLFE DE MURTOLI & TIZZANO",
        "JOUR 7 : RETOUR SUR AJACCIO AVEC ARRÊT SUR CALA DI CONCA",
        "JOUR 8 : DEBARQUEMENT PORT TINO ROSSI À AJACCIO"
    ]
    
    try:
        result = await db.cruises.update_one(
            {"name_fr": "Corse du Sud"},
            {"$set": {
                "program_fr": corse_sud_program,
                "boarding_pass_image": "https://static.wixstatic.com/media/ce6ce7_2c02fe160efb49b6930f0c695a53e34f~mv2.png/v1/fill/w_400,h_267,al_c,q_85,enc_avif,quality_auto/croisiere%20catamaran%20la%20corse%20du%20sud%20sognudimare.png",
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            results["programs_updated"].append("Corse du Sud")
            results["images_updated"].append("Corse du Sud boarding pass")
    except Exception as e:
        results["errors"].append(f"Error updating Corse du Sud: {str(e)}")
    
    # 5. Update Sardaigne & Corse du Sud - Program and boarding pass image
    sardaigne_program = [
        "JOUR 1 : AJACCIO & ANSE DE CACALU",
        "JOUR 2 : ROCCAPINA & BONIFACIO",
        "JOUR 3 : LES ÎLES LAVEZZI, L'ARCHIPEL DE LA MADDALENA & CALA GAVETTA",
        "JOUR 4 : CALA CRIS - CALA GRANU & PORTO CERVO (SARDAIGNE)",
        "JOUR 5 : L'ÎLE DE CAPRERA, CALA DI COTICCIO",
        "JOUR 6 : GOLFE DE MURTOLI & TIZZANO",
        "JOUR 7 : CALA DI CONCA & PROPRIANO",
        "JOUR 8 : DEBARQUEMENT PORT TINO ROSSI À AJACCIO"
    ]
    
    try:
        result = await db.cruises.update_one(
            {"name_fr": "Sardaigne & Corse du Sud"},
            {"$set": {
                "program_fr": sardaigne_program,
                "boarding_pass_image": "https://static.wixstatic.com/media/ce6ce7_68a8fb4c934c44cb909dfc0075f36d83~mv2.png/v1/fill/w_400,h_267,al_c,q_85,enc_avif,quality_auto/croisiere%20catamaran%20la%20sardaigne%20et%20la%20corse%20du%20sud%20sognudimare.png",
                "updated_at": datetime.utcnow()
            }}
        )
        if result.modified_count > 0:
            results["programs_updated"].append("Sardaigne & Corse du Sud")
            results["images_updated"].append("Sardaigne boarding pass")
    except Exception as e:
        results["errors"].append(f"Error updating Sardaigne: {str(e)}")
    
    return {
        "success": len(results["errors"]) == 0,
        "message": "Corrections applied successfully" if len(results["errors"]) == 0 else "Some errors occurred",
        "details": results
    }

# ============= UPDATE WITH DETAILED DATA =============

@api_router.post("/update-detailed-data")
async def update_cruises_with_detailed_data():
    """Update cruises with detailed availability and program data"""
    
    # Tour de Corse - Detailed Data
    tour_de_corse_availabilities = [
        {"date_range": "du 23 mai au 6 juin 2026", "price": 2560, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 13 au 27 juin 2026", "price": 2560, "status": "limited", "remaining_places": 4, "status_label": "Reste 4 places"},
        {"date_range": "du 27 juin au 11 juillet 2026", "price": 3150, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 11 au 25 juillet 2026", "price": 3150, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 25 juillet au 8 août 2026", "price": 3450, "status": "full", "remaining_places": 0, "status_label": "COMPLET"},
        {"date_range": "du 8 au 22 août 2026", "price": 3450, "status": "full", "remaining_places": 0, "status_label": "COMPLET"},
        {"date_range": "du 22 août au 5 septembre 2026", "price": 3450, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 5 au 19 septembre 2026", "price": 3150, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 19 septembre au 3 octobre 2026", "price": 2660, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
    ]
    
    tour_de_corse_program = [
        {"day": 1, "title": "Embarquement Ajaccio & Îles Sanguinaires", "description": "Embarquement au port Tino Rossi à partir de 15h30. Navigation vers les Îles Sanguinaires, site maritime classé offrant un refuge paisible à diverses espèces d'oiseaux marins."},
        {"day": 2, "title": "Cargèse", "description": "Découvrez la charmante commune de Cargèse. Flânez dans les ruelles pavées, découvrez les églises aux influences grecques et latines qui témoignent du passé singulier de ce village."},
        {"day": 3, "title": "Calanques de Piana & Golfe de Porto", "description": "Admirez les falaises impressionnantes des Calanques de Piana avec leurs teintes rougeâtres. Le Golfe de Porto, classé au patrimoine mondial de l'UNESCO, offre une beauté naturelle à son apogée."},
        {"day": 4, "title": "Village de Girolata", "description": "Découverte du charmant village de Girolata, accessible uniquement par bateau. Laissez-vous séduire par ses maisons de pierre aux toits de lauze et son atmosphère paisible."},
        {"day": 5, "title": "Réserve de Scandola & Galéria", "description": "Navigation jusqu'au cap le plus à l'ouest de la Corse. La réserve naturelle de Scandola, unique en son genre, englobe des environnements marins et terrestres avec une palette exceptionnelle de couleurs."},
        {"day": 6, "title": "Golfe de la Revelatta & Calvi", "description": "Snorkeling et paddle dans les eaux cristallines du Golfe de la Revelatta. Arrivée au port de Calvi avec la vue majestueuse de sa citadelle."},
        {"day": 7, "title": "Plages de Saleccia & Saint-Florent", "description": "Les plages de Saleccia, parmi les plus belles de la Méditerranée. Sable blanc bordé d'eaux turquoises. Direction le port de Saint-Florent."},
        {"day": 8, "title": "Plage de Nonza & Port de Centuri", "description": "Plage de Nonza réputée pour son sable noir et ses falaises imposantes. Découverte du pittoresque port de Centuri, petit port de pêche traditionnel."},
        {"day": 9, "title": "Cap Corse, Erbalunga & Bastia", "description": "Périple le long du Cap Corse, péninsule sauvage et préservée. Visite d'Erbalunga, charmant village de pêcheurs, puis Bastia avec sa citadelle génoise."},
        {"day": 10, "title": "Solenzara", "description": "Solenzara, réputée pour ses plages de sable fin et ses eaux turquoises. Paddle, snorkeling et exploration du charmant centre-ville."},
        {"day": 11, "title": "Porto-Vecchio & Santa Giulia", "description": "Porto-Vecchio, ville emblématique avec ses plages de sable blanc et criques isolées. Promenade dans le centre historique avec ses ruelles pittoresques."},
        {"day": 12, "title": "Bonifacio", "description": "Bonifacio, ville fascinante perchée au sommet de falaises calcaires spectaculaires. Découverte de l'Escalier du Roi d'Aragon et de la citadelle médiévale."},
        {"day": 13, "title": "Plage de Roccapina & Tizzano", "description": "Plage de Roccapina, étendue de sable doré bordée par des falaises de granit rose. Déjeuner à Tizzano avec ses spécialités de fruits de mer."},
        {"day": 14, "title": "Retour Ajaccio via Cala di Conca", "description": "Arrêt à la plage de Cala di Conca, crique sauvage aux eaux turquoises. Dernière nuit à bord au port de Tino Rossi à Ajaccio."},
        {"day": 15, "title": "Débarquement Ajaccio", "description": "Dernier petit-déjeuner à bord. Débarquement à 8h30 au port de Tino Rossi."},
    ]
    
    # Corse du Sud - Detailed Data
    corse_sud_availabilities = [
        {"date_range": "du 2 au 9 mai 2026", "price": 1470, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 9 au 16 mai 2026", "price": 1470, "status": "full", "remaining_places": 0, "status_label": "COMPLET"},
        {"date_range": "du 6 au 13 juin 2026", "price": 1670, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 27 juin au 4 juillet 2026", "price": 1970, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 4 au 11 juillet 2026", "price": 1970, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 11 au 18 juillet 2026", "price": 1970, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 25 juillet au 1er août 2026", "price": 2070, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 1er au 8 août 2026", "price": 2070, "status": "limited", "remaining_places": 4, "status_label": "Reste 4 places"},
        {"date_range": "du 8 au 15 août 2026", "price": 2070, "status": "full", "remaining_places": 0, "status_label": "COMPLET"},
        {"date_range": "du 15 au 22 août 2026", "price": 2170, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 22 au 29 août 2026", "price": 2170, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 29 août au 5 septembre 2026", "price": 2070, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 5 au 12 septembre 2026", "price": 1870, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 12 au 19 septembre 2026", "price": 1770, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 19 au 26 septembre 2026", "price": 1770, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
        {"date_range": "du 26 septembre au 3 octobre 2026", "price": 1470, "status": "available", "remaining_places": 8, "status_label": "Reste 8 places"},
    ]
    
    # Ouest Corse - Same dates as Corse du Sud
    ouest_corse_availabilities = corse_sud_availabilities.copy()
    
    # Sardaigne & Corse du Sud - Same dates as Corse du Sud
    sardaigne_availabilities = corse_sud_availabilities.copy()
    
    # Update Tour de Corse
    await db.cruises.update_one(
        {"name_fr": "Tour de Corse"},
        {"$set": {
            "availabilities": tour_de_corse_availabilities,
            "detailed_program_fr": tour_de_corse_program,
            "pricing": {"cabin_price": 2560, "private_price": 12900, "currency": "EUR"},
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Update Corse du Sud
    await db.cruises.update_one(
        {"name_fr": "Corse du Sud"},
        {"$set": {
            "availabilities": corse_sud_availabilities,
            "pricing": {"cabin_price": 1470, "private_price": 11900, "currency": "EUR"},
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Update Ouest Corse
    await db.cruises.update_one(
        {"name_fr": "Ouest Corse"},
        {"$set": {
            "availabilities": ouest_corse_availabilities,
            "pricing": {"cabin_price": 1470, "private_price": 11900, "currency": "EUR"},
            "updated_at": datetime.utcnow()
        }}
    )
    
    # Update Sardaigne & Corse du Sud
    await db.cruises.update_one(
        {"name_fr": "Sardaigne & Corse du Sud"},
        {"$set": {
            "availabilities": sardaigne_availabilities,
            "pricing": {"cabin_price": 1470, "private_price": 11900, "currency": "EUR"},
            "updated_at": datetime.utcnow()
        }}
    )
    
    return {"message": "Cruises updated with detailed data successfully"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

# ============= SQUARE PAYMENT MODELS =============

class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class CreatePaymentRequest(BaseModel):
    """Request to create a payment"""
    source_id: str  # Card nonce from Square Web Payments SDK
    amount: int  # Amount in cents (EUR)
    currency: str = "EUR"
    cruise_id: str
    cruise_name: str
    customer_email: str
    customer_name: str
    passengers: int = 2
    selected_date: Optional[str] = None
    booking_type: str = "cabin"  # "cabin" or "private"
    note: Optional[str] = None

class PaymentRecord(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    square_payment_id: Optional[str] = None
    amount: int
    currency: str = "EUR"
    status: PaymentStatus = PaymentStatus.PENDING
    cruise_id: str
    cruise_name: str
    customer_email: str
    customer_name: str
    passengers: int
    selected_date: Optional[str] = None
    booking_type: str
    note: Optional[str] = None
    receipt_url: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

# ============= SQUARE PAYMENT ENDPOINTS =============

@api_router.get("/payments/config")
async def get_payment_config():
    """Get Square payment configuration for frontend"""
    return {
        "application_id": os.environ.get('SQUARE_APPLICATION_ID', ''),
        "location_id": os.environ.get('SQUARE_LOCATION_ID', ''),
        "environment": os.environ.get('SQUARE_ENVIRONMENT', 'sandbox')
    }

@api_router.post("/payments/create")
async def create_payment(payment_request: CreatePaymentRequest):
    """Process a payment using Square Payments API"""
    try:
        sq_client = get_square_client()
        payments_api = sq_client.payments
        
        # Create idempotency key to prevent duplicate charges
        idempotency_key = str(uuid.uuid4())
        
        # Create the payment request body
        body = {
            "source_id": payment_request.source_id,
            "idempotency_key": idempotency_key,
            "amount_money": {
                "amount": payment_request.amount,
                "currency": payment_request.currency
            },
            "location_id": square_location_id,
            "note": f"Croisière: {payment_request.cruise_name} - {payment_request.booking_type} - {payment_request.passengers} passagers",
            "buyer_email_address": payment_request.customer_email,
            "reference_id": f"cruise-{payment_request.cruise_id}-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        }
        
        # Call Square Payments API
        result = payments_api.create_payment(body)
        
        if result.is_success():
            payment = result.body.get("payment", {})
            
            # Save payment record to database
            payment_record = {
                "id": str(uuid.uuid4()),
                "square_payment_id": payment.get("id"),
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "status": PaymentStatus.COMPLETED,
                "cruise_id": payment_request.cruise_id,
                "cruise_name": payment_request.cruise_name,
                "customer_email": payment_request.customer_email,
                "customer_name": payment_request.customer_name,
                "passengers": payment_request.passengers,
                "selected_date": payment_request.selected_date,
                "booking_type": payment_request.booking_type,
                "note": payment_request.note,
                "receipt_url": payment.get("receipt_url"),
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.payments.insert_one(payment_record)
            
            return {
                "success": True,
                "payment_id": payment.get("id"),
                "receipt_url": payment.get("receipt_url"),
                "status": payment.get("status"),
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "message": "Paiement réussi ! Votre réservation est confirmée."
            }
        else:
            # Payment failed
            errors = result.errors
            error_message = errors[0].get("detail", "Payment failed") if errors else "Unknown error"
            
            # Save failed payment record
            payment_record = {
                "id": str(uuid.uuid4()),
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "status": PaymentStatus.FAILED,
                "cruise_id": payment_request.cruise_id,
                "cruise_name": payment_request.cruise_name,
                "customer_email": payment_request.customer_email,
                "customer_name": payment_request.customer_name,
                "passengers": payment_request.passengers,
                "error_message": error_message,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            await db.payments.insert_one(payment_record)
            
            raise HTTPException(status_code=400, detail=error_message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Payment error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur de paiement: {str(e)}")

@api_router.get("/payments/{payment_id}")
async def get_payment(payment_id: str):
    """Get payment details by ID"""
    payment = await db.payments.find_one({"square_payment_id": payment_id})
    if not payment:
        payment = await db.payments.find_one({"id": payment_id})
    
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    payment["_id"] = str(payment["_id"])
    return payment

@api_router.get("/payments/customer/{email}")
async def get_customer_payments(email: str):
    """Get all payments for a customer by email"""
    payments = await db.payments.find({"customer_email": email}).sort("created_at", -1).to_list(length=100)
    
    for payment in payments:
        payment["_id"] = str(payment["_id"])
    
    return {"payments": payments, "count": len(payments)}

@api_router.post("/payments/{payment_id}/refund")
async def refund_payment(payment_id: str, amount: Optional[int] = None):
    """Refund a payment (full or partial)"""
    try:
        # Get payment record
        payment = await db.payments.find_one({"square_payment_id": payment_id})
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
        
        if payment.get("status") != PaymentStatus.COMPLETED:
            raise HTTPException(status_code=400, detail="Only completed payments can be refunded")
        
        sq_client = get_square_client()
        refunds_api = sq_client.refunds
        
        refund_amount = amount if amount else payment.get("amount")
        
        body = {
            "idempotency_key": str(uuid.uuid4()),
            "payment_id": payment_id,
            "amount_money": {
                "amount": refund_amount,
                "currency": payment.get("currency", "EUR")
            },
            "reason": "Customer requested refund"
        }
        
        result = refunds_api.refund_payment(body)
        
        if result.is_success():
            refund = result.body.get("refund", {})
            
            # Update payment record
            await db.payments.update_one(
                {"square_payment_id": payment_id},
                {"$set": {
                    "status": PaymentStatus.REFUNDED,
                    "refund_id": refund.get("id"),
                    "refunded_amount": refund_amount,
                    "updated_at": datetime.utcnow()
                }}
            )
            
            return {
                "success": True,
                "refund_id": refund.get("id"),
                "status": refund.get("status"),
                "amount": refund_amount,
                "message": "Remboursement effectué avec succès"
            }
        else:
            errors = result.errors
            error_message = errors[0].get("detail", "Refund failed") if errors else "Unknown error"
            raise HTTPException(status_code=400, detail=error_message)
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Refund error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Erreur de remboursement: {str(e)}")
