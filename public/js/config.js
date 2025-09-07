const getApiBaseUrl = () => {
    // For development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    
    // For production - using Render.com URL
    return 'YOUR_RENDER_URL/api'; // You'll replace this with your actual Render.com URL
};

const config = {
    apiBaseUrl: getApiBaseUrl()
};
