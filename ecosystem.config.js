module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "./auth-service/dist/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 4000,
      },
    },
    {
      name: "billing-service",
      script: "./billing-service/dist/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 4001,
      },
    },
    {
      name: "management-service",
      script: "./management-service/dist/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 4002,
      },
    },
    {
      name: "gateway",
      script: "./gateway/dist/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
  ],
};