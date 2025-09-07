// Data storage keys
const KEYS = {
    RIDES: 'metro_link_rides',
    LAST_RIDE_ID: 'metro_link_last_ride_id'
};

// Initialize data if not exists
if (!localStorage.getItem(KEYS.RIDES)) {
    localStorage.setItem(KEYS.RIDES, JSON.stringify([]));
    localStorage.setItem(KEYS.LAST_RIDE_ID, '0');
}

// Utility functions
const getNextRideId = () => {
    const lastId = parseInt(localStorage.getItem(KEYS.LAST_RIDE_ID) || '0');
    const nextId = lastId + 1;
    localStorage.setItem(KEYS.LAST_RIDE_ID, nextId.toString());
    return nextId;
};

const getAllRides = () => {
    return JSON.parse(localStorage.getItem(KEYS.RIDES) || '[]');
};

const saveRides = (rides) => {
    localStorage.setItem(KEYS.RIDES, JSON.stringify(rides));
};

// Data service functions
const dataService = {
    // Request a new ride
    requestRide: (customerId, pickupLocation, dropoffLocation) => {
        const rides = getAllRides();
        const newRide = {
            id: getNextRideId(),
            customerId: parseInt(customerId),
            pickupLocation,
            dropoffLocation,
            status: 'REQUESTED',
            createdAt: new Date().toISOString(),
            driverId: null
        };
        rides.push(newRide);
        saveRides(rides);
        return newRide;
    },

    // Get active rides
    getActiveRides: () => {
        const rides = getAllRides();
        return rides.filter(ride => ['REQUESTED', 'ACCEPTED'].includes(ride.status));
    },

    // Get all rides
    getAllRides: () => {
        return getAllRides();
    },

    // Get a specific ride
    getRide: (rideId) => {
        const rides = getAllRides();
        return rides.find(ride => ride.id === parseInt(rideId));
    },

    // Update ride status
    updateRideStatus: (rideId, status, driverId = null) => {
        const rides = getAllRides();
        const rideIndex = rides.findIndex(ride => ride.id === parseInt(rideId));
        if (rideIndex !== -1) {
            rides[rideIndex] = {
                ...rides[rideIndex],
                status,
                driverId: driverId || rides[rideIndex].driverId,
                updatedAt: new Date().toISOString()
            };
            saveRides(rides);
            return rides[rideIndex];
        }
        return null;
    },

    // Get customer's active ride
    getCustomerActiveRide: (customerId) => {
        const rides = getAllRides();
        return rides.find(ride => 
            ride.customerId === parseInt(customerId) && 
            ['REQUESTED', 'ACCEPTED'].includes(ride.status)
        );
    },

    // Get driver's active rides
    getDriverActiveRides: (driverId) => {
        const rides = getAllRides();
        return rides.filter(ride => 
            ride.driverId === parseInt(driverId) && 
            ['ACCEPTED'].includes(ride.status)
        );
    },

    // Accept a ride
    acceptRide: (rideId, driverId) => {
        return dataService.updateRideStatus(rideId, 'ACCEPTED', driverId);
    },

    // Complete a ride
    completeRide: (rideId) => {
        return dataService.updateRideStatus(rideId, 'COMPLETED');
    },

    // Cancel a ride
    cancelRide: (rideId) => {
        return dataService.updateRideStatus(rideId, 'CANCELLED');
    }
};
