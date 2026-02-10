from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse
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
from square import Square
from square.environment import SquareEnvironment

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db_name = os.environ.get('DB_NAME', 'sognudimare')
db = client[db_name]

# Square Payment client
square_client = None
square_location_id = os.environ.get('SQUARE_LOCATION_ID', '').strip()

def get_square_client():
    global square_client
    if square_client is None:
        access_token = os.environ.get('SQUARE_ACCESS_TOKEN', '').strip()
        environment = os.environ.get('SQUARE_ENVIRONMENT', 'sandbox').strip()
        env = SquareEnvironment.SANDBOX if environment == 'sandbox' else SquareEnvironment.PRODUCTION
        square_client = Square(token=access_token, environment=env)
    return square_client

# Create the main app
app = FastAPI(title="Sognudimare API", version="1.0.0")

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
class CruiseAvailability(BaseModel):
    date_range: str
    price: float
    status: AvailabilityStatus = AvailabilityStatus.AVAILABLE
    remaining_places: Optional[int] = None
    status_label: Optional[str] = None

class CruisePricing(BaseModel):
    cabin_price: Optional[float] = None
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
    availabilities: List[CruiseAvailability] = []
    program_fr: List[str] = []
    program_en: List[str] = []
    boarding_pass_image: Optional[str] = None
    is_active: bool = True
    order: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class CreatePaymentRequest(BaseModel):
    source_id: str
    amount: int
    currency: str = "EUR"
    cruise_id: str
    cruise_name: str
    customer_email: str
    customer_name: str
    passengers: int = 2
    selected_date: Optional[str] = None
    booking_type: str = "cabin"
    note: Optional[str] = None

# ============= API ROUTES =============

