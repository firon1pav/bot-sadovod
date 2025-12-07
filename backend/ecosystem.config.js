module.exports = {
  apps: [{
    name: "botgardener-api",
    script: "./dist/app.js",
    instances: "max", // Use all CPU cores (Clustering)
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
    },
    env_production: {
      NODE_ENV: "production",
    },
    // Protect against memory leaks: restart if memory > 300MB
    max_memory_restart: "300M",
    // Auto restart on crash
    autorestart: true,
    watch: false,
  }]
};