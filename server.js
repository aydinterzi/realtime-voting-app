import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { db } from "./src/db/index.js"; // Drizzle bağlantısı
import { votes } from "./src/db/schema.js"; // Oylar ve adaylar tablosu

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  // Oylama durumunu tutan nesne
  const votesCount = {};

  io.on("connection", (socket) => {
    console.log("New client connected");

    // Odaya katılma işlemi
    socket.on("joinRoom", (sessionId) => {
      socket.join(sessionId);
      console.log(`Client joined room: ${sessionId}`);
      io.to(sessionId).emit("voteUpdate", votesCount);
    });

    // Oy kullanma işlemi
    socket.on("castVote", async ({ sessionId, candidateId, userId }) => {
      await db.insert(votes).values({
        sessionId,
        candidateId,
        userId,
        createdAt: new Date(),
      });

      // Oylama sayısını güncelle
      if (!votesCount[candidateId]) {
        votesCount[candidateId] = 0;
      }
      votesCount[candidateId] += 1;

      // Odaya oy sayısını gönder
      io.to(sessionId).emit("voteUpdate", votesCount);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