@api_router.get("/")
async def root():
    return {"message": "Bienvenue sur l'API Sognudimare!", "status": "online"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

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

@api_router.get("/payments/config")
async def get_payment_config():
    return {
        "application_id": os.environ.get('SQUARE_APPLICATION_ID', '').strip(),
        "location_id": os.environ.get('SQUARE_LOCATION_ID', '').strip(),
        "environment": os.environ.get('SQUARE_ENVIRONMENT', 'sandbox').strip()
    }

@api_router.post("/payments/create")
async def create_payment(payment_request: CreatePaymentRequest):
    try:
        sq_client = get_square_client()
        idempotency_key = str(uuid.uuid4())
        result = sq_client.payments.create(
            source_id=payment_request.source_id,
            idempotency_key=idempotency_key,
            amount_money={"amount": payment_request.amount, "currency": payment_request.currency},
            location_id=square_location_id,
            note=f"Croisiere: {payment_request.cruise_name}",
            buyer_email_address=payment_request.customer_email
        )
        if result.payment:
            payment = result.payment
            payment_record = {
                "id": str(uuid.uuid4()),
                "square_payment_id": payment.id,
                "amount": payment_request.amount,
                "currency": payment_request.currency,
                "status": "COMPLETED",
                "cruise_id": payment_request.cruise_id,
                "cruise_name": payment_request.cruise_name,
                "customer_email": payment_request.customer_email,
                "customer_name": payment_request.customer_name,
                "passengers": payment_request.passengers,
                "booking_type": payment_request.booking_type,
                "selected_date": payment_request.selected_date,
                "created_at": datetime.utcnow()
            }
            await db.payments.insert_one(payment_record)
            return {"success": True, "payment_id": payment.id, "receipt_url": payment.receipt_url}
        raise HTTPException(status_code=400, detail="Payment failed")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Seed data endpoint
@api_router.post("/seed")
async def seed_data():
    """Initialize database with the 4 cruises"""
    
    cruises_data = [
        {
            "id": "tour-de-corse",
            "name_fr": "Tour de Corse",
            "name_en": "Tour of Corsica",
            "subtitle_fr": "L'Inoubliable",
            "subtitle_en": "The Unforgettable",
            "description_fr": "Découvrez toute la beauté de la Corse lors de cette croisière exceptionnelle de 2 semaines. Des plages paradisiaques aux montagnes majestueuses, vivez une aventure inoubliable.",
            "description_en": "Discover all the beauty of Corsica during this exceptional 2-week cruise. From paradise beaches to majestic mountains, live an unforgettable adventure.",
            "image_url": "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=800",
            "destination": "Corse",
            "cruise_type": "both",
            "duration": "14 jours",
            "departure_port": "Ajaccio - Port Tino Rossi",
            "pricing": {"cabin_price": 2900, "private_price": 14900, "currency": "EUR"},
            "highlights_fr": ["Tour complet de l'île", "Réserve de Scandola", "Bonifacio", "Cap Corse", "Calvi"],
            "highlights_en": ["Complete island tour", "Scandola Reserve", "Bonifacio", "Cap Corse", "Calvi"],
            "availabilities": [
                {"date_range": "du 23 mai au 6 juin 2026", "price": 2900, "status": "available"},
                {"date_range": "du 6 juin au 20 juin 2026", "price": 2900, "status": "available"},
                {"date_range": "du 20 juin au 4 juillet 2026", "price": 3200, "status": "limited", "remaining_places": 4},
                {"date_range": "du 4 juillet au 18 juillet 2026", "price": 3200, "status": "available"},
                {"date_range": "du 18 juillet au 1 août 2026", "price": 3500, "status": "available"},
                {"date_range": "du 1 août au 15 août 2026", "price": 3500, "status": "full", "status_label": "COMPLET"},
                {"date_range": "du 15 août au 29 août 2026", "price": 3500, "status": "available"},
                {"date_range": "du 29 août au 12 septembre 2026", "price": 2900, "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Accueil à Ajaccio - Installation à bord",
                "Jour 2: Navigation vers les îles Sanguinaires",
                "Jour 3: Découverte de Girolata",
                "Jour 4: Réserve naturelle de Scandola",
                "Jour 5: Calvi et sa citadelle",
                "Jour 6: Saint-Florent et le Cap Corse",
                "Jour 7: Bastia - Journée culturelle",
                "Jour 8: Côte Est - Plages sauvages",
                "Jour 9: Porto-Vecchio",
                "Jour 10: Les îles Lavezzi",
                "Jour 11: Bonifacio - Ville haute",
                "Jour 12: Propriano et le golfe du Valinco",
                "Jour 13: Retour vers Ajaccio",
                "Jour 14: Débarquement - Fin de la croisière"
            ],
            "program_en": [
                "Day 1: Welcome in Ajaccio - Board installation",
                "Day 2: Sailing to Sanguinaires islands",
                "Day 3: Discovery of Girolata",
                "Day 4: Scandola Nature Reserve",
                "Day 5: Calvi and its citadel",
                "Day 6: Saint-Florent and Cap Corse",
                "Day 7: Bastia - Cultural day",
                "Day 8: East Coast - Wild beaches",
                "Day 9: Porto-Vecchio",
                "Day 10: Lavezzi islands",
                "Day 11: Bonifacio - Upper town",
                "Day 12: Propriano and Valinco Gulf",
                "Day 13: Return to Ajaccio",
                "Day 14: Disembarkation - End of cruise"
            ],
            "is_active": True,
            "order": 1
        },
        {
            "id": "corse-du-sud",
            "name_fr": "Corse du Sud",
            "name_en": "South Corsica",
            "subtitle_fr": "La Radieuse",
            "subtitle_en": "The Radiant",
            "description_fr": "Explorez les trésors du sud de la Corse : Bonifacio, les îles Lavezzi, Porto-Vecchio et leurs eaux turquoise. Une semaine de pure détente.",
            "description_en": "Explore the treasures of southern Corsica: Bonifacio, the Lavezzi islands, Porto-Vecchio and their turquoise waters. A week of pure relaxation.",
            "image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800",
            "destination": "Corse du Sud",
            "cruise_type": "both",
            "duration": "8 jours",
            "departure_port": "Ajaccio - Port Tino Rossi",
            "pricing": {"cabin_price": 1900, "private_price": 8900, "currency": "EUR"},
            "highlights_fr": ["Bonifacio", "Îles Lavezzi", "Porto-Vecchio", "Plages paradisiaques"],
            "highlights_en": ["Bonifacio", "Lavezzi Islands", "Porto-Vecchio", "Paradise beaches"],
            "availabilities": [
                {"date_range": "du 23 mai au 30 mai 2026", "price": 1900, "status": "available"},
                {"date_range": "du 30 mai au 6 juin 2026", "price": 1900, "status": "available"},
                {"date_range": "du 6 juin au 13 juin 2026", "price": 2100, "status": "available"},
                {"date_range": "du 13 juin au 20 juin 2026", "price": 2100, "status": "limited", "remaining_places": 2},
                {"date_range": "du 20 juin au 27 juin 2026", "price": 2300, "status": "available"},
                {"date_range": "du 27 juin au 4 juillet 2026", "price": 2300, "status": "available"},
                {"date_range": "du 4 juillet au 11 juillet 2026", "price": 2500, "status": "available"},
                {"date_range": "du 11 juillet au 18 juillet 2026", "price": 2500, "status": "full", "status_label": "COMPLET"}
            ],
            "program_fr": [
                "Jour 1: Accueil à Ajaccio - Briefing et installation",
                "Jour 2: Navigation vers Propriano",
                "Jour 3: Découverte de Campomoro",
                "Jour 4: Bonifacio - Visite de la citadelle",
                "Jour 5: Îles Lavezzi - Snorkeling",
                "Jour 6: Porto-Vecchio et Santa Giulia",
                "Jour 7: Retour tranquille vers Ajaccio",
                "Jour 8: Débarquement"
            ],
            "program_en": [
                "Day 1: Welcome in Ajaccio - Briefing and installation",
                "Day 2: Sailing to Propriano",
                "Day 3: Discovery of Campomoro",
                "Day 4: Bonifacio - Citadel visit",
                "Day 5: Lavezzi Islands - Snorkeling",
                "Day 6: Porto-Vecchio and Santa Giulia",
                "Day 7: Relaxed return to Ajaccio",
                "Day 8: Disembarkation"
            ],
            "is_active": True,
            "order": 2
        },
        {
            "id": "ouest-corse",
            "name_fr": "Ouest Corse",
            "name_en": "West Corsica",
            "subtitle_fr": "L'Indomptée",
            "subtitle_en": "The Untamed",
            "description_fr": "Naviguez le long de la côte ouest sauvage de la Corse. Scandola, Girolata, Calvi... des paysages à couper le souffle vous attendent.",
            "description_en": "Sail along the wild west coast of Corsica. Scandola, Girolata, Calvi... breathtaking landscapes await you.",
            "image_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?w=800",
            "destination": "Ouest Corse",
            "cruise_type": "both",
            "duration": "8 jours",
            "departure_port": "Ajaccio - Port Tino Rossi",
            "pricing": {"cabin_price": 1900, "private_price": 8900, "currency": "EUR"},
            "highlights_fr": ["Réserve de Scandola", "Girolata", "Calvi", "Côte sauvage"],
            "highlights_en": ["Scandola Reserve", "Girolata", "Calvi", "Wild coast"],
            "availabilities": [
                {"date_range": "du 23 mai au 30 mai 2026", "price": 1900, "status": "available"},
                {"date_range": "du 30 mai au 6 juin 2026", "price": 1900, "status": "limited", "remaining_places": 3},
                {"date_range": "du 6 juin au 13 juin 2026", "price": 2100, "status": "available"},
                {"date_range": "du 13 juin au 20 juin 2026", "price": 2100, "status": "available"},
                {"date_range": "du 20 juin au 27 juin 2026", "price": 2300, "status": "available"},
                {"date_range": "du 27 juin au 4 juillet 2026", "price": 2300, "status": "full", "status_label": "COMPLET"},
                {"date_range": "du 4 juillet au 11 juillet 2026", "price": 2500, "status": "available"},
                {"date_range": "du 11 juillet au 18 juillet 2026", "price": 2500, "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Accueil à Ajaccio",
                "Jour 2: Îles Sanguinaires et Capo di Feno",
                "Jour 3: Porto et ses calanques",
                "Jour 4: Réserve de Scandola",
                "Jour 5: Girolata - Village inaccessible",
                "Jour 6: Calvi et l'Île-Rousse",
                "Jour 7: Retour par la côte",
                "Jour 8: Débarquement à Ajaccio"
            ],
            "program_en": [
                "Day 1: Welcome in Ajaccio",
                "Day 2: Sanguinaires Islands and Capo di Feno",
                "Day 3: Porto and its creeks",
                "Day 4: Scandola Reserve",
                "Day 5: Girolata - Inaccessible village",
                "Day 6: Calvi and Île-Rousse",
                "Day 7: Return along the coast",
                "Day 8: Disembarkation in Ajaccio"
            ],
            "is_active": True,
            "order": 3
        },
        {
            "id": "sardaigne-corse-sud",
            "name_fr": "Sardaigne et Corse du Sud",
            "name_en": "Sardinia and South Corsica",
            "subtitle_fr": "La Sublime",
            "subtitle_en": "The Sublime",
            "description_fr": "Une croisière unique entre deux îles. Découvrez la Costa Smeralda en Sardaigne et les merveilles du sud de la Corse.",
            "description_en": "A unique cruise between two islands. Discover the Costa Smeralda in Sardinia and the wonders of southern Corsica.",
            "image_url": "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=800",
            "destination": "Sardaigne & Corse",
            "cruise_type": "both",
            "duration": "8 jours",
            "departure_port": "Ajaccio - Port Tino Rossi",
            "pricing": {"cabin_price": 2200, "private_price": 9900, "currency": "EUR"},
            "highlights_fr": ["Costa Smeralda", "Archipel de la Maddalena", "Bonifacio", "Îles Lavezzi"],
            "highlights_en": ["Costa Smeralda", "Maddalena Archipelago", "Bonifacio", "Lavezzi Islands"],
            "availabilities": [
                {"date_range": "du 23 mai au 30 mai 2026", "price": 2200, "status": "available"},
                {"date_range": "du 30 mai au 6 juin 2026", "price": 2200, "status": "available"},
                {"date_range": "du 6 juin au 13 juin 2026", "price": 2400, "status": "available"},
                {"date_range": "du 13 juin au 20 juin 2026", "price": 2400, "status": "available"},
                {"date_range": "du 20 juin au 27 juin 2026", "price": 2600, "status": "limited", "remaining_places": 2},
                {"date_range": "du 27 juin au 4 juillet 2026", "price": 2600, "status": "available"},
                {"date_range": "du 4 juillet au 11 juillet 2026", "price": 2800, "status": "full", "status_label": "COMPLET"},
                {"date_range": "du 11 juillet au 18 juillet 2026", "price": 2800, "status": "available"}
            ],
            "program_fr": [
                "Jour 1: Accueil à Ajaccio",
                "Jour 2: Navigation vers Bonifacio",
                "Jour 3: Traversée vers la Sardaigne",
                "Jour 4: Archipel de la Maddalena",
                "Jour 5: Costa Smeralda",
                "Jour 6: Retour vers les Lavezzi",
                "Jour 7: Bonifacio - Journée libre",
                "Jour 8: Retour à Ajaccio - Débarquement"
            ],
            "program_en": [
                "Day 1: Welcome in Ajaccio",
                "Day 2: Sailing to Bonifacio",
                "Day 3: Crossing to Sardinia",
                "Day 4: Maddalena Archipelago",
                "Day 5: Costa Smeralda",
                "Day 6: Return to Lavezzi",
                "Day 7: Bonifacio - Free day",
                "Day 8: Return to Ajaccio - Disembarkation"
            ],
            "is_active": True,
            "order": 4
        }
    ]
    
    # Clear existing cruises and insert new ones
    await db.cruises.delete_many({})
    for cruise in cruises_data:
        cruise["created_at"] = datetime.utcnow()
        cruise["updated_at"] = datetime.utcnow()
        await db.cruises.insert_one(cruise)
    
    return {"message": f"Database seeded with {len(cruises_data)} cruises"}

# Include the router
app.include_router(api_router)

# Add CORS middleware - Allow all origins for Wix integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
