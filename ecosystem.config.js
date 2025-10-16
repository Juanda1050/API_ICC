module.exports = {
  apps: [
    {
      name: "auth-service",
      script: "./auth-service/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        AUTH_PORT: 4000,
      },
    },
    {
      name: "billing-service",
      script: "./billing-service/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        BILLING_PORT: 4001,
      },
    },
    {
      name: "management-service",
      script: "./management-service/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        MANAGEMENT_PORT: 4002,
      },
    },
    {
      name: "gateway",
      script: "./gateway/server.js",
      instances: 1,
      env: {
        NODE_ENV: "production",
        PORT: 8080,
      },
    },
  ],
};
