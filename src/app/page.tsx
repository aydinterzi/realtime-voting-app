import { db } from "@/db";
import SessionCard from "../components/SessionCard"; // Kart component'ını dahil ediyoruz
import { votingSessions } from "@/db/schema";
import MaxWidthWrapper from "@/components/MaxWidthWrapper";

const HomePage = async () => {
  const sessions = await db.select().from(votingSessions);
  return (
    <MaxWidthWrapper className="mt-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sessions.length > 0 ? (
          sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))
        ) : (
          <p className="text-center text-gray-500">
            No active sessions available.
          </p>
        )}
      </div>
    </MaxWidthWrapper>
  );
};

export default HomePage;
