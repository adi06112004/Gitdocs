import dotenv from "dotenv";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./src/app.js";
import Document from "./src/models/Document.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join-document", (documentId) => {
    if (!documentId) return;
    const room = `document:${documentId}`;
    socket.join(room);
    socket.emit("joined-document", { documentId });
  });

  socket.on("document-change", ({ documentId, content }) => {
    if (!documentId) return;
    const room = `document:${documentId}`;
    socket.to(room).emit("document-update", {
      documentId,
      content,
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
        io.to(`document:${documentId}`).emit("document-saved", {
          documentId,
          content: document.content,
          updatedAt: document.updatedAt,
        });
      }
    } catch (error) {
      console.error("Socket save-document error:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});