import axios from 'axios';

export default async function handler(req, res) {
  try {
    // Fetch FPL data
    const response = await axios.get('https://fantasy.premierleague.com/api/bootstrap-static/');
    
    // Extract relevant data
    const { elements: players, teams, events: gameweeks } = response.data;

    // Process team data with additional statistics
    const processedTeams = teams.map(team => {
      // Calculate team performance metrics
      const teamPlayers = players.filter(p => p.team === team.id);
      
      // Calculate goals scored from all team players
      const totalGoals = team.goals_for || 0;
      const totalAssists = teamPlayers.reduce((sum, p) => sum + p.assists, 0);
      
      // Calculate clean sheets (only count goalkeeper and defenders)
      const defenseTeamPlayers = teamPlayers.filter(p => p.element_type <= 2);
      const totalCleanSheets = defenseTeamPlayers.length > 0 
        ? Math.max(...defenseTeamPlayers.map(p => p.clean_sheets))
        : 0;

      return {
        id: team.id,
        name: team.name,
        shortName: team.short_name,
        position: team.position || 0,
        played: team.played || 0,
        wins: team.win || 0,
        losses: team.loss || 0,
        draws: team.draw || 0,
        cleanSheets: totalCleanSheets,
        goalsScored: totalGoals,
        goalsAssists: totalAssists,
        goalsAgainst: team.goals_against || 0,
        strength: team.strength || 0,
        strengthOverall: team.strength_overall_home || 0,
        strengthAttackHome: team.strength_attack_home || 0,
        strengthAttackAway: team.strength_attack_away || 0,
        strengthDefenceHome: team.strength_defence_home || 0,
        strengthDefenceAway: team.strength_defence_away || 0,
        form: team.form || "0.0"
      };
    });

    // Sort teams by position
    const sortedTeams = processedTeams.sort((a, b) => (a.position || 20) - (b.position || 20));

    // Process player data
    const processedPlayers = players.map(player => ({
      id: player.id,
      name: player.web_name,
      team: teams.find(t => t.id === player.team)?.name,
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
    console.log('Sample team data:', teams[0]);

    res.status(200).json({
      success: true,
      players: processedPlayers,
      teams: sortedTeams,
      gameweeks: processedGameweeks
    });

  } catch (error) {
    console.error('Error fetching FPL data:', error);
    res.status(500).json({ 
      error: 'Failed to fetch FPL data',
      details: error.message 
    });
  }
} 