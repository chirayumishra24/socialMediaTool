document.getElementById("sync-btn").addEventListener("click", async () => {
  const statusBox = document.getElementById("status-box");
  statusBox.style.display = "none";
  statusBox.className = "status";

  // Get active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.url.includes("instagram.com")) {
    showStatus("Please open Instagram.com and visit a profile page first.", "error");
    return;
  }

  // Hide preview card on fresh click
  document.getElementById("preview-box").style.display = "none";
  showStatus("Extracting profile info...", "success");

  // Send message to content script to perform scrape
  chrome.tabs.sendMessage(tab.id, { action: "scrape_profile" }, async (response) => {
    if (chrome.runtime.lastError || !response || !response.success) {
      showStatus(
        "Failed to read page. Please refresh the Instagram page and try again.",
        "error"
      );
      return;
    }

    const payload = response.data;
    
    // Show proof of scrape
    try {
      document.getElementById("preview-pic").src = payload.profile.profilePic || "https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop";
      document.getElementById("preview-fullname").textContent = payload.profile.fullName || payload.profile.username || "Instagram User";
      document.getElementById("preview-user").textContent = `@${payload.profile.username}`;
      document.getElementById("preview-followers").textContent = Number(payload.profile.followers || 0).toLocaleString();
      document.getElementById("preview-posts").textContent = Array.isArray(payload.posts) ? payload.posts.length : 0;
      document.getElementById("preview-box").style.display = "flex";
    } catch (e) {
      console.error("Error setting preview data:", e);
    }

    showStatus(`Extracted @${payload.profile.username}! Syncing...`, "success");

    // Try posting to localhost ports 3000, 3001, and 3002
    const ports = [3000, 3001, 3002];
    let success = false;
    let errMessage = "";

    for (const port of ports) {
      try {
        const res = await fetch(`http://localhost:${port}/api/meta/instagram/scrape`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ manual: payload }),
        });

        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {
        errMessage = err.message;
      }
    }

    if (success) {
      showStatus(`Successfully synced @${payload.profile.username}! Open your Skilizee Dashboard to see stats.`, "success");
    } else {
      showStatus(`Could not connect to Skilizee Dashboard server. Ensure your dev server is running on localhost.`, "error");
    }
  });
});

function showStatus(msg, type) {
  const statusBox = document.getElementById("status-box");
  statusBox.style.display = "block";
  statusBox.className = `status ${type}`;
  statusBox.textContent = msg;
}
