'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';

interface Team {
  id: number;
  name: string;
  short_name: string;
  position: number;
  played: number;
  win: number;
  draw: number;
  loss: number;
  points: number;
  form: string | null;
  strength_overall_home: number;
  strength_overall_away: number;
  strength_attack_home: number;
  strength_attack_away: number;
  strength_defence_home: number;
  strength_defence_away: number;
}

interface ApiResponse {
  success: boolean;
  teams: Team[];
  error?: string;
}

const TeamStats = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Team;
    direction: 'asc' | 'desc';
  }>({ key: 'position', direction: 'asc' });

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await fetch('/api/get-fpl');
        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch team data');
        }

        setTeams(data.teams);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, []);

  const handleSort = (key: keyof Team) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedTeams = [...teams].sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    // Handle null values
    if (aValue === null && bValue === null) return 0;
    if (aValue === null) return sortConfig.direction === 'asc' ? 1 : -1;
    if (bValue === null) return sortConfig.direction === 'asc' ? -1 : 1;

    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  if (loading) {
    return <div className="text-center p-4">Loading team statistics...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <Card className="p-4">
      <h2 className="text-2xl font-bold mb-4">Premier League Team Statistics</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="bg-gray-100">
              <th
                onClick={() => handleSort('position')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                Pos
              </th>
              <th
                onClick={() => handleSort('name')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 text-left"
              >
                Team
              </th>
              <th
                onClick={() => handleSort('played')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                MP
              </th>
              <th
                onClick={() => handleSort('win')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                W
              </th>
              <th
                onClick={() => handleSort('draw')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                D
              </th>
              <th
                onClick={() => handleSort('loss')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                L
              </th>
              <th
                onClick={() => handleSort('points')}
                className="px-4 py-2 cursor-pointer hover:bg-gray-200"
              >
                Pts
              </th>
              <th className="px-4 py-2">Form</th>
            </tr>
          </thead>
          <tbody>
            {sortedTeams.map((team) => (
              <tr
                key={team.id}
                className="border-b hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-2 text-center">{team.position}</td>
                <td className="px-4 py-2">
                  <div className="flex items-center">
                    <span className="font-medium">{team.name}</span>
                    <span className="ml-2 text-gray-500">({team.short_name})</span>
                  </div>
                </td>
                <td className="px-4 py-2 text-center">{team.played}</td>
                <td className="px-4 py-2 text-center">{team.win}</td>
                <td className="px-4 py-2 text-center">{team.draw}</td>
                <td className="px-4 py-2 text-center">{team.loss}</td>
                <td className="px-4 py-2 text-center font-medium">{team.points}</td>
                <td className="px-4 py-2 text-center">
                  {team.form || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-3">Team Strength Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTeams.map((team) => (
            <div key={`strength-${team.id}`} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{team.name}</h4>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Attack (Home)</span>
                    <span>{team.strength_attack_home}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{
                        width: `${(team.strength_attack_home / 1500) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Attack (Away)</span>
                    <span>{team.strength_attack_away}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{
                        width: `${(team.strength_attack_away / 1500) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Defence (Home)</span>
                    <span>{team.strength_defence_home}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{
                        width: `${(team.strength_defence_home / 1500) * 100}%`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Defence (Away)</span>
                    <span>{team.strength_defence_away}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${(team.strength_defence_away / 1500) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TeamStats; 