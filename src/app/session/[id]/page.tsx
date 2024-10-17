"use client";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { db } from "@/db"; // Drizzle bağlantısı
import { candidates } from "@/db/schema"; // Candidates tablosu
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";

let socket;

export default function VotingSession({ params }: { params: { id: string } }) {
  const [candidateList, setCandidateList] = useState([]);
  const [votes, setVotes] = useState({});
  const { id } = params;
  const { user } = useUser();

  useEffect(() => {
    if (!id) return;

    const fetchCandidates = async () => {
      const candidateData = await db
        .select()
        .from(candidates)
        .where(eq(candidates.sessionId, id));
      setCandidateList(candidateData);
    };

    fetchCandidates();
  }, [id]);

  // Socket.IO ile odaya bağlanma
  useEffect(() => {
    if (!id) return;

    // Socket bağlantısı
    socket = io();

    // Odaya katıl
    socket.emit("joinRoom", id);

    // Oy güncellemeleri dinleme
    socket.on("voteUpdate", (updatedVotes) => {
      setVotes(updatedVotes); // Sunucudan gelen güncellenmiş oyları al
    });

    return () => {
      socket.disconnect(); // Sayfa kapatıldığında socket bağlantısını sonlandır
    };
  }, [id]);

  // Oy kullanma işlemi
  const handleVote = (candidateId) => {
    // Sunucuya oy kullanma isteği gönder
    socket.emit("castVote", { sessionId: id, candidateId, userId: user.id });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Vote for your Favorite Candidate
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidateList.map((candidate) => (
          <div
            key={candidate.id}
            className="border p-4 bg-white rounded shadow-lg"
          >
            <h2 className="text-xl font-semibold mb-4">{candidate.name}</h2>
            <p className="mb-4">
              Current Votes: {votes[candidate.id] ? votes[candidate.id] : 0}
            </p>
            <button
              onClick={() => handleVote(candidate.id)}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
