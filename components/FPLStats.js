import { useState, useEffect } from 'react';

export default function FPLStats() {
  const [players, setPlayers] = useState([]);
  const [gameweeks, setGameweeks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('total_points');
  const [positionFilter, setPositionFilter] = useState('all');

  useEffect(() => {
    const fetchFPLData = async () => {
      try {
        const response = await fetch('/api/get-fpl');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch FPL data');
        }

        setPlayers(data.players);
        setGameweeks(data.gameweeks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFPLData();
  }, []);

  const filteredPlayers = players
    .filter(player => positionFilter === 'all' || player.position === positionFilter)
    .sort((a, b) => b[sortBy] - a[sortBy])
    .slice(0, 20); // Show top 20 players

  if (loading) return <div className="p-4">Loading FPL statistics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">Fantasy Premier League Statistics</h2>
      
      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select 
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="border rounded p-2"
        >
          <option value="all">All Positions</option>
          <option value="GK">Goalkeepers</option>
          <option value="DEF">Defenders</option>
          <option value="MID">Midfielders</option>
          <option value="FWD">Forwards</option>
        </select>

        <select 
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded p-2"
        >
          <option value="total_points">Total Points</option>
          <option value="points_per_game">Points per Game</option>
          <option value="form">Form</option>
          <option value="selected_by_percent">Selected By %</option>
        </select>
      </div>

      {/* Players Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Player</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PPG</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Form</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Selected By %</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPlayers.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{player.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{player.team}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{player.position}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{player.total_points}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{player.points_per_game}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{player.form}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{player.selected_by_percent}%</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">£{player.now_cost}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Gameweek Information */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Current Gameweek</h3>
        {gameweeks.find(gw => gw.is_current) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm">
              Deadline: {new Date(gameweeks.find(gw => gw.is_current).deadline_time).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 