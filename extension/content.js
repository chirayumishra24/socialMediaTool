const isDashboard = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

if (isDashboard) {
  runDashboardBridge();
} else {
  // Listen for messages from the popup (Instagram Scraper mode)
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "scrape_profile") {
      performScrape()
        .then((data) => {
          sendResponse({ success: true, data });
        })
        .catch((err) => {
          sendResponse({ success: false, error: err.message });
        });
      return true; // Keep channel open for async response
    }
  });
}

function runDashboardBridge() {
  console.log("[Skilizee Extension] Dashboard Bridge active on", window.location.origin);
  
  // Initial sync from extension storage to page localStorage
  syncStorageToLocalStorage();

  // Listen for real-time updates when user syncs from popup
  try {
    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "local") {
        console.log("[Skilizee Extension] Extension storage updated, re-syncing...");
        syncStorageToLocalStorage();
      }
    });
  } catch (e) {
    console.error("[Skilizee Extension] Failed to bind storage listener:", e);
  }
}

function syncStorageToLocalStorage() {
  try {
    chrome.storage.local.get(null, (items) => {
      if (chrome.runtime.lastError) {
        console.error("[Skilizee Extension] Error reading extension storage:", chrome.runtime.lastError.message);
        return;
      }
      
      const cache = {};
      for (const [key, value] of Object.entries(items)) {
        if (key.startsWith("ig_profile_")) {
          const username = key.replace("ig_profile_", "");
          cache[username] = value;
        }
      }
      
      localStorage.setItem("skilizee_ig_sync_cache", JSON.stringify(cache));
      console.log("[Skilizee Extension] Successfully synced extension cache to local dashboard storage for @usernames:", Object.keys(cache));
      
      // Dispatch custom event to notify Next.js React client
      window.dispatchEvent(new CustomEvent("skilizee_cache_updated"));
    });
  } catch (e) {
    console.error("[Skilizee Extension] Error syncing storage:", e);
  }
}

