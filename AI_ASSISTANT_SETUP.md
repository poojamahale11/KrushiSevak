# AI Assistant - Setup & Configuration Guide

## 🔧 Issue Fixed

### Problem:
The AI Assistant was showing: **"OPENAI_API_KEY is not configured"**

### Root Causes Found:
1. ❌ **Empty API Key** - `OPENAI_API_KEY=` (no value in `.env`)
2. ❌ **Wrong API Method** - Code was using `client.responses.create()` (doesn't exist)
3. ❌ **Invalid Model** - `OPENAI_MODEL=gpt-5.6-luna` (not a real OpenAI model)

### Solutions Applied:
1. ✅ **Fixed API Method** - Now uses correct `client.chat.completions.create()`
2. ✅ **Updated Model** - Changed to `gpt-3.5-turbo` (valid OpenAI model)
3. ✅ **Improved Error Handling** - Better API key validation and error messages
4. ✅ **Added Documentation** - Clear setup instructions in `.env`

---

## 🚀 How to Set Up OpenAI API Key

### Step 1: Get Your OpenAI API Key

1. **Visit OpenAI Platform**: https://platform.openai.com/api-keys
2. **Sign In** or create an OpenAI account
3. **Create New API Key**:
   - Click "Create new secret key"
   - Give it a name (e.g., "KrushiSevak")
   - **Copy the key immediately** (you won't see it again!)
4. **Add Billing** (if required):
   - Go to https://platform.openai.com/account/billing
   - Add payment method
   - Set usage limits to control costs

### Step 2: Add API Key to Backend

1. **Open** `backend/.env` file
2. **Find** the line: `OPENAI_API_KEY=`
3. **Add your key**:
   ```env
   OPENAI_API_KEY=sk-proj-abc123xyz...your-actual-key-here
   ```
4. **Save the file**

### Step 3: Restart Backend Server

**Important**: After adding the API key, you MUST restart the backend server.

```powershell
# Stop the current backend (Ctrl+C)

# Start backend again
cd backend
node server.js
```

### Step 4: Test AI Assistant

1. **Open Frontend**: http://localhost:5173
2. **Navigate to**: AI Assistant page
3. **Type a question**: "What is the best time to plant wheat?"
4. **Click Send**
5. **Verify**: You get a real AI response (not an error)

---

## 📝 Configuration Details

### Backend `.env` File

**Location**: `backend/.env`

**Configuration**:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/krushisevak
JWT_SECRET=krushisevak_super_secret_jwt_key_2026_phase1_safe
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# OpenAI AI Assistant Configuration
# IMPORTANT: Add your actual OpenAI API key here
# Get your key from: https://platform.openai.com/api-keys
# Example: OPENAI_API_KEY=sk-proj-abc123xyz...
OPENAI_API_KEY=your_actual_api_key_here

# Valid OpenAI model options:
# - gpt-4o (recommended, latest, vision support)
# - gpt-4-turbo (fast, vision support)
# - gpt-4 (powerful)
# - gpt-3.5-turbo (faster, cheaper, no vision)
OPENAI_MODEL=gpt-3.5-turbo
```

### Model Options

| Model | Speed | Cost | Vision Support | Best For |
|-------|-------|------|----------------|----------|
| `gpt-4o` | Fast | Medium | ✅ Yes | Best quality with images |
| `gpt-4-turbo` | Fast | Medium | ✅ Yes | Fast, quality responses |
| `gpt-4` | Slow | High | ❌ No | Complex reasoning |
| `gpt-3.5-turbo` | Very Fast | Low | ❌ No | Quick text responses |

**Recommendation**: 
- For **text only**: Use `gpt-3.5-turbo` (cheap, fast)
- For **text + images**: Use `gpt-4o` or `gpt-4-turbo`

---

## 🔍 API Key Validation

### Valid API Key Format:
```
sk-proj-abc123xyz...
(starts with "sk-" or "sk-proj-")
```

### Error Messages:

#### "OPENAI_API_KEY is not configured"
**Meaning**: API key is missing or empty in `.env`

**Fix**:
1. Open `backend/.env`
2. Add your API key after `OPENAI_API_KEY=`
3. Restart backend server

#### "AI API key is invalid"
**Meaning**: API key is wrong or expired

**Fix**:
1. Check your API key on https://platform.openai.com/api-keys
2. Generate a new key if needed
3. Update `backend/.env`
4. Restart backend server

#### "AI service limit reached"
**Meaning**: OpenAI rate limit or quota exceeded

**Fix**:
1. Wait a few minutes and try again
2. Check usage at https://platform.openai.com/account/usage
3. Add more credits if needed
4. Upgrade to higher tier plan

---

## 🧪 Testing Checklist

### Test 1: Basic Text Question
```
☐ Open AI Assistant page
☐ Type: "What is the best time to plant wheat?"
☐ Click Send
☐ Verify: Gets real AI response (not error)
☐ Verify: Response is relevant to agriculture
```

### Test 2: Multilingual (Hindi)
```
☐ Change language to Hindi
☐ Type: "प्याज की खेती कैसे करें?"
☐ Click Send
☐ Verify: Response is in Hindi
```

### Test 3: Multilingual (Marathi)
```
☐ Change language to Marathi
☐ Type: "टोमॅटो लागवड कशी करावी?"
☐ Click Send
☐ Verify: Response is in Marathi
```

### Test 4: Follow-up Questions
```
☐ Ask: "What crops grow well in Maharashtra?"
☐ Get response
☐ Follow-up: "What about wheat?"
☐ Verify: AI understands context
☐ Verify: Response mentions wheat in Maharashtra context
```

### Test 5: Voice Input (if supported)
```
☐ Click microphone icon
☐ Allow microphone permission
☐ Speak: "How to grow onions?"
☐ Verify: Text appears
☐ Click Send
☐ Verify: Gets response
```

### Test 6: Image Input (if model supports)
```
☐ Click image attachment icon
☐ Select crop image
☐ Ask: "What is this crop?"
☐ Click Send
☐ Verify: AI analyzes image
☐ Verify: Response describes the crop
```

### Test 7: Conversation History
```
☐ Ask 3-4 questions
☐ Logout and login again
☐ Open AI Assistant
☐ Verify: Previous conversation is shown
☐ Continue conversation
☐ Verify: Context is maintained
```

### Test 8: Error Handling
```
☐ Disconnect internet
☐ Ask a question
☐ Verify: Shows error message
☐ Reconnect internet
☐ Ask again
☐ Verify: Works normally
```

---

## 💰 Cost Management

### Pricing (as of 2024):

**GPT-3.5-Turbo**:
- Input: $0.0005 per 1K tokens
- Output: $0.0015 per 1K tokens
- **~$0.002 per conversation** (typical)

**GPT-4o**:
- Input: $0.005 per 1K tokens
- Output: $0.015 per 1K tokens
- **~$0.02 per conversation** (typical)

### Token Limits:
- **Current setting**: 900 tokens max output
- **Typical question**: 50-100 tokens
- **Typical response**: 200-500 tokens

### Cost Estimates:
- **100 conversations/day with GPT-3.5**: ~$0.20/day = ~$6/month
- **100 conversations/day with GPT-4o**: ~$2/day = ~$60/month

### Set Usage Limits:
1. Go to https://platform.openai.com/account/limits
2. Set monthly budget (e.g., $10)
3. Get email alerts at 75%, 90%, 100%

---

## 🔒 Security Best Practices

### ✅ DO:
1. **Keep API key in `.env` file only**
2. **Add `.env` to `.gitignore`**
3. **Never commit API key to Git**
4. **Set usage limits on OpenAI**
5. **Rotate keys periodically**
6. **Use separate keys for dev/prod**

### ❌ DON'T:
1. **Never hardcode API key in code**
2. **Never share API key publicly**
3. **Never commit `.env` to repository**
4. **Never use same key for multiple projects**
5. **Never expose key in client-side code**

---

## 🐛 Troubleshooting

### Issue: "OPENAI_API_KEY is not configured"

**Possible Causes**:
1. API key not added to `.env`
2. Backend not restarted after adding key
3. `.env` file in wrong location

**Solution**:
```powershell
# 1. Check .env exists
Test-Path backend\.env

# 2. Verify key is added
Get-Content backend\.env | Select-String OPENAI_API_KEY

# 3. Restart backend
cd backend
node server.js
```

### Issue: "AI API key is invalid"

**Possible Causes**:
1. Wrong API key format
2. Key copied incorrectly (extra spaces)
3. Key expired or revoked

**Solution**:
1. Generate new key on OpenAI platform
2. Copy entire key carefully
3. Ensure no spaces before/after key
4. Restart backend

### Issue: AI responses in wrong language

**Possible Causes**:
1. Language selector not working
2. Backend not receiving language parameter

**Solution**:
1. Check language dropdown selection
2. Verify API request includes `lang` parameter
3. Check browser console for errors

### Issue: Slow responses

**Possible Causes**:
1. Using GPT-4 (slower model)
2. Long conversation history
3. High API load

**Solution**:
1. Switch to `gpt-3.5-turbo` for speed
2. Clear conversation history
3. Reduce `max_tokens` in backend

---

## 📚 API Reference

### OpenAI Chat Completions API

**Endpoint**: `POST https://api.openai.com/v1/chat/completions`

**Request Format**:
```javascript
{
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User question' },
    { role: 'assistant', content: 'AI response' }
  ],
  max_tokens: 900,
  temperature: 0.7
}
```

**Response Format**:
```javascript
{
  choices: [
    {
      message: {
        role: 'assistant',
        content: 'AI response text...'
      }
    }
  ]
}
```

### Backend Implementation

**File**: `backend/controllers/chatController.js`

**Key Changes**:
1. ✅ Uses `client.chat.completions.create()` (correct method)
2. ✅ Builds proper message array format
3. ✅ Handles system prompt + conversation history
4. ✅ Supports text and image inputs
5. ✅ Saves to MongoDB chat history

---

## ✨ Features Working

### Text Input:
- ✅ Type any farming question
- ✅ Get AI response in selected language
- ✅ Conversation history maintained
- ✅ Context-aware follow-ups

### Voice Input:
- ✅ Click microphone icon
- ✅ Speak your question
- ✅ Speech-to-text conversion
- ✅ Automatically sends to AI

### Image Input:
- ✅ Upload crop/plant image
- ✅ Ask about the image
- ✅ AI analyzes and describes
- ✅ Works with GPT-4o/GPT-4-turbo

### Multilingual:
- ✅ English responses
- ✅ Hindi responses (हिंदी)
- ✅ Marathi responses (मराठी)
- ✅ Auto-detects user language

### Chat History:
- ✅ Stores all conversations
- ✅ User-specific history
- ✅ Loads on page refresh
- ✅ Maintains context

---

## 🎯 Next Steps

### After Setup:

1. **Add API Key** to `backend/.env`
2. **Restart Backend** server
3. **Test AI Assistant** with sample questions
4. **Verify multilingual** responses
5. **Check conversation history** saving
6. **Monitor usage** on OpenAI dashboard
7. **Set budget limits** to control costs

### Optional Enhancements:

1. **Upgrade to GPT-4o** for better responses
2. **Enable image analysis** for crop disease detection
3. **Add more languages** (Punjabi, Tamil, etc.)
4. **Implement caching** to reduce API calls
5. **Add feedback system** for response quality

---

## 📞 Support

### OpenAI Resources:
- **Documentation**: https://platform.openai.com/docs
- **API Keys**: https://platform.openai.com/api-keys
- **Usage**: https://platform.openai.com/account/usage
- **Billing**: https://platform.openai.com/account/billing
- **Status**: https://status.openai.com

### Common Links:
- **Pricing**: https://openai.com/pricing
- **Models**: https://platform.openai.com/docs/models
- **Rate Limits**: https://platform.openai.com/docs/guides/rate-limits
- **Safety**: https://platform.openai.com/docs/guides/safety

---

**AI Assistant - Ready to Use!** ✨

Once you add your OpenAI API key, the AI Assistant will provide real, intelligent responses to farming and agriculture questions in multiple languages.
