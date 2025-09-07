import express from 'express';
import cors from 'cors';
import path from 'path';

const app = express();
const port = process.env.PORT || 3000;

// CORS configuration
const corsOptions = {
  origin: [
    'https://zakajobs.com',
    'https://www.zakajobs.com',
    'http://localhost:3000'  // for local development
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static('public'));

// Mock Data
const customers = [
    { id: 1, name: 'Customer 1', location: { lat: 24.7136, lng: 46.6753 } },
    { id: 2, name: 'Customer 2', location: { lat: 24.7225, lng: 46.6901 } },
    { id: 3, name: 'Customer 3', location: { lat: 24.7324, lng: 46.7072 } },
    { id: 4, name: 'Customer 4', location: { lat: 24.7136, lng: 46.6853 } },
    { id: 5, name: 'Customer 5', location: { lat: 24.7436, lng: 46.6953 } },
    { id: 6, name: 'Customer 6', location: { lat: 24.7336, lng: 46.6653 } },
    { id: 7, name: 'Customer 7', location: { lat: 24.7236, lng: 46.6853 } },
    { id: 8, name: 'Customer 8', location: { lat: 24.7436, lng: 46.6753 } },
    { id: 9, name: 'Customer 9', location: { lat: 24.7536, lng: 46.6953 } },
    { id: 10, name: 'Customer 10', location: { lat: 24.7136, lng: 46.7053 } }
];

const drivers = [
    { id: 1, name: 'Driver 1', location: { lat: 24.7136, lng: 46.6753 }, available: true },
    { id: 2, name: 'Driver 2', location: { lat: 24.7225, lng: 46.6901 }, available: true },
    { id: 3, name: 'Driver 3', location: { lat: 24.7324, lng: 46.7072 }, available: true },
    { id: 4, name: 'Driver 4', location: { lat: 24.7136, lng: 46.6853 }, available: true },
    { id: 5, name: 'Driver 5', location: { lat: 24.7436, lng: 46.6953 }, available: true }
];

// In-memory storage for rides
const rides = new Map();

// Routes
app.get('/', (_, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/driver', (_, res) => {
    res.sendFile(path.join(__dirname, '../public/driver.html'));
});

app.get('/admin', (_, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
});

// API Routes
app.get('/api/drivers', (_, res) => {
    res.json(drivers.filter(driver => driver.available));
});

app.post('/api/rides/request', (req, res) => {
    const { customerId, pickupLocation, dropoffLocation } = req.body;
    const rideId = Date.now().toString();
    const ride = {
        id: rideId,
        customerId,
        pickupLocation,
        dropoffLocation,
        status: 'REQUESTED',
        createdAt: new Date(),
        driverId: null
    };
    rides.set(rideId, ride);
    res.json(ride);
});

app.put('/api/rides/:rideId/accept', (req, res) => {
    const { rideId } = req.params;
    const { driverId } = req.body;
    const ride = rides.get(rideId);
    
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'REQUESTED') {
        return res.status(400).json({ error: 'Ride cannot be accepted' });
    }
    
    ride.status = 'ACCEPTED';
    ride.driverId = driverId;
    rides.set(rideId, ride);
    
    const driver = drivers.find(d => d.id === driverId);
    if (driver) {
        driver.available = false;
    }
    
    res.json(ride);
});

app.put('/api/rides/:rideId/complete', (req, res) => {
    const { rideId } = req.params;
    const ride = rides.get(rideId);
    
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'ACCEPTED') {
        return res.status(400).json({ error: 'Ride cannot be completed' });
    }
    
    ride.status = 'COMPLETED';
    ride.completedAt = new Date();
    rides.set(rideId, ride);
    
    const driver = drivers.find(d => d.id === ride.driverId);
    if (driver) {
        driver.available = true;
    }
    
    res.json(ride);
});

// New endpoint for cancelling rides
app.put('/api/rides/:rideId/cancel', (req, res) => {
    const { rideId } = req.params;
    const ride = rides.get(rideId);
    
    if (!ride) {
        return res.status(404).json({ error: 'Ride not found' });
    }
    
    if (ride.status !== 'ACCEPTED') {
        return res.status(400).json({ error: 'Only accepted rides can be cancelled' });
    }
    
    ride.status = 'CANCELLED';
    ride.cancelledAt = new Date();
    rides.set(rideId, ride);
    
    const driver = drivers.find(d => d.id === ride.driverId);
    if (driver) {
        driver.available = true;
    }
    
    res.json(ride);
});

app.get('/api/rides/active', (_, res) => {
    const activeRides = Array.from(rides.values()).filter(
        ride => ride.status === 'REQUESTED' || ride.status === 'ACCEPTED'
    );
    res.json(activeRides);
});

app.get('/api/stats', (_, res) => {
    const allRides = Array.from(rides.values());
    const stats = {
        totalRides: allRides.length,
        activeRides: allRides.filter(r => r.status === 'REQUESTED' || r.status === 'ACCEPTED').length,
        completedRides: allRides.filter(r => r.status === 'COMPLETED').length,
        availableDrivers: drivers.filter(d => d.available).length
    };
    res.json(stats);
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
