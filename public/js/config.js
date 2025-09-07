const getApiBaseUrl = () => {
    // For development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // For production - using Render.com URL
    return 'https://metro-link-api.onrender.com/api';
};

const config = {
    apiBaseUrl: getApiBaseUrl()
};
