"use client";
import { useState, useEffect } from "react";
import io from "socket.io-client";
import { db } from "@/db"; // Drizzle bağlantısı
import { candidates, votingSessions } from "@/db/schema"; // Candidates ve Voting Sessions tabloları
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";

let socket;

export default function VotingSession({ params }) {
  const [candidateList, setCandidateList] = useState([]);
  const [votes, setVotes] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isVotingAllowed, setIsVotingAllowed] = useState(true);
  const { id } = params;
  const { user } = useUser();

  useEffect(() => {
    if (!id) return;

    const fetchSessionData = async () => {
      const sessionData = await db
        .select()
        .from(votingSessions)
        .where(eq(votingSessions.id, id));

      if (sessionData.length > 0) {
        const expiresAt = new Date(sessionData[0].expiresAt);
        const now = new Date();

        // Kalan süreyi hesapla
        const difference = expiresAt - now;
        if (difference > 0) {
          setTimeLeft(difference);
        } else {
          setIsVotingAllowed(false);
        }
      }

      const candidateData = await db
        .select()
        .from(candidates)
        .where(eq(candidates.sessionId, id));
      setCandidateList(candidateData);
    };

    fetchSessionData();
  }, [id]);

  useEffect(() => {
    if (timeLeft === null) return;

    if (timeLeft <= 0) {
      setIsVotingAllowed(false);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime - 1000 <= 0) {
          clearInterval(timer);
          setIsVotingAllowed(false);
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (!id) return;

    socket = io();

    socket.emit("joinRoom", id);

    socket.on("voteUpdate", (updatedVotes) => {
      setVotes(updatedVotes);
    });

    socket.on("voteError", (message) => {
      alert(message);
    });

    return () => {
      socket.disconnect();
    };
  }, [id]);

  const handleVote = (candidateId) => {
    if (!isVotingAllowed) {
      alert("Voting session has ended.");
      return;
    }

    socket.emit("castVote", { sessionId: id, candidateId, userId: user.id });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Vote for your Favorite Candidate
      </h1>
      {timeLeft !== null && (
        <p className="text-center text-xl mb-4">
          Time remaining: {Math.floor(timeLeft / 60000)}m{" "}
          {Math.floor((timeLeft % 60000) / 1000)}s
        </p>
      )}
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
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                !isVotingAllowed ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={!isVotingAllowed}
            >
              Vote
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
