const express = require('express');
const router = express.Router();
const axios = require('axios');

let cachedContests = null;
let lastFetched = 0;
const CACHE_DURATION = 10 * 60 * 1000;

router.get('/', async (req, res) => {
  const now = Date.now();

  if (cachedContests && now - lastFetched < CACHE_DURATION) {
    return res.json(cachedContests);
  }

  try {
    const response = await axios.get('https://codeforces.com/api/contest.list?gym=false');
    if (response.data && response.data.status === 'OK') {
      const contests = response.data.result
        .filter(c => c.phase === 'FINISHED' || c.phase === 'CODING' || c.phase === 'BEFORE')
        .sort((a, b) => b.startTimeSeconds - a.startTimeSeconds);

      cachedContests = contests;
      lastFetched = now;
      res.json(contests);
    } else {
      res.status(500).json({ message: 'Failed to fetch contests from Codeforces API' });
    }
  } catch (error) {
    if (cachedContests) {
      return res.json(cachedContests);
    }
    res.status(500).json({ message: 'Error fetching contests: ' + error.message });
  }
});

module.exports = router;
