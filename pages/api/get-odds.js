export default async function handler(req, res) {
  const ODDS_API_KEY = process.env.ODDS_API_KEY;
  
  if (!ODDS_API_KEY) {
    console.error('API key is missing from environment variables');
    return res.status(500).json({ 
      error: "API key not configured",
      details: "Please set ODDS_API_KEY in your .env.local file"
    });
  }

  try {
    // Log first few characters of API key for debugging (safely)
    console.log('Using API key starting with:', ODDS_API_KEY.substring(0, 4));
    
    // Fetch upcoming Premier League matches with odds using v4 API
    const apiUrl = `https://api.the-odds-api.com/v4/sports/soccer_epl/odds`;
    const params = new URLSearchParams({
      apiKey: ODDS_API_KEY,
      regions: 'uk',
      markets: 'h2h',
      dateFormat: 'iso',
      oddsFormat: 'decimal'
    });

    const response = await fetch(`${apiUrl}?${params.toString()}`);
    console.log('API URL:', `${apiUrl}?${params.toString()}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      console.error('Response status:', response.status);
      console.error('Response headers:', Object.fromEntries(response.headers.entries()));
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    
    // Log response headers for debugging
    console.log('Response headers:', {
      remaining: response.headers.get('x-requests-remaining'),
      used: response.headers.get('x-requests-used'),
      'content-type': response.headers.get('content-type')
    });

    // Validate the response data
    if (!Array.isArray(data)) {
      console.error('Received non-array data:', data);
      throw new Error('Invalid data format received from API');
    }

    if (data.length === 0) {
      console.log('No matches found in the API response');
      return res.status(200).json([]);
    }

    // Sort matches by commence_time and take only the next 10
    const sortedData = data
      .sort((a, b) => new Date(a.commence_time) - new Date(b.commence_time))
      .slice(0, 10);

    // Process and format the matches data
    const matches = sortedData.map(match => {
      // Find the bookmaker with the best odds (using the first one for now)
      const bookmaker = match.bookmakers?.[0];
      let odds = { home_odds: null, away_odds: null, draw_odds: null };
      
      if (bookmaker) {
        const market = bookmaker.markets.find(m => m.key === 'h2h');
        if (market) {
          market.outcomes.forEach(outcome => {
            if (outcome.name === match.home_team) {
              odds.home_odds = outcome.price;
            } else if (outcome.name === match.away_team) {
              odds.away_odds = outcome.price;
            } else {
              odds.draw_odds = outcome.price;
            }
          });
        }
      }

      // Get team abbreviations for crest URLs
      const getTeamAbbr = (teamName) => {
        const abbrs = {
          'Manchester United': '1',
          'Manchester City': '43',
          'Liverpool': '14',
          'Chelsea': '8',
          'Arsenal': '3',
          'Tottenham Hotspur': '6',
          'Newcastle United': '4',
          'West Ham United': '21',
          'Aston Villa': '7',
          'Brighton and Hove Albion': '36',
          'Everton': '11',
          'Nottingham Forest': '17',
          'Crystal Palace': '31',
          'Fulham': '54',
          'Brentford': '94',
          'Wolverhampton Wanderers': '39',
          'Burnley': '90',
          'Sheffield United': '49',
          'Luton Town': '102',
          'AFC Bournemouth': '91',
          'Leicester City': '13',
          'Southampton': '20',
          'Ipswich Town': '5'
        };
        const id = abbrs[teamName];
        if (!id) {
          console.warn(`No team ID found for: ${teamName}`);
          return '0';
        }
        return id;
      };

      // Format the date for display with timezone
      const matchDate = new Date(match.commence_time);
      const formattedDate = matchDate.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      });

      // Validate team names before creating URLs
      const homeId = getTeamAbbr(match.home_team);
      const awayId = getTeamAbbr(match.away_team);
      
      return {
        home_team: match.home_team,
        away_team: match.away_team,
        match_date: formattedDate,
        raw_date: match.commence_time,
        status: 'Not Started',
        competition: 'Premier League',
        matchday: null,
        home_crest: homeId !== '0' ? `https://resources.premierleague.com/premierleague/badges/t${homeId}.svg` : null,
        away_crest: awayId !== '0' ? `https://resources.premierleague.com/premierleague/badges/t${awayId}.svg` : null,
        venue: null,
        ...odds,
        bookmaker: bookmaker?.title || null
      };
    });

    // Sort matches by date
    const sortedMatches = matches.sort((a, b) => new Date(a.raw_date) - new Date(b.raw_date));

    // Log the remaining request quota
    const remainingRequests = response.headers.get('x-requests-remaining');
    const usedRequests = response.headers.get('x-requests-used');
    console.log(`API Quota - Remaining: ${remainingRequests}, Used: ${usedRequests}`);

    res.status(200).json(sortedMatches);
  } catch (error) {
    console.error("Error fetching odds:", error);
    res.status(500).json({ 
      error: "Failed to fetch odds",
      details: error.message
    });
  }
}
