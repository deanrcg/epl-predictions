export default async function handler(req, res) {
  const sportsDataKey = process.env.SPORTSDATA_KEY || 'f941bd87d37f4eb29e7a86730163e6ea';

  try {
    // Test the connection by getting Premier League schedule
    const response = await fetch(
      'https://api.sportsdata.io/v4/soccer/scores/json/Schedule/EPL/2024', {
      headers: {
        'Ocp-Apim-Subscription-Key': sportsDataKey
      }
    });

    const data = await response.json();
    console.log('API Test Response:', JSON.stringify(data, null, 2));

    res.status(200).json(data);
  } catch (error) {
    console.error("Error testing API:", error);
    res.status(500).json({ 
      error: "Failed to test API connection",
      details: error.message
    });
  }
} 