async function performScrape() {
  const urlParts = window.location.pathname.split("/").filter(Boolean);
  if (urlParts.length === 0 || window.location.hostname !== "www.instagram.com") {
    throw new Error("Please navigate to an Instagram profile page (e.g. https://www.instagram.com/skillizee.io)");
  }

  const username = urlParts[0];
  const invalidRoutes = ["p", "reel", "reels", "explore", "stories", "direct", "developer", "emails", "accounts"];
  
  if (invalidRoutes.includes(username.toLowerCase())) {
    throw new Error("Please navigate to an Instagram profile page (e.g. https://www.instagram.com/skillizee.io) instead of a specific post, reel, or page.");
  }

  console.log("[Skilizee Crawler] Starting extraction for username:", username);

  // Tier 1: Try same-origin JSON fetch using active session
  try {
    const rawJson = await fetchInstagramProfileJson(username);
    if (rawJson) {
      const mapped = mapJsonToProfile(rawJson, username.toLowerCase().trim());
      if (mapped && mapped.profile && mapped.profile.followers > 0) {
        console.log("[Skilizee Crawler] Successfully fetched high-fidelity profile from same-origin JSON API:", mapped);
        return mapped;
      }
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Same-origin fetch failed:", e);
  }

  // Tier 2: Try extracting high-fidelity parsed JSON data from embedded script tags
  try {
    const scriptData = extractDataFromScripts(username);
    if (scriptData && scriptData.profile && scriptData.profile.followers > 0) {
      console.log("[Skilizee Crawler] Successfully parsed high-fidelity data from scripts:", scriptData);
      return scriptData;
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Script parsing attempt failed:", e);
  }

  // Initialize variables
  let followers = 0;
  let following = 0;
  let postCount = 0;
  let profilePic = "";
  let fullName = "";
  let bio = "";

  // 1. TRY METADATA PARSING (SEO description & title tags)
  try {
    const metaDesc = document.querySelector('meta[name="description"], meta[property="og:description"]');
    if (metaDesc) {
      const descContent = metaDesc.getAttribute("content") || "";
      console.log("[Skilizee Crawler] Found SEO Meta Description:", descContent);
      
      const followersMatch = descContent.match(/([\d,.]+[KkMm]?)\s*Followers/i);
      const followingMatch = descContent.match(/([\d,.]+[KkMm]?)\s*Following/i);
      const postsMatch = descContent.match(/([\d,.]+[KkMm]?)\s*Posts/i);

      if (followersMatch) followers = parseInstagramNumber(followersMatch[1]);
      if (followingMatch) following = parseInstagramNumber(followingMatch[1]);
      if (postsMatch) postCount = parseInstagramNumber(postsMatch[1]);
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Metadata description match failed:", e);
  }

  try {
    const ogImage = document.querySelector('meta[property="og:image"]');
    if (ogImage) {
      profilePic = ogImage.getAttribute("content") || "";
      console.log("[Skilizee Crawler] Found og:image:", profilePic);
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Metadata og:image match failed:", e);
  }

  try {
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      const titleContent = ogTitle.getAttribute("content") || "";
      const nameMatch = titleContent.match(/^([^(]+)\s*\(@/);
      if (nameMatch) {
        fullName = nameMatch[1].trim();
        console.log("[Skilizee Crawler] Found full name from og:title:", fullName);
      }
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Metadata og:title match failed:", e);
  }

  // 2. SCAN ALL DOM TEXT ELEMENTS (Extremely robust fallback for React layout changes)
  if (!followers || !following || !postCount) {
    console.log("[Skilizee Crawler] Falling back to recursive DOM text scanning...");
    try {
      const elements = Array.from(document.querySelectorAll('span, a, div, h1, h2, h3, li'));
      for (const el of elements) {
        // Skip elements that have children to focus on leaf text nodes
        if (el.children.length > 0) continue;
        const text = (el.textContent || "").trim();
        if (!text) continue;

        // Check if text is exactly "followers"
        if (/^followers$/i.test(text)) {
          const parent = el.parentElement;
          if (parent) {
            const parentText = parent.textContent.trim();
            const numMatch = parentText.match(/([\d,.]+[KkMm]?)/);
            if (numMatch && !followers) {
              followers = parseInstagramNumber(numMatch[1]);
              console.log("[Skilizee Crawler] Scraped followers count from element:", followers);
            }
          }
        }
        
        // Check if text is exactly "following"
        if (/^following$/i.test(text)) {
          const parent = el.parentElement;
          if (parent) {
            const parentText = parent.textContent.trim();
            const numMatch = parentText.match(/([\d,.]+[KkMm]?)/);
            if (numMatch && !following) {
              following = parseInstagramNumber(numMatch[1]);
              console.log("[Skilizee Crawler] Scraped following count from element:", following);
            }
          }
        }

        // Check if text is exactly "posts"
        if (/^posts$/i.test(text)) {
          const parent = el.parentElement;
          if (parent) {
            const parentText = parent.textContent.trim();
            const numMatch = parentText.match(/([\d,.]+[KkMm]?)/);
            if (numMatch && !postCount) {
              postCount = parseInstagramNumber(numMatch[1]);
              console.log("[Skilizee Crawler] Scraped posts count from element:", postCount);
            }
          }
        }
      }
    } catch (e) {
      console.warn("[Skilizee Crawler] DOM text scanning exception:", e);
    }
  }

  // 3. FALLBACK BODY TEXT REGEX
  if (!followers || !following || !postCount) {
    console.log("[Skilizee Crawler] Falling back to whole-body regex scan...");
    try {
      const bodyText = document.body.innerText || "";
      const followersMatch = bodyText.match(/([\d,.]+[KkMm]?)\s*followers/i);
      const followingMatch = bodyText.match(/([\d,.]+[KkMm]?)\s*following/i);
      const postsMatch = bodyText.match(/([\d,.]+[KkMm]?)\s*posts/i);

      if (!followers && followersMatch) followers = parseInstagramNumber(followersMatch[1]);
      if (!following && followingMatch) following = parseInstagramNumber(followingMatch[1]);
      if (!postCount && postsMatch) postCount = parseInstagramNumber(postsMatch[1]);
      console.log("[Skilizee Crawler] Whole body regex results:", { followers, following, postCount });
    } catch (e) {
      console.warn("[Skilizee Crawler] Body text matching failed:", e);
    }
  }

  // 4. FIND PROFILE PICTURE
  if (!profilePic) {
    try {
      const imgs = Array.from(document.querySelectorAll('img'));
      for (const img of imgs) {
        const alt = (img.getAttribute('alt') || '').toLowerCase().trim();
        const src = img.getAttribute('src') || '';
        if (
          alt.includes('profile picture') || 
          alt.includes('profile photo') || 
          alt.includes('avatar') ||
          alt === username.toLowerCase() ||
          (fullName && alt === fullName.toLowerCase())
        ) {
          profilePic = src;
          console.log("[Skilizee Crawler] Found profile pic from img tag alt match:", profilePic);
          break;
        }
      }
      
      // Secondary fallback: get first image in any header or top container
      if (!profilePic) {
        const headerImgs = document.querySelectorAll('header img, section img');
        for (const img of headerImgs) {
          if (img.src && (img.src.includes("cdninstagram.com") || img.src.includes("fbcdn.net"))) {
            profilePic = img.src;
            console.log("[Skilizee Crawler] Found profile pic from section img src path:", profilePic);
            break;
          }
        }
      }
    } catch (e) {
      console.warn("[Skilizee Crawler] Profile image scan failed:", e);
    }
  }

  // 5. EXTRACT FULL NAME & BIO FROM DOM
  try {
    const headerEl = document.querySelector('header h2, header h1, h2, h1');
    if (headerEl) {
      if (!fullName) {
        fullName = headerEl.textContent.trim();
      }
      const headerContainer = headerEl.closest('section') || headerEl.parentElement;
      if (headerContainer) {
        const spans = headerContainer.querySelectorAll('span, div');
        const textContents = Array.from(spans)
          .map(s => s.textContent.trim())
          .filter(t => t && t.length > 5 && !t.includes('followers') && !t.includes('following') && !t.includes('posts'));
        if (textContents.length > 0) {
          if (!fullName || fullName === username) {
            fullName = textContents[0];
          }
          bio = textContents.slice(1, 4).join("\n");
        }
      }
    }
  } catch (e) {
    console.warn("[Skilizee Crawler] Fullname & Bio DOM scan failed:", e);
  }

  // 6. EXTRACT RECENT POSTS
  const posts = [];
  try {
    const postElements = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'));
    const processedHrefs = new Set();

    for (const el of postElements) {
      if (posts.length >= 12) break;
      const href = el.getAttribute('href');
      if (!href || processedHrefs.has(href)) continue;
      processedHrefs.add(href);

      const url = `https://www.instagram.com${href}`;
      const imgEl = el.querySelector('img');
      const thumbnail = imgEl ? imgEl.src : "";
      const contentType = href.includes('/reel/') ? "Reel / Video" : "Static Image";

      // Tier 1: Try parsing from image alt text directly (extremely fast & reliable)
      const alt = imgEl ? (imgEl.getAttribute('alt') || "") : "";
      let { likes, comments } = parseStatsFromAlt(alt);

      // Tier 2: If alt text didn't yield values, try hover simulation with 150ms delay
      if (likes === 0 && comments === 0) {
        try {
          const hovered = await hoverAndScrapePost(el);
          likes = hovered.likes;
          comments = hovered.comments;
        } catch (hoverErr) {
          console.warn("[Skilizee Crawler] Post hover scrape failed:", hoverErr);
        }
      }

      const views = contentType === "Reel / Video" ? likes * 4 : 0;

      posts.push({
        id: href.replace(/\//g, "_"),
        caption: imgEl ? (imgEl.getAttribute('alt') || "") : "",
        contentType,
        likes,
        comments,
        views,
        timestamp: null,
        thumbnail,
        url,
        hashtags: [],
        engagementLevel: likes > 1000 ? "High" : likes > 200 ? "Medium" : "Unknown",
      });
    }
    console.log(`[Skilizee Crawler] Extracted ${posts.length} posts`);
  } catch (e) {
    console.warn("[Skilizee Crawler] Post extraction failed:", e);
  }

  const isLoggedIn = document.cookie.includes("ds_user_id") || 
                     !!document.querySelector('svg[aria-label="Direct"], svg[aria-label="Messenger"], a[href*="/direct/"], svg[aria-label="Home"]') || 
                     !!document.querySelector('img[alt*="profile picture"]');

  return {
    profile: {
      username,
      fullName: fullName || username,
      bio: bio || "Instagram Profile",
      followers,
      following,
      postCount: postCount || posts.length,
      profilePic: profilePic || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop",
      isVerified: !!document.querySelector('[title="Verified"], [aria-label="Verified"], svg[aria-label="Verified"]'),
      externalUrl: window.location.href,
      category: "Creator",
    },
    posts,
    isLoggedIn
  };
}

function parseInstagramNumber(text) {
  if (!text) return 0;
  const clean = text.replace(/,/g, "").trim().toLowerCase();
  
  // Extract number part
  const match = clean.match(/([\d.]+)\s*([km]?)/);
  if (!match) return 0;

  const val = parseFloat(match[1]);
  const unit = match[2];

  if (unit === 'm') return Math.round(val * 1000000);
  if (unit === 'k') return Math.round(val * 1000);
  return Math.round(val);
}

function extractDataFromScripts(targetUsername) {
  const scripts = Array.from(document.querySelectorAll('script'));
  const cleanTarget = targetUsername.toLowerCase().trim();

  for (const script of scripts) {
    const text = script.textContent || "";
    
    // Look for tags containing timeline media
    if (
      !text.includes("edge_owner_to_timeline_media") &&
      !text.includes("edge_media_preview_like") &&
      !text.includes("xdt_api__v1__feed")
    ) {
      continue;
    }

    try {
      let jsonObjects = [];
      
      const fnMatches = [
        /window\._sharedData\s*=\s*({.+?});/s,
        /window\.__additionalDataLoaded\s*\(\s*['"][^'"]+['"]\s*,\s*({.+?})\s*\);/s,
        /requireLazy\(\['[^']+'\],function\([^)]+\)\{.*?\((.+?)\);?\s*\}\);/s,
        /{\s*"[^"]+"\s*:\s*.+}/s
      ];

      for (const regex of fnMatches) {
        const matches = text.match(regex);
        if (matches) {
          try {
            const parsed = JSON.parse(matches[1]);
            jsonObjects.push(parsed);
          } catch (e) {}
        }
      }

      if (jsonObjects.length === 0) {
        try {
          const parsed = JSON.parse(text);
          jsonObjects.push(parsed);
        } catch (e) {}
      }

      if (jsonObjects.length === 0) {
        let openBrackets = 0;
        let startIdx = -1;
        for (let i = 0; i < text.length; i++) {
          if (text[i] === '{') {
            if (openBrackets === 0) startIdx = i;
            openBrackets++;
          } else if (text[i] === '}') {
            openBrackets--;
            if (openBrackets === 0 && startIdx !== -1) {
              const candidate = text.substring(startIdx, i + 1);
              if (candidate.length > 500) {
                try {
                  const parsed = JSON.parse(candidate);
                  jsonObjects.push(parsed);
                } catch (e) {}
              }
            }
          }
        }
      }

      for (const obj of jsonObjects) {
        const results = findKeysInObject(obj, ["user", "graphql", "edge_owner_to_timeline_media", "xdt_api__v1__feed__user_timeline_graphql_connection"]);
        if (results.user || results.edge_owner_to_timeline_media || results.xdt_api__v1__feed__user_timeline_graphql_connection) {
          const profileAndPosts = mapJsonToProfile(obj, cleanTarget);
          if (profileAndPosts && profileAndPosts.profile.followers > 0) {
            return profileAndPosts;
          }
        }
      }
    } catch (err) {
      console.warn("[Skilizee Crawler] Script parse error:", err);
    }
  }
  return null;
}

function findKeysInObject(obj, keys) {
  const found = {};
  if (!obj || typeof obj !== "object") return found;

  const stack = [obj];
  const visited = new Set();

  while (stack.length > 0) {
    const current = stack.pop();
    if (visited.has(current)) continue;
    visited.add(current);

    for (const key of Object.keys(current)) {
      if (keys.includes(key)) {
        found[key] = current[key];
      }
      const val = current[key];
      if (val && typeof val === "object") {
        stack.push(val);
      }
    }
  }
  return found;
}

function mapJsonToProfile(root, targetUsername) {
  let user = null;
  
  if (root?.entry_data?.ProfilePage?.[0]?.graphql?.user) {
    user = root.entry_data.ProfilePage[0].graphql.user;
  }
  if (!user && root?.graphql?.user) {
    user = root.graphql.user;
  }
  if (!user && root?.user) {
    user = root.user;
  }

  if (!user) {
    const queue = [root];
    const visited = new Set();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== "object" || visited.has(current)) continue;
      visited.add(current);

      if (current.username && String(current.username).toLowerCase() === targetUsername) {
        if (current.edge_followed_by || current.followers_count || current.edge_owner_to_timeline_media) {
          user = current;
          break;
        }
      }

      for (const k of Object.keys(current)) {
        if (current[k] && typeof current[k] === "object") {
          queue.push(current[k]);
        }
      }
    }
  }

  if (!user) return null;

  const username = user.username || targetUsername;
  const fullName = user.full_name || user.fullName || username;
  const bio = user.biography || user.bio || "";
  
  const followers = parseInt(
    user.edge_followed_by?.count || 
    user.followers_count || 
    user.follower_count || 0
  );
  
  const following = parseInt(
    user.edge_follow?.count || 
    user.following_count || 0
  );
  
  const postCount = parseInt(
    user.edge_owner_to_timeline_media?.count || 
    user.media_count || 0
  );
  
  const profilePic = user.profile_pic_url_hd || user.profile_pic_url || "";
  const externalUrl = user.external_url || user.externalUrl || "";

  const posts = [];
  let edges = [];

  if (user.edge_owner_to_timeline_media?.edges) {
    edges = user.edge_owner_to_timeline_media.edges;
  } else if (user.media?.nodes) {
    edges = user.media.nodes.map(node => ({ node }));
  } else {
    const queue = [user];
    const visited = new Set();
    while (queue.length > 0) {
      const current = queue.shift();
      if (!current || typeof current !== "object" || visited.has(current)) continue;
      visited.add(current);

      if (Array.isArray(current.edges)) {
        edges = current.edges;
        break;
      }
      if (Array.isArray(current) && current.length > 0 && current[0]?.node) {
        edges = current;
        break;
      }

      for (const k of Object.keys(current)) {
        if (current[k] && typeof current[k] === "object") {
          queue.push(current[k]);
        }
      }
    }
  }

  if (Array.isArray(edges)) {
    edges.forEach((edge) => {
      const node = edge?.node || edge;
      if (!node || !node.id) return;
      if (posts.length >= 12) return;

      const code = node.shortcode || node.code || "";
      const likes = parseInt(
        node.edge_liked_by?.count || 
        node.edge_media_preview_like?.count || 
        node.like_count || 0
      );
      
      const comments = parseInt(
        node.edge_media_to_comment?.count || 
        node.edge_media_to_parent_comment?.count || 
        node.comment_count || 0
      );

      const views = parseInt(node.video_view_count || node.view_count || (node.is_video ? likes * 4 : 0));
      const caption = node.edge_media_to_caption?.edges?.[0]?.node?.text || node.caption || "";
      const thumbnail = node.display_url || node.display_src || node.thumbnail_src || "";
      
      const isVideo = !!(node.is_video || node.media_type === 2);
      const isCarousel = !!(node.media_type === 8 || node.edge_sidecar_to_children);
      
      let contentType = "Static Image";
      if (isVideo) contentType = "Reel / Video";
      else if (isCarousel) contentType = "Carousel";

      let timestamp = null;
      const ts = node.taken_at_timestamp || node.timestamp;
      if (ts) {
        timestamp = new Date(ts * 1000).toISOString();
      }

      posts.push({
        id: node.id,
        caption,
        contentType,
        likes,
        comments,
        views,
        timestamp,
        thumbnail,
        url: code ? `https://www.instagram.com/p/${code}/` : "",
        hashtags: caption.match(/#[\w]+/g) || [],
        engagementLevel: likes > 1000 ? "High" : "Medium",
      });
    });
  }

  const isLoggedIn = document.cookie.includes("ds_user_id") || 
                     !!document.querySelector('svg[aria-label="Direct"], svg[aria-label="Messenger"], a[href*="/direct/"], svg[aria-label="Home"]') || 
                     !!document.querySelector('img[alt*="profile picture"]');

  return {
    profile: {
      username,
      fullName,
      bio,
      followers,
      following,
      postCount,
      profilePic,
      isVerified: !!user.is_verified,
      externalUrl,
      category: user.category_name || "Creator",
    },
    posts,
    isLoggedIn
  };
}

async function fetchInstagramProfileJson(username) {
  try {
    const url = `${window.location.origin}/${username}/?__a=1&__d=dis`;
    console.log(`[Skilizee Crawler] Fetching JSON from same-origin: ${url}`);
    const res = await fetch(url, {
      headers: {
        "x-ig-app-id": "936619743392459", // Instagram official web client ID
      }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    console.warn("[Skilizee Crawler] Same-origin API fetch failed:", err);
    return null;
  }
}

async function hoverAndScrapePost(el) {
  // Trigger hover events to force React UI hydration of the post overlay
  el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  
  // Wait 150ms for DOM overlay rendering
  await new Promise(resolve => setTimeout(resolve, 150));
  
  let likes = 0;
  let comments = 0;
  
  const svgs = Array.from(el.querySelectorAll('svg'));
  svgs.forEach(svg => {
    const ariaLabel = (svg.getAttribute('aria-label') || '').toLowerCase();
    const parentText = svg.parentElement ? svg.parentElement.textContent.trim() : "";
    if (ariaLabel.includes('like') || ariaLabel.includes('heart') || ariaLabel.includes('likes') || ariaLabel.includes('hearts')) {
      const num = parseInstagramNumber(parentText);
      if (num > 0) likes = num;
    }
    if (ariaLabel.includes('comment') || ariaLabel.includes('comments')) {
      const num = parseInstagramNumber(parentText);
      if (num > 0) comments = num;
    }
  });

  if (likes === 0 && comments === 0) {
    const listItems = Array.from(el.querySelectorAll('ul li, span, div'));
    const numbers = [];
    for (const item of listItems) {
      if (item.children.length === 0) {
        const txt = item.textContent.trim();
        const num = parseInstagramNumber(txt);
        if (num > 0 && /^\d+[\d,.]*[kkm]?$/i.test(txt)) {
          numbers.push(num);
        }
      }
    }
    if (numbers.length >= 2) {
      likes = numbers[0];
      comments = numbers[1];
    } else if (numbers.length === 1) {
      likes = numbers[0];
    }
  }

  // Fallback: search any leaf text node under the element containing numbers using tree-walker
  if (likes === 0 && comments === 0) {
    const textNodes = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      const num = parseInstagramNumber(text);
      if (num > 0 && /^\d+[\d,.]*[kkm]?$/i.test(text)) {
        textNodes.push(num);
      }
    }
    if (textNodes.length >= 2) {
      likes = textNodes[0];
      comments = textNodes[1];
    } else if (textNodes.length === 1) {
      likes = textNodes[0];
    }
  }

  // Mouse leave cleanup
  el.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
  el.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));

  return { likes, comments };
}

function parseStatsFromAlt(alt) {
  let likes = 0;
  let comments = 0;
  if (!alt) return { likes, comments };

  const likesMatch = alt.match(/([\d,.]+[KkMm]?)\s*likes/i);
  if (likesMatch) {
    likes = parseInstagramNumber(likesMatch[1]);
  }

  const commentsMatch = alt.match(/([\d,.]+[KkMm]?)\s*comments/i);
  if (commentsMatch) {
    comments = parseInstagramNumber(commentsMatch[1]);
  }

  return { likes, comments };
}
