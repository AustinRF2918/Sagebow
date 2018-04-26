module.exports = {
    DEBUG: true,
    API_KEY: 'DJJzSXqqAhl30URUOtKfmsZJkEZESNEqiKg58CxC',
    APP_PORT: process.env.PORT || 4001,
    REDIS_CONNECTION: require('redis').createClient()
};
