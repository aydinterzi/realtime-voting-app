import { createServer } from "node:http";
import next from "next";
import { Server } from "socket.io";
import { db } from "./src/db/index.js"; // Drizzle bağlantısı
import { candidates, votes } from "./src/db/schema.js"; // Oylar ve adaylar tablosu
import { and, eq, sql } from "drizzle-orm";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = 3000;
const app = next({ dev, hostname, port });
const handler = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handler);
  const io = new Server(httpServer);

  io.on("connection", (socket) => {
    socket.on("joinRoom", (sessionId) => {
      socket.join(sessionId);
      console.log(`Client ${socket.id} joined room ${sessionId}`);

      // Client odaya katıldığında mevcut oy durumu gönder
      sendUpdatedVotes(sessionId);
    });

    socket.on("castVote", async ({ sessionId, candidateId, userId }) => {
      try {
        // Kullanıcının bu oturumda daha önce oy verip vermediğini kontrol et
        const existingVote = await db
          .select()
          .from(votes)
          .where(and(eq(votes.userId, userId), eq(votes.sessionId, sessionId)));

        if (existingVote.length > 0) {
          socket.emit("voteError", "You have already voted.");
          return;
        }

        // Oy verme işlemini kaydet
        await db.insert(votes).values({
          sessionId,
          candidateId,
          userId,
          createdAt: new Date(),
        });

        // Oylar güncellendikten sonra güncellenmiş oy sayısını gönder
        sendUpdatedVotes(sessionId);
      } catch (error) {
        console.error("Error during vote:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Oy sayısını veritabanından alıp odaya yayınlayan fonksiyon
    async function sendUpdatedVotes(sessionId) {
      try {
        // Veritabanından her aday için oy sayısını al
        const updatedVotes = await db
          .select({
            candidateId: candidates.id,
            voteCount: sql`COUNT(${votes.id})`,
          })
          .from(candidates)
          .leftJoin(votes, eq(candidates.id, votes.candidateId))
          .where(eq(candidates.sessionId, sessionId))
          .groupBy(candidates.id);

        // Adayların oylarını bir map şeklinde oluştur
        const votesMap = updatedVotes.reduce((acc, item) => {
          acc[item.candidateId] = item.voteCount;
          return acc;
        }, {});

        // Odaya oy güncellemesini gönder
        io.to(sessionId).emit("voteUpdate", votesMap);
        console.log(votesMap);
      } catch (error) {
        console.error("Error fetching votes:", error);
      }
    }
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
