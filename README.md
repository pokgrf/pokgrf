# Live Earthquake Monitor - IMO API

A real-time earthquake monitoring website that displays live earthquake data from the Icelandic Met Office (IMO) API. The website automatically filters earthquakes based on specific criteria and updates every 30 seconds.

## Features

- **Real-time Updates**: Automatically fetches new earthquake data every 30 seconds
- **Smart Filtering**: Only shows earthquakes that meet specific criteria:
  - `originating_system`: SIL
  - `aut_mag`: Available (automatic magnitude)
  - `magnitude_preference`: Autmag
- **Interactive Dashboard**: 
  - Total earthquake count
  - Largest magnitude recorded
  - Last update time
  - Active regions count
- **Advanced Filtering**: Filter by magnitude range and time period
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Modern UI**: Beautiful gradient background with glassmorphism effects

## API Requirements

The website specifically filters for earthquakes with:
- **Originating System**: SIL (Seismological Institute of Iceland)
- **Magnitude Type**: Automatic magnitude (aut_mag)
- **Magnitude Preference**: Autmag (Automatic magnitude)

## Setup Instructions

1. **Clone or Download**: Save all files to a local directory
2. **Open in Browser**: Simply open `index.html` in any modern web browser
3. **No Server Required**: The website works directly from the file system

## Files

- `index.html` - Main HTML structure
- `styles.css` - Modern CSS styling with responsive design
- `script.js` - JavaScript functionality for data fetching and UI updates
- `README.md` - This documentation file

## API Endpoint

The website fetches data from:
```
https://api.vedur.is/skjalftar/v1/
```

## Data Update Frequency

- **Initial Load**: Data loads immediately when the page opens
- **Auto-refresh**: Updates every 30 seconds
- **Smart Pausing**: Pauses updates when the page is not visible (saves bandwidth)

## Filtering Options

### Magnitude Filters
- All Magnitudes
- 0.0 - 1.0
- 1.0 - 2.0
- 2.0 - 3.0
- 3.0 - 4.0
- 4.0 - 5.0
- 5.0+

### Time Filters
- Last 24 Hours
- Last 48 Hours
- Last Week

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features in Detail

### Real-time Status Indicator
- **Green**: Successfully connected and receiving data
- **Red**: Connection error
- **Gray**: Connecting or initializing

### Earthquake Display
Each earthquake shows:
- Magnitude (with color coding)
- Time since occurrence
- Location
- Depth
- Coordinates
- Originating system

### Magnitude Color Coding
- **Green**: Low magnitude (0.0 - 1.9)
- **Orange**: Medium magnitude (2.0 - 3.9)
- **Red**: High magnitude (4.0+)

## Troubleshooting

### No Data Displayed
1. Check your internet connection
2. Verify the IMO API is accessible
3. Check browser console for error messages
4. Ensure the API returns earthquakes matching the filter criteria

### Connection Errors
- The website will automatically retry failed connections
- A retry button appears if manual intervention is needed
- Check if the IMO API is experiencing downtime

## Technical Details

- **Framework**: Vanilla JavaScript (no external dependencies)
- **Styling**: Pure CSS with modern features (CSS Grid, Flexbox, CSS Variables)
- **Icons**: Font Awesome 6.0
- **Fonts**: Inter (Google Fonts)
- **Responsive**: Mobile-first design approach

## License

This project is open source and available under the MIT License.

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the earthquake monitoring website.
