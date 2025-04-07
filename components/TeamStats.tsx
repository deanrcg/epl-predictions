'use client';

import { useState, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  shortName: string;
  position: number;
  played: number;
  wins: number;
  losses: number;
  draws: number;
  cleanSheets: number;
  goalsScored: number;
  goalsAgainst: number;
  goalsAssists: number;
  strength: number;
  strengthOverall: number;
  strengthAttackHome: number;
  strengthAttackAway: number;
  strengthDefenceHome: number;
  strengthDefenceAway: number;
  form: string;
}

interface ApiResponse {
  success: boolean;
  teams: Team[];
  error?: string;
}

export default function TeamStats() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<keyof Team>('position');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        const response = await fetch('/api/get-fpl');
        const data: ApiResponse = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch team data');
        }

        setTeams(data.teams);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamData();
  }, []);

  const handleSort = (field: keyof Team) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const sortedTeams = [...teams].sort((a, b) => {
    const modifier = sortOrder === 'asc' ? 1 : -1;
    if (typeof a[sortBy] === 'number' && typeof b[sortBy] === 'number') {
      return ((a[sortBy] as number) - (b[sortBy] as number)) * modifier;
    }
    return String(a[sortBy]).localeCompare(String(b[sortBy])) * modifier;
  });

  if (loading) return <div className="p-4">Loading team statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Premier League Team Statistics</h2>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('name')}
              >
                Team {sortBy === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('position')}
              >
                Position {sortBy === 'position' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('played')}
              >
                Played {sortBy === 'played' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('wins')}
              >
                W {sortBy === 'wins' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('draws')}
              >
                D {sortBy === 'draws' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('losses')}
              >
                L {sortBy === 'losses' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('goalsScored')}
              >
                GF {sortBy === 'goalsScored' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('goalsAgainst')}
              >
                GA {sortBy === 'goalsAgainst' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cleanSheets')}
              >
                CS {sortBy === 'cleanSheets' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('form')}
              >
                Form {sortBy === 'form' && (sortOrder === 'asc' ? '↑' : '↓')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedTeams.map((team) => (
              <tr key={team.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{team.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.played}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.wins}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.draws}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.losses}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.goalsScored}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.goalsAgainst}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.cleanSheets}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{team.form}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Team Strength Comparison */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Team Strength Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedTeams.map((team) => (
            <div key={team.id} className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">{team.name}</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attack (Home)</span>
                  <div className="w-48 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full" 
                      style={{ width: `${(team.strengthAttackHome / 1500) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Attack (Away)</span>
                  <div className="w-48 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-green-600 h-2.5 rounded-full" 
                      style={{ width: `${(team.strengthAttackAway / 1500) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Defence (Home)</span>
                  <div className="w-48 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-600 h-2.5 rounded-full" 
                      style={{ width: `${(team.strengthDefenceHome / 1500) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Defence (Away)</span>
                  <div className="w-48 bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-red-600 h-2.5 rounded-full" 
                      style={{ width: `${(team.strengthDefenceAway / 1500) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 