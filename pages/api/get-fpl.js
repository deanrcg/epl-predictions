import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Fetch FPL data
    const bootstrapResponse = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    // Extract relevant data
    const { elements: players, teams: fplTeams, events: gameweeks } = bootstrapResponse.data;

    // Process team data with additional statistics
    const processedTeams = fplTeams.map(team => {
      // Calculate team performance metrics from FPL data
      const teamPlayers = players.filter(p => p.team === team.id);
      
      // Calculate goals scored and assists from all team players
      const totalGoals = teamPlayers.reduce((sum, p) => sum + (p.goals_scored || 0), 0);
      const totalAssists = teamPlayers.reduce((sum, p) => sum + (p.assists || 0), 0);
      
      // Calculate clean sheets (only count goalkeeper and defenders)
      const defenseTeamPlayers = teamPlayers.filter(p => p.element_type <= 2);
      const totalCleanSheets = defenseTeamPlayers.length > 0 
        ? Math.max(...defenseTeamPlayers.map(p => p.clean_sheets || 0))
        : 0;

      return {
        id: team.id,
        name: team.name,
        short_name: team.short_name,
        position: team.pulse_id || 0,
        played: team.played_games || 0,
        win: team.win || 0,
        loss: team.loss || 0,
        draw: team.draw || 0,
        points: team.points || 0,
        clean_sheets: totalCleanSheets,
        goals_scored: team.goals_for || 0,
        goals_assists: totalAssists,
        goals_against: team.goals_against || 0,
        strength: team.strength || 0,
        strength_overall_home: team.strength_overall_home || 0,
        strength_overall_away: team.strength_overall_away || 0,
        strength_attack_home: team.strength_attack_home || 0,
        strength_attack_away: team.strength_attack_away || 0,
        strength_defence_home: team.strength_defence_home || 0,
        strength_defence_away: team.strength_defence_away || 0,
        form: team.form || null
      };
    });

    // Sort teams by points in descending order
    const sortedTeams = processedTeams.sort((a, b) => {
      // First sort by points
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      // If points are equal, sort by goal difference
      const aGD = a.goals_scored - a.goals_against;
      const bGD = b.goals_scored - b.goals_against;
      if (bGD !== aGD) {
        return bGD - aGD;
      }
      // If goal difference is equal, sort by goals scored
      return b.goals_scored - a.goals_scored;
    });

    // Update positions based on sorted order
    sortedTeams.forEach((team, index) => {
      team.position = index + 1;
    });

    // Process player data
    const processedPlayers = players.map(player => ({
      id: player.id,
      name: player.web_name,
      team: fplTeams.find(t => t.id === player.team)?.name,
      position: player.element_type === 1 ? 'GK' : 
                player.element_type === 2 ? 'DEF' : 
                player.element_type === 3 ? 'MID' : 'FWD',
      total_points: player.total_points,
      points_per_game: player.points_per_game,
      form: player.form,
      selected_by_percent: player.selected_by_percent,
      now_cost: player.now_cost / 10,
      goals_scored: player.goals_scored,
      assists: player.assists,
      clean_sheets: player.clean_sheets,
      status: player.status,
      news: player.news
    }));

    // Process gameweek data
    const processedGameweeks = gameweeks.map(gw => ({
      id: gw.id,
      name: gw.name,
      deadline_time: gw.deadline_time,
      is_current: gw.is_current,
      is_next: gw.is_next,
      is_previous: gw.is_previous,
      average_entry_score: gw.average_entry_score,
      highest_score: gw.highest_score,
      most_selected: gw.most_selected,
      most_transferred_in: gw.most_transferred_in
    }));

    // Log the first team's data for debugging
    console.log('Sample team data:', sortedTeams[0]);

    res.status(200).json({
      success: true,
      players: processedPlayers,
      teams: sortedTeams,
      gameweeks: processedGameweeks
    });

  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch data',
      details: error.message 
    });
  }
} 