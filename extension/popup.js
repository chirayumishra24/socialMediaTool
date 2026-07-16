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

    // Save directly to extension storage under key "ig_profile_{username}"
    const username = payload.profile.username.toLowerCase().trim();
    chrome.storage.local.set({ [`ig_profile_${username}`]: payload }, () => {
      if (chrome.runtime.lastError) {
        showStatus(`Failed to save data: ${chrome.runtime.lastError.message}`, "error");
      } else {
        showStatus(`Successfully synced @${payload.profile.username}! Open your Skilizee Dashboard to see stats.`, "success");
      }
    });
  });
});

function showStatus(msg, type) {
  const statusBox = document.getElementById("status-box");
  statusBox.style.display = "block";
  statusBox.className = `status ${type}`;
  statusBox.textContent = msg;
}
