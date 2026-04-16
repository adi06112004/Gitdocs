import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app, { initializeUtils } from "./src/app.js";
import Document from "./src/models/Document.js";
import pubsub from "./src/utils/pubsub.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://localhost:5174",
      "http://127.0.0.1:5174",
    ],
    methods: ["GET", "POST"],
  },
});

// Initialize utilities
await initializeUtils();

// Subscribe to Redis pub/sub channels for cross-server communication
await pubsub.subscribe('document-updates', (data) => {
  const { documentId, content, type, userId } = data;
  if (type === 'change') {
    io.to(`document:${documentId}`).emit("document-update", {
      documentId,
      content,
    });
  } else if (type === 'save') {
    io.to(`document:${documentId}`).emit("document-saved", {
      documentId,
      content,
      updatedAt: new Date(),
    });
  }
});

const activeDocumentUsers = {}; // Mapping { documentId: { socketId: userObject } }

const broadcastActiveUsers = (documentId) => {
  if (activeDocumentUsers[documentId]) {
    const users = Object.values(activeDocumentUsers[documentId]);
    io.to(`document:${documentId}`).emit("active-users-changed", {
      documentId,
      users,
    });
  }
};

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-document", ({ documentId, user }) => {
    if (!documentId) return;
    const room = `document:${documentId}`;
    socket.join(room);

    // Track active user
    if (user) {
      if (!activeDocumentUsers[documentId]) activeDocumentUsers[documentId] = {};
      const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#06b6d4'];
      const userColor = colors[Math.floor(Math.random() * colors.length)];
      
      activeDocumentUsers[documentId][socket.id] = { ...user, color: userColor };
      socket.currentDocumentId = documentId;
      broadcastActiveUsers(documentId);
    }

    socket.emit("joined-document", { documentId });
  });

  socket.on("leave-document", ({ documentId }) => {
    if (!documentId) return;
    const room = `document:${documentId}`;
    socket.leave(room);

    if (activeDocumentUsers[documentId] && activeDocumentUsers[documentId][socket.id]) {
      delete activeDocumentUsers[documentId][socket.id];
      if (Object.keys(activeDocumentUsers[documentId]).length === 0) {
        delete activeDocumentUsers[documentId];
      } else {
        broadcastActiveUsers(documentId);
      }
    }
    if (socket.currentDocumentId === documentId) {
      delete socket.currentDocumentId;
    }
  });

  socket.on("cursor-update", ({ documentId, position }) => {
    if (!documentId || !activeDocumentUsers[documentId] || !activeDocumentUsers[documentId][socket.id]) return;
    
    const userBlock = activeDocumentUsers[documentId][socket.id];
    
    // Broadcast cursor position immediately
    socket.to(`document:${documentId}`).emit("cursor-update", {
      documentId,
      userId: userBlock.id,
      name: userBlock.name || "Anonymous",
      color: userBlock.color,
      position
    });
  });

  socket.on("document-change", ({ documentId, content }) => {
    if (!documentId) return;

    // Broadcast to local clients
    const room = `document:${documentId}`;
    socket.to(room).emit("document-update", {
      documentId,
      content,
    });

    // Publish to Redis for cross-server communication
    pubsub.publish('document-updates', {
      documentId,
      content,
      type: 'change'
    });
  });

  socket.on("save-document", async ({ documentId, content, userId }) => {
    if (!documentId) return;
    try {
      const document = await Document.findByIdAndUpdate(
        documentId,
        {
          content,
          updatedAt: new Date(),
          lastEditedBy: userId || null,
        },
        { new: true },
      );

      if (document) {
        // Broadcast to local clients
        io.to(`document:${documentId}`).emit("document-saved", {
          documentId,
          content: document.content,
          updatedAt: document.updatedAt,
        });

        // Publish to Redis for cross-server communication
        pubsub.publish('document-updates', {
          documentId,
          content: document.content,
          type: 'save',
          userId
        });

        // Invalidate document cache
        const cache = (await import('./src/utils/cache.js')).default;
        await cache.del(`document:${documentId}`);
      }
    } catch (error) {
      console.error("Socket save-document error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
    if (socket.currentDocumentId && activeDocumentUsers[socket.currentDocumentId]) {
      const docId = socket.currentDocumentId;
      delete activeDocumentUsers[docId][socket.id];
      if (Object.keys(activeDocumentUsers[docId]).length === 0) {
        delete activeDocumentUsers[docId];
      } else {
        broadcastActiveUsers(docId);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});