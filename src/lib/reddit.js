/**
 * EduTrend AI Agent — Reddit Trend Ingestion Service (Phase 2)
 * Fetches hot/rising posts from educational subreddits to spot viral trends early.
 */

const EDUCATIONAL_SUBREDDITS = [
  "explainlikeimfive",
  "todayilearned",
  "science",
  "AskHistorians",
  "dataisbeautiful",
  "space",
  "LifeProTips"
];

export async function getRedditTrends() {
  const allPosts = [];

  // Fetch top 5 from a random selection of 3 subreddits to keep it fresh and fast
  const shuffled = EDUCATIONAL_SUBREDDITS.sort(() => 0.5 - Math.random());
  const selectedSubs = shuffled.slice(0, 3);

  await Promise.all(
    selectedSubs.map(async (subreddit) => {
      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`, {
          headers: {
             // Reddit requires a custom User-Agent to prevent 429 Too Many Requests
            'User-Agent': 'EduTrendAI/1.0 (Integration/TrendSpotting)'
          },
          // Cache for 30 minutes to respect Reddit API limits
          next: { revalidate: 1800 }
        });

        if (!response.ok) return;
        
        const data = await response.json();
        
        data.data.children.forEach(({ data: post }) => {
          // Skip sticky posts and megathreads
          if (post.stickied || post.title.toLowerCase().includes("megathread")) return;

          allPosts.push({
            id: post.id,
            title: post.title,
            score: post.score,
            numComments: post.num_comments,
            subreddit: post.subreddit,
            url: `https://reddit.com${post.permalink}`,
            // Heuristic "virality" score: high upvotes + high comments
            viralityScore: (post.score * 1) + (post.num_comments * 5),
            isHighOpportunity: post.score > 5000 && post.num_comments > 500
          });
        });
      } catch (error) {
        console.error(`Failed to fetch from r/${subreddit}`, error);
      }
    })
  );

  // Sort by virality score
  return allPosts.sort((a, b) => b.viralityScore - a.viralityScore);
}
