# WebSocket Integration Guide

## ✅ Setup Complete!

Your AI Interview system now uses **WebSocket (Socket.IO)** for real-time communication between frontend and backend.

---

## 🚀 How to Start

### 1. Start Backend Server
```bash
cd backend
npm run dev
# or
node server.js
```

You should see:
```
🚀 Server running on http://localhost:5000
🔌 WebSocket server ready
```

### 2. Start Frontend
```bash
cd ai-interview-assistant
npm run dev
```

---

## 🔌 WebSocket Features Implemented

### Backend Events (server.js)

1. **`start-interview`** - Initialize interview session
   - Receives: `{ studentName, projectTitle }`
   - Emits: `ai-message` with welcome message

2. **`user-response`** - Student answers a question
   - Receives: `{ content, stage, context }`
   - Emits: `ai-message` with AI response

3. **`analyze-presentation`** - Analyze screen share + voice
   - Receives: `{ transcript, screenImage, ocrText }`
   - Emits: `presentation-analyzed` with analysis

### Frontend Hooks

**`useWebSocket.ts`** - Low-level WebSocket connection
- Manages Socket.IO connection
- Handles reconnection logic
- Emits events to backend

**`useInterviewWithWebSocket.ts`** - High-level interview logic
- Manages interview stages
- Processes messages
- Integrates with UI components

---

## 🔧 Configuration

### Backend CORS (server.js)
```javascript
cors: {
  origin: [
    "http://localhost:5173",  // Vite default
    "http://localhost:8080",  // Alternative
    "http://localhost:3000"   // React default
  ],
  credentials: true
}
```

### Frontend Connection (useWebSocket.ts)
```typescript
const socket = io('http://localhost:5000', {
  transports: ['polling', 'websocket'],
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});
```

---

## 📊 Interview Flow with WebSocket

```
1. Page Loads
   └─> useWebSocket connects to backend
   └─> Connection established ✅

2. Interview Starts
   └─> Frontend: startInterview(name, title)
   └─> Backend: Generates welcome message
   └─> Frontend: Displays AI message

3. Student Responds
   └─> Frontend: addUserResponse(text)
   └─> Backend: Processes response with Gemini AI
   └─> Frontend: Displays follow-up question

4. Screen Share
   └─> Student shares screen + voice
   └─> Frontend: Captures video, audio, OCR
   └─> Frontend: processPresentationData()
   └─> Backend: Analyzes with Gemini AI (vision model)
   └─> Frontend: Displays technical questions

5. Q&A Session
   └─> Loop of questions and answers
   └─> Real-time AI responses via WebSocket

6. Complete
   └─> Navigate to evaluation page
```

---

## 🐛 Troubleshooting

### "Connection failed" Error

**Check Backend:**
```bash
curl http://localhost:5000
# Should return: "Backend is running"
```

**Check WebSocket:**
```bash
# In browser console
socket.connected  // Should be true
```

**Check Firewall:**
```bash
sudo ufw allow 5000
```

### "CORS Error"

Make sure your frontend URL is in the backend's CORS whitelist.

Check console for: `Access-Control-Allow-Origin` errors

### Connection Keeps Dropping

1. Check if backend is still running
2. Increase `reconnectionAttempts` in useWebSocket.ts
3. Check network stability

---

## 📝 Key Files Modified

### Backend
- ✅ `/backend/server.js` - Added Socket.IO server
- ✅ `/backend/package.json` - Added socket.io dependency

### Frontend
- ✅ `/src/hooks/useWebSocket.ts` - WebSocket connection hook
- ✅ `/src/hooks/useInterviewWithWebSocket.ts` - Interview logic with WS
- ✅ `/src/pages/InterviewPage.tsx` - Updated to use WebSocket
- ✅ `/src/components/ScreenSharePanel.tsx` - Supports WS callback
- ✅ `package.json` - Added socket.io-client dependency

---

## 🎯 Benefits of WebSocket

✅ **Real-time**: Instant AI responses, no polling  
✅ **Bidirectional**: Server can push updates to client  
✅ **Efficient**: Single persistent connection  
✅ **Low Latency**: Perfect for live interviews  
✅ **State Awareness**: AI can manage conversation context  

---

## 🔐 Security Notes

For production:
1. Use WSS (WebSocket Secure) with SSL certificates
2. Implement authentication tokens
3. Validate all incoming messages
4. Rate limit WebSocket connections
5. Use environment variables for URLs

---

## 📚 Next Steps

1. ✅ WebSocket connection working
2. Test full interview flow
3. Add voice input in chat
4. Implement session persistence
5. Add evaluation page integration
6. Deploy to production with WSS

---

## 🆘 Support

If you encounter issues:
1. Check backend console for errors
2. Check browser console for WebSocket logs
3. Verify both servers are running
4. Check CORS configuration matches your ports

---

**Status**: ✅ WebSocket Integration Complete!
**Last Updated**: January 18, 2026
