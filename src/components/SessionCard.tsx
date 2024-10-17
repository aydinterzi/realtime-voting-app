import React from "react";
import Link from "next/link";
import { sessionsType } from "@/lib/types";

const SessionCard = ({ session }: { session: sessionsType }) => {
  return (
    <Link
      href={`session/${session.id}`}
      className="max-w-sm w-full lg:max-w-full lg:flex cursor-pointer transition-transform transform hover:scale-105"
    >
      <div className="border-r border-b border-l border-gray-400 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal shadow-md hover:shadow-lg">
        <div className="mb-8">
          <div className="text-gray-900 font-bold text-xl mb-2">
            {session.title}
          </div>
          <p className="text-gray-700 text-base">
            Duration: {session.duration} minutes
          </p>
          <p className="text-gray-700 text-base">
            Candidates: {session.candidateCount}
          </p>
          <p
            className={`${
              session.isActive ? "text-green-500" : "text-red-500"
            } text-base`}
          >
            {session.isActive ? "Active" : "Inactive"}
          </p>
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;
