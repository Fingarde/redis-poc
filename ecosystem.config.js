module.exports = {
    apps: [{
        name: "user-service",
        script: "./index.js",
        cwd: "./user-service",
    },
    {
        name: "api-gateway",
        script: "./index.js",
        cwd: "./api-gateway",
    }]
}
