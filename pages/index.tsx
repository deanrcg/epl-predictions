import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FPLStats from "@/components/FPLStats";
import TeamStats from "@/components/TeamStats";

interface Match {
  home_team: string;
  away_team: string;
  match_date: string;
  status: string;
  competition: string;
  matchday: number;
  home_crest: string;
  away_crest: string;
  home_odds: number | null;
  draw_odds: number | null;
  away_odds: number | null;
}

export default function MatchSchedule() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMatches = async () => {
    try {
      const response = await fetch("/api/get-odds");
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      const data = await response.json();
      setMatches(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      console.error("Failed to fetch matches", err);
      setError("Failed to load match data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();

    // Calculate time until next midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    // First update at midnight
    const initialTimeout = setTimeout(() => {
      fetchMatches();
      // Then update every 24 hours
      const interval = setInterval(fetchMatches, 24 * 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, timeUntilMidnight);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Premier League Predictions</h1>
      
      {/* Match Schedule Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Next 10 Premier League Matches</h2>
          {lastUpdated && (
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleString()}
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="grid gap-4">
            {matches.map((match) => (
              <Card key={`${match.home_team}-${match.away_team}-${match.match_date}`} className="shadow-md">
                <CardContent className="p-4">
                  <div className="grid grid-cols-3 items-center gap-4">
                    <div className="text-center">
                      <img 
                        src={match.home_crest} 
                        alt={match.home_team}
                        className="w-12 h-12 mx-auto mb-2"
                      />
                      <div className="font-semibold">{match.home_team}</div>
                      {match.home_odds && (
                        <div className="text-sm text-blue-600 font-medium mt-1">
                          {match.home_odds.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold mb-2">VS</div>
                      <div className="text-sm text-gray-600">
                        {new Date(match.match_date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                      <div className="text-xs text-gray-500 mb-1">
                        Matchday {match.matchday}
                      </div>
                      {match.draw_odds && (
                        <div className="text-sm text-blue-600 font-medium">
                          Draw: {match.draw_odds.toFixed(2)}
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <img 
                        src={match.away_crest} 
                        alt={match.away_team}
                        className="w-12 h-12 mx-auto mb-2"
                      />
                      <div className="font-semibold">{match.away_team}</div>
                      {match.away_odds && (
                        <div className="text-sm text-blue-600 font-medium mt-1">
                          {match.away_odds.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Team Statistics Section */}
      <div className="mb-8">
        <TeamStats />
      </div>

      {/* Fantasy Premier League Statistics Section */}
      <div className="mb-8">
        <FPLStats />
      </div>
    </div>
  );
} 