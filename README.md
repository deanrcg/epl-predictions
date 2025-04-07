# EPL Predictions

A Next.js application that displays upcoming Premier League matches with their latest odds from various bookmakers.

## Features

- Shows next 10 Premier League matches
- Displays odds from multiple UK bookmakers
- Real-time odds updates
- Clean, modern UI with team crests
- Mobile-responsive design

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- The Odds API integration

## Setup

1. Clone the repository:
```bash
git clone https://github.com/deanrcg/epl_predictions.git
cd epl_predictions
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with your API key:
```
ODDS_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

- `ODDS_API_KEY`: Your API key from [The Odds API](https://the-odds-api.com/)

## API Usage

The application uses The Odds API to fetch:
- Upcoming Premier League matches
- Latest odds from UK bookmakers
- Match details and timing

## License

MIT 