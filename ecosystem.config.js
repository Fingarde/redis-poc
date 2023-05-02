module.exports = {
    apps: [{
        name: "user-service",
        script: "./user/index.js",
    },
    {
        name: "api-gateway",
        script: "./api-gateway/index.js",
    }]
}
