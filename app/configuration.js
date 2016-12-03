module.exports = {
    DEBUG: true,
    EXPRESS_PORT: process.env.PORT,
    EXPRESS_ROOT: "./" + '/public',
    API_KEY: 'DJJzSXqqAhl30URUOtKfmsZJkEZESNEqiKg58CxC',
    APP_PORT: 4001,
    REDIS_CONNECTION: require('redis').createClient()
};
