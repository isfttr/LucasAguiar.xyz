!function () {
    const CACHE_KEY = 'repo_version_cache';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
    const POLLING_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

    async function fetchLatestTag() {
        try {
            // Check cache first
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            const now = Date.now();

            // If cache is valid and not expired, use it
            if (cache.version && cache.timestamp && (now - cache.timestamp < CACHE_DURATION)) {
                updateVersionDisplay(cache.version);
                return cache.version;
            }

            // Fetch new version from GitHub API
            const response = await fetch('https://api.github.com/repos/isfttr/LucasAguiar.xyz/tags');
            const tags = await response.json();

            if (tags && tags.length > 0) {
                const latestTag = tags[0].name;

                // Update cache
                localStorage.setItem(CACHE_KEY, JSON.stringify({
                    version: latestTag,
                    timestamp: now
                }));

                updateVersionDisplay(latestTag);
                return latestTag;
            }
        } catch (error) {
            console.error('Error fetching repository version:', error);
            // If error occurs, try to use cached version
            const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
            if (cache.version) {
                updateVersionDisplay(cache.version);
                return cache.version;
            }
        }
    }

    function updateVersionDisplay(version) {
        const versionElement = document.getElementById('repo-version');
        if (versionElement && versionElement.textContent !== version) {
            versionElement.textContent = version;
        }
    }

    // Initial fetch when DOM is ready
    document.addEventListener('DOMContentLoaded', fetchLatestTag);

    // Set up polling for updates
    setInterval(fetchLatestTag, POLLING_INTERVAL);
}();