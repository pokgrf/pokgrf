class EarthquakeMonitor {
    constructor() {
        this.earthquakes = [];
        this.filteredEarthquakes = [];
        this.updateInterval = null;
        this.apiUrl = 'https://api.vedur.is/skjalftar/v1/';
        this.lastFetchTime = null;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startMonitoring();
    }

    initializeElements() {
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.totalEarthquakes = document.getElementById('totalEarthquakes');
        this.largestMagnitude = document.getElementById('largestMagnitude');
        this.lastUpdate = document.getElementById('lastUpdate');
        this.activeRegions = document.getElementById('activeRegions');
        this.earthquakeList = document.getElementById('earthquakeList');
        this.lastFetchTime = document.getElementById('lastFetchTime');
        this.magnitudeFilter = document.getElementById('magnitudeFilter');
        this.timeFilter = document.getElementById('timeFilter');
    }

    setupEventListeners() {
        this.magnitudeFilter.addEventListener('change', () => this.applyFilters());
        this.timeFilter.addEventListener('change', () => this.applyFilters());
    }

    async startMonitoring() {
        await this.fetchEarthquakeData();
        
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.fetchEarthquakeData();
        }, 30000);
    }

    async fetchEarthquakeData() {
        try {
            this.updateStatus('connecting', 'Fetching data...');
            
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'EarthquakeMonitor/1.0'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.results) {
                // Filter earthquakes based on requirements
                this.earthquakes = data.results.filter(quake => 
                    quake.originating_system === 'SIL' && 
                    quake.aut_mag && 
                    quake.magnitude_preference === 'Autmag'
                );

                this.updateStatistics();
                this.applyFilters();
                this.updateStatus('connected', 'Connected');
                this.updateLastFetchTime();
            } else {
                throw new Error('Invalid data format received');
            }

        } catch (error) {
            console.error('Error fetching earthquake data:', error);
            this.updateStatus('error', 'Connection Error');
            this.showErrorMessage('Failed to fetch earthquake data. Please check your connection and try again.');
        }
    }

    updateStatus(status, text) {
        this.statusIndicator.className = `status-indicator ${status}`;
        this.statusText.textContent = text;
    }

    updateStatistics() {
        if (this.earthquakes.length === 0) {
            this.totalEarthquakes.textContent = '0';
            this.largestMagnitude.textContent = '0.0';
            this.lastUpdate.textContent = 'No data';
            this.activeRegions.textContent = '0';
            return;
        }

        // Total earthquakes
        this.totalEarthquakes.textContent = this.earthquakes.length;

        // Largest magnitude
        const maxMagnitude = Math.max(...this.earthquakes.map(q => q.aut_mag || 0));
        this.largestMagnitude.textContent = maxMagnitude.toFixed(1);

        // Last update time
        const latestQuake = this.earthquakes.reduce((latest, current) => {
            const currentTime = new Date(current.timestamp || current.time);
            const latestTime = new Date(latest.timestamp || latest.time);
            return currentTime > latestTime ? current : latest;
        });
        
        if (latestQuake.timestamp || latestQuake.time) {
            const time = new Date(latestQuake.timestamp || latestQuake.time);
            this.lastUpdate.textContent = this.formatTime(time);
        }

        // Active regions (unique locations)
        const uniqueRegions = new Set(
            this.earthquakes
                .map(q => q.location || q.area || 'Unknown')
                .filter(loc => loc && loc !== 'Unknown')
        );
        this.activeRegions.textContent = uniqueRegions.size;
    }

    applyFilters() {
        const magnitudeFilter = this.magnitudeFilter.value;
        const timeFilter = parseInt(this.timeFilter.value);
        
        this.filteredEarthquakes = this.earthquakes.filter(quake => {
            // Magnitude filter
            if (magnitudeFilter) {
                const magnitude = quake.aut_mag || 0;
                const [min, max] = this.parseMagnitudeFilter(magnitudeFilter);
                
                if (max === null) {
                    // 5+ case
                    if (magnitude < min) return false;
                } else {
                    if (magnitude < min || magnitude >= max) return false;
                }
            }
            
            // Time filter
            if (timeFilter) {
                const quakeTime = new Date(quake.timestamp || quake.time);
                const cutoffTime = new Date(Date.now() - (timeFilter * 60 * 60 * 1000));
                if (quakeTime < cutoffTime) return false;
            }
            
            return true;
        });
        
        this.displayEarthquakes();
    }

    parseMagnitudeFilter(filter) {
        if (filter === '5+') {
            return [5, null];
        }
        
        const [min, max] = filter.split('-').map(Number);
        return [min, max];
    }

    displayEarthquakes() {
        if (this.filteredEarthquakes.length === 0) {
            this.earthquakeList.innerHTML = `
                <div class="loading">
                    <i class="fas fa-info-circle"></i>
                    <p>No earthquakes found matching the current filters.</p>
                </div>
            `;
            return;
        }

        // Sort by time (most recent first)
        const sortedQuakes = this.filteredEarthquakes.sort((a, b) => {
            const timeA = new Date(a.timestamp || a.time);
            const timeB = new Date(b.timestamp || b.time);
            return timeB - timeA;
        });

        this.earthquakeList.innerHTML = sortedQuakes.map(quake => 
            this.createEarthquakeHTML(quake)
        ).join('');
    }

    createEarthquakeHTML(quake) {
        const magnitude = quake.aut_mag || 0;
        const time = new Date(quake.timestamp || quake.time);
        const location = quake.location || quake.area || 'Unknown';
        const depth = quake.depth || 'Unknown';
        const latitude = quake.latitude || quake.lat || 'Unknown';
        const longitude = quake.longitude || quake.lon || 'Unknown';
        
        // Determine magnitude class for styling
        let magnitudeClass = 'magnitude-low';
        if (magnitude >= 4.0) {
            magnitudeClass = 'magnitude-high';
        } else if (magnitude >= 2.0) {
            magnitudeClass = 'magnitude-medium';
        }

        return `
            <div class="earthquake-item ${magnitudeClass}" onclick="this.classList.toggle('expanded')">
                <div class="earthquake-header">
                    <div class="earthquake-magnitude">M ${magnitude.toFixed(1)}</div>
                    <div class="earthquake-time">${this.formatTime(time)}</div>
                </div>
                <div class="earthquake-details">
                    <div class="detail-item">
                        <span class="detail-label">Location</span>
                        <span class="detail-value">${location}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Depth</span>
                        <span class="detail-value">${depth === 'Unknown' ? depth : depth + ' km'}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Coordinates</span>
                        <span class="detail-value coordinates">${latitude}, ${longitude}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">System</span>
                        <span class="detail-value">${quake.originating_system || 'Unknown'}</span>
                    </div>
                </div>
            </div>
        `;
    }

    formatTime(date) {
        const now = new Date();
        const diff = now - date;
        
        if (diff < 60000) { // Less than 1 minute
            return 'Just now';
        } else if (diff < 3600000) { // Less than 1 hour
            const minutes = Math.floor(diff / 60000);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diff < 86400000) { // Less than 1 day
            const hours = Math.floor(diff / 3600000);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
        }
    }

    updateLastFetchTime() {
        const now = new Date();
        this.lastFetchTime.textContent = `Last fetch: ${now.toLocaleTimeString()}`;
    }

    showErrorMessage(message) {
        this.earthquakeList.innerHTML = `
            <div class="loading">
                <i class="fas fa-exclamation-triangle" style="color: #ef4444;"></i>
                <p>${message}</p>
                <button onclick="earthquakeMonitor.fetchEarthquakeData()" style="
                    margin-top: 1rem;
                    padding: 0.5rem 1rem;
                    background: #667eea;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 0.9rem;
                ">Retry</button>
            </div>
        `;
    }

    stopMonitoring() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}

// Initialize the earthquake monitor when the page loads
let earthquakeMonitor;

document.addEventListener('DOMContentLoaded', () => {
    earthquakeMonitor = new EarthquakeMonitor();
});

// Handle page visibility changes to pause/resume updates
document.addEventListener('visibilitychange', () => {
    if (earthquakeMonitor) {
        if (document.hidden) {
            earthquakeMonitor.stopMonitoring();
        } else {
            earthquakeMonitor.startMonitoring();
        }
    }
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (earthquakeMonitor) {
        earthquakeMonitor.stopMonitoring();
    }
});