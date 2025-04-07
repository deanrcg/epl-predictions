import axios from 'axios';

export default async function handler(req, res) {
  const apiKey = process.env.ODDS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Fetch EPL odds with scores included
    const oddsUrl = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds/?apiKey=${apiKey}&regions=uk&markets=h2h&dateFormat=iso&oddsFormat=decimal`;
    console.log('Stats API URL:', oddsUrl);

    const response = await axios.get(oddsUrl);
    
    // Transform the data to include both odds and scores
    const matchData = response.data.map(match => ({
      id: match.id,
      home_team: match.home_team,
      away_team: match.away_team,
      commence_time: match.commence_time,
      completed: match.completed || false,
      scores: match.scores || null,
      bookmakers: match.bookmakers?.slice(0, 3) || [] // Include top 3 bookmakers for reference
    }));

    // Log remaining API quota
    const remaining = response.headers['x-requests-remaining'];
    const used = response.headers['x-requests-used'];
    console.log('API Quota - Remaining:', remaining, 'Used:', used);

    res.status(200).json({
      success: true,
      data: matchData,
      quota: { remaining, used }
    });

  } catch (error) {
    console.error('Error fetching stats:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Failed to fetch stats',
      details: error.response?.data || error.message 
    });
  }
} 