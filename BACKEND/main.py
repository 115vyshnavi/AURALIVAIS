import asyncio
import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import vertexai
from vertexai.generative_models import GenerativeModel
from dotenv import load_dotenv

load_dotenv()

# Initialize Vertex AI
project_id = os.getenv("GCP_PROJECT_ID")
location = os.getenv("GCP_LOCATION", "us-central1")
if project_id:
    vertexai.init(project=project_id, location=location)

app = FastAPI(title="AURALIVAIS Backend API")

# Enable CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Models
class CartItem(BaseModel):
    id: int
    name: str
    price: float
    quantity: int

class PaymentRequest(BaseModel):
    items: list[CartItem]
    total: float

class ChatRequest(BaseModel):
    message: str

class ContactRequest(BaseModel):
    name: str
    email: str
    subject: str
    message: str

# Ultra-Premium Product Data
PRODUCTS = [
    {
        "id": 1,
        "name": "The Noir Silhouette Gown",
        "price": 4200.00,
        "image": "img/gown.png",
        "gallery": [
            "img/gown.png",
            "img/gown.png",
            "img/gown.png"
        ],
        "description": "Exquisitely tailored from heavy crepe silk, featuring a dramatic plunge and architectural lines."
    },
    {
        "id": 2,
        "name": "Lumière Crystal Clutch",
        "price": 2850.00,
        "image": "img/clutch.png",
        "gallery": [
            "img/clutch.png",
            "img/clutch.png",
            "img/clutch.png"
        ],
        "description": "Hand-set with thousands of micro-crystals on a 24k gold-plated brass frame."
    },
    {
        "id": 3,
        "name": "Elysian Double-Breasted Coat",
        "price": 5400.00,
        "image": "img/coat.png",
        "gallery": [
            "img/coat.png",
            "img/coat.png",
            "img/coat.png"
        ],
        "description": "Crafted in the heart of Italy from pure vicuña wool, offering unparalleled softness."
    },
    {
        "id": 4,
        "name": "Monogram Silk Scarf",
        "price": 650.00,
        "image": "img/scarf.png",
        "gallery": [
            "img/scarf.png",
            "img/scarf.png",
            "img/scarf.png"
        ],
        "description": "100% Mulberry silk with hand-rolled edges, featuring the signature AURALIVAIS motif."
    },
    {
        "id": 5,
        "name": "Aura Chronograph Timepiece",
        "price": 12500.00,
        "image": "img/watch.png",
        "gallery": [
            "img/watch.png",
            "img/watch.png",
            "img/watch.png"
        ],
        "description": "A masterpiece of horology. Rose gold casing with a midnight blue guilloché dial."
    },
    {
        "id": 6,
        "name": "Vanguard Leather Boots",
        "price": 1800.00,
        "image": "img/boots.png",
        "gallery": [
            "img/boots.png",
            "img/boots.png",
            "img/boots.png"
        ],
        "description": "Sculptural heels and buttery calfskin leather, designed for the modern muse."
    },
    {
        "id": 7,
        "name": "Obsidian Tuxedo Jacket",
        "price": 3100.00,
        "image": "img/tuxedo.png",
        "gallery": [
            "img/tuxedo.png",
            "img/tuxedo.png",
            "img/tuxedo.png"
        ],
        "description": "Impeccably tailored with silk lapels and a sharp, structured shoulder."
    },
    {
        "id": 8,
        "name": "Alabaster Tote Bag",
        "price": 2200.00,
        "image": "img/tote.png",
        "gallery": [
            "img/tote.png",
            "img/tote.png",
            "img/tote.png"
        ],
        "description": "Spacious and elegant, crafted from full-grain textured calf leather with gold hardware."
    }
]

# Endpoints
@app.get("/products")
async def get_products():
    return PRODUCTS

@app.post("/process-payment")
async def process_payment(payment: PaymentRequest):
    # Simulate a sophisticated payment flow
    await asyncio.sleep(2.5)
    return {"status": "success", "message": "Transaction authorized. Welcome to the AURALIVAIS family."}

@app.post("/contact-submit")
async def contact_submit(request: ContactRequest):
    # Simulate processing the contact form
    await asyncio.sleep(1)
    return {
        "status": "success", 
        "message": f"Thank you, {request.name}. Your inquiry has been received by our client advisory team."
    }

@app.post("/chat")
async def chat_with_concierge(request: ChatRequest):
    msg = request.message
    
    try:
        # Check if vertex is configured
        if not project_id:
            return {"response": "System Notice: Vertex AI is not configured. Please set GCP_PROJECT_ID and GOOGLE_APPLICATION_CREDENTIALS in your .env file."}

        # Prepare catalog context
        product_context = json.dumps([{"name": p["name"], "price": p["price"], "description": p["description"]} for p in PRODUCTS])
        
        prompt = f"""
        You are the exclusive styling concierge for AURALIVAIS, an ultra-premium luxury fashion brand. 
        You are polite, elegant, and highly knowledgeable.
        
        Here is our current catalog of products:
        {product_context}
        
        Instructions:
        1. Answer the user's questions strictly based on the catalog and brand ethos.
        2. Do not recommend products from other brands.
        3. Keep your response concise, luxurious, and extremely helpful.
        
        User's message: "{msg}"
        """
        
        model = GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        return {"response": response.text}
        
    except Exception as e:
        print(f"Vertex AI Error: {e}")
        # Fallback error message if credentials fail
        return {"response": "Thank you for your inquiry. Our stylists are experiencing high volume. Please ensure your Google Cloud credentials are valid and try again."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
