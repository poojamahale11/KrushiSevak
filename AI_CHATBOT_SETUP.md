# KrushiSevak AI Assistant setup

This project keeps the existing KrushiSevak features and replaces the old keyword-based chat replies with a real OpenAI pre-trained model.

## 1. Install backend dependencies

Open a terminal in `backend`:

```powershell
npm install
```

## 2. Add your API key

Open `backend/.env` and set:

```text
OPENAI_API_KEY=YOUR_OPENAI_API_KEY
OPENAI_MODEL=gpt-5.6-luna
```

Never commit `.env` or share the API key.

## 3. Start backend

```powershell
npm start
```

## 4. Start frontend in a second terminal

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite localhost URL.

## What the assistant supports

- General agriculture and farming questions
- Crop cultivation, irrigation, soil, fertilizer and seed guidance
- Pest and disease information (the separate trained disease model is NOT integrated yet)
- Weather-related farming guidance
- Agricultural product and Kendra questions
- Marketplace usage and price/unit calculations
- Customer/general questions
- English, Hindi and Marathi
- Text input
- Browser voice-to-text input
- Image input for general visual discussion
- Conversation context for logged-in users
- MongoDB chat history for logged-in users

## Important

The chatbot is a general AI assistant. It is not a 100% guaranteed source of agricultural truth. For pesticide/medicine use, users should verify the approved product label and local expert guidance. The dedicated crop-disease model can be integrated later without replacing this chatbot.
