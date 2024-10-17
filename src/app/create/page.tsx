"use client";

import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { db } from "@/db";
import { candidates, votingSessions } from "@/db/schema";
export default function CreateVotingSession() {
  const { user } = useUser();
  const [candidateCount, setCandidateCount] = useState(1);
  const [candidateList, setCandidateList] = useState([""]);
  // Aday sayısını arttırınca veya azaltınca inputları güncellemek
  const handleCandidateCountChange = (e) => {
    const count = parseInt(e.target.value, 10);
    setCandidateCount(count);
    setCandidateList(Array(count).fill(""));
  };

  const handleCandidateNameChange = (index, e) => {
    const newcandidateList = [...candidateList];
    newcandidateList[index] = e.target.value;
    setCandidateList(newcandidateList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const session = await db
      .insert(votingSessions)
      .values({
        title: e.target.title.value,
        creatorId: user.id,
        duration: parseInt(e.target.duration.value, 10), // Süreyi sayısal bir değer olarak alıyoruz
        candidateCount: candidateList.length, // Aday sayısı
      })
      .returning({
        id: votingSessions.id, // Eklenen oturumun ID'sini geri döndürüyoruz
      });

    const sessionId = session[0].id; // Eklenen session ID'sini al
    const candidateData = candidateList.map((name) => ({
      sessionId, // Oturumun ID'si
      name, // Adayın ismi
    }));

    await db.insert(candidates).values(candidateData);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-8 bg-white rounded-lg shadow-lg mt-4">
        <h1 className="text-2xl font-bold text-center mb-6">
          Create Voting Session
        </h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Session Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter session title"
              required
            />
          </div>

          {/* Oylama Süresi */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium text-gray-700"
            >
              Session Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              id="duration"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter duration in minutes"
              required
            />
          </div>

          {/* Aday Sayısı */}
          <div>
            <label
              htmlFor="candidateCount"
              className="block text-sm font-medium text-gray-700"
            >
              Number of Candidates
            </label>
            <input
              type="number"
              name="candidateCount"
              id="candidateCount"
              value={candidateCount}
              onChange={handleCandidateCountChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              min={1}
              required
            />
          </div>

          {/* Aday İsimleri */}
          {Array.from({ length: candidateCount }).map((_, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">
                Candidate {index + 1} Name
              </label>
              <input
                type="text"
                value={candidateList[index]}
                onChange={(e) => handleCandidateNameChange(index, e)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder={`Enter name for candidate ${index + 1}`}
                required
              />
            </div>
          ))}

          {/* Submit Butonu */}
          <div>
            <button
              type="submit"
              className="w-full px-4 py-2 font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              Create Voting Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
