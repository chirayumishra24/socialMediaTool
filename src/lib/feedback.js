/**
 * EduTrend AI Agent — Closed-Loop Feedback System
 * Simulates post-publish performance data and compares against predictions
 * to recalibrate the engagement prediction model over time.
 */

const FEEDBACK_STORAGE_KEY = "edutrend_feedback_history";

/**
 * Load feedback history from localStorage.
 */
export function loadFeedbackHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(FEEDBACK_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save feedback history to localStorage.
 */
function saveFeedbackHistory(history) {
  if (typeof window === "undefined") return;
  try {
    // Keep max 50 entries
    const trimmed = history.slice(-50);
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    console.error("Failed to save feedback history:", err);
  }
}

/**
 * Simulate realistic performance data for a content piece.
 * Based on quality score and predictions with realistic variance.
 * 
 * @param {Object} prediction - The predicted metrics from quality scorer
 * @param {string} timeframe - "24h" | "72h" | "168h"
 */
export function simulatePerformance(prediction, timeframe = "24h") {
  const score = prediction.score || 50;
  const predictedViews = prediction.predictions?.views || "1000 - 5000";
  
  // Parse predicted view range
  const viewRange = predictedViews.replace(/,/g, "").match(/(\d+)\s*-\s*(\d+)/);
  const minViews = viewRange ? parseInt(viewRange[1]) : 1000;
  const maxViews = viewRange ? parseInt(viewRange[2]) : 5000;
  const midViews = (minViews + maxViews) / 2;

  // Time multipliers (content accumulates views over time)
  const timeMultipliers = {
    "24h": 0.35,
    "72h": 0.65,
    "168h": 1.0,
  };
  const timeMul = timeMultipliers[timeframe] || 0.35;

  // Add realistic variance (-30% to +50% from prediction)
  const variance = 0.7 + Math.random() * 0.8; // 0.7 to 1.5
  
  const actualViews = Math.round(midViews * timeMul * variance);
  const predictedEngRate = parseFloat(prediction.predictions?.engagementRate || "4.0");
  const actualEngRate = Math.round((predictedEngRate * (0.6 + Math.random() * 0.8)) * 10) / 10;
  
  // Simulate specific metrics
  const likes = Math.round(actualViews * (actualEngRate / 100) * 0.6);
  const comments = Math.round(actualViews * (actualEngRate / 100) * 0.15);
  const shares = Math.round(actualViews * (actualEngRate / 100) * 0.1);
  const saves = Math.round(actualViews * (actualEngRate / 100) * 0.15);

  return {
    timeframe,
    views: actualViews,
    likes,
    comments,
    shares,
    saves,
    engagementRate: actualEngRate,
    impressions: Math.round(actualViews * (1.5 + Math.random())),
    ctr: Math.round((3 + Math.random() * 8) * 10) / 10,
    avgWatchTime: `${Math.round(20 + Math.random() * 60)}s`,
    simulatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate prediction accuracy by comparing predicted vs actual.
 */
export function calculateAccuracy(predicted, actual) {
  const predictedViews = predicted.predictions?.views || "1000 - 5000";
  const viewRange = predictedViews.replace(/,/g, "").match(/(\d+)\s*-\s*(\d+)/);
  const minViews = viewRange ? parseInt(viewRange[1]) : 1000;
  const maxViews = viewRange ? parseInt(viewRange[2]) : 5000;
  const midViews = (minViews + maxViews) / 2;

  // View accuracy: how close actual is to the predicted midpoint
  const viewDiff = Math.abs(actual.views - midViews);
  const viewAccuracy = Math.max(0, 100 - (viewDiff / midViews) * 100);

  // Engagement accuracy
  const predictedEng = parseFloat(predicted.predictions?.engagementRate || "4.0");
  const engDiff = Math.abs(actual.engagementRate - predictedEng);
  const engAccuracy = Math.max(0, 100 - (engDiff / predictedEng) * 100);

  // Overall accuracy (weighted)
  const overallAccuracy = Math.round(viewAccuracy * 0.6 + engAccuracy * 0.4);

  return {
    viewAccuracy: Math.round(viewAccuracy),
    engagementAccuracy: Math.round(engAccuracy),
    overallAccuracy,
    viewDelta: actual.views - midViews, // positive = overperform
    engDelta: Math.round((actual.engagementRate - predictedEng) * 10) / 10,
  };
}

/**
 * Record a feedback entry and save to history.
 */
export function recordFeedback(contentId, predicted, actual, accuracy) {
  const history = loadFeedbackHistory();
  
  history.push({
    id: `fb_${Date.now()}`,
    contentId,
    predicted: {
      score: predicted.score,
      views: predicted.predictions?.views,
      engagementRate: predicted.predictions?.engagementRate,
      competition: predicted.predictions?.competition,
    },
    actual: {
      views: actual.views,
      engagementRate: actual.engagementRate,
      likes: actual.likes,
      comments: actual.comments,
      shares: actual.shares,
      saves: actual.saves,
    },
    accuracy,
    timeframe: actual.timeframe,
    recordedAt: new Date().toISOString(),
  });

  saveFeedbackHistory(history);
  return history;
}

/**
 * Get rolling accuracy stats from feedback history.
 */
export function getRollingStats() {
  const history = loadFeedbackHistory();
  if (history.length === 0) {
    return {
      totalEntries: 0,
      avgAccuracy: 0,
      avgViewAccuracy: 0,
      avgEngAccuracy: 0,
      trend: "neutral",
      recentEntries: [],
    };
  }

  const recent = history.slice(-10);
  const avgAccuracy = Math.round(
    recent.reduce((s, h) => s + h.accuracy.overallAccuracy, 0) / recent.length
  );
  const avgViewAccuracy = Math.round(
    recent.reduce((s, h) => s + h.accuracy.viewAccuracy, 0) / recent.length
  );
  const avgEngAccuracy = Math.round(
    recent.reduce((s, h) => s + h.accuracy.engagementAccuracy, 0) / recent.length
  );

  // Determine if accuracy is improving
  let trend = "neutral";
  if (recent.length >= 4) {
    const firstHalf = recent.slice(0, Math.floor(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    const firstAvg = firstHalf.reduce((s, h) => s + h.accuracy.overallAccuracy, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((s, h) => s + h.accuracy.overallAccuracy, 0) / secondHalf.length;
    trend = secondAvg > firstAvg + 3 ? "improving" : secondAvg < firstAvg - 3 ? "declining" : "stable";
  }

  return {
    totalEntries: history.length,
    avgAccuracy,
    avgViewAccuracy,
    avgEngAccuracy,
    trend,
    recentEntries: recent,
  };
}

/**
 * Get calibration adjustment factors based on historical accuracy.
 * These can be fed back into the prediction model.
 */
export function getCalibrationFactors() {
  const history = loadFeedbackHistory();
  if (history.length < 3) {
    return { viewMultiplier: 1.0, engMultiplier: 1.0, confidence: "low" };
  }

  const recent = history.slice(-10);
  
  // Calculate average overestimate/underestimate
  const avgViewDelta = recent.reduce((s, h) => s + h.accuracy.viewDelta, 0) / recent.length;
  const avgEngDelta = recent.reduce((s, h) => s + h.accuracy.engDelta, 0) / recent.length;

  // If we're consistently overestimating views, reduce the multiplier
  const viewMultiplier = avgViewDelta < 0 ? 0.85 : avgViewDelta > 0 ? 1.15 : 1.0;
  const engMultiplier = avgEngDelta < 0 ? 0.9 : avgEngDelta > 0 ? 1.1 : 1.0;

  return {
    viewMultiplier: Math.round(viewMultiplier * 100) / 100,
    engMultiplier: Math.round(engMultiplier * 100) / 100,
    confidence: recent.length >= 8 ? "high" : recent.length >= 5 ? "medium" : "low",
    basedOnEntries: recent.length,
  };
}
