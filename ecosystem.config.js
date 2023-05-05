module.exports = {
   apps: [
    /*{
        name: "user-service",
        script: "./index.js",
        cwd: "./user-service",
    },
    {
        name: "api-gateway",
        script: "./index.js",
        cwd: "./api-gateway",
    },*/
    {
        name: "lib",
        script: "./target/index.js",
        cwd: "./lib",
        instances: 10,
    }
]
}
