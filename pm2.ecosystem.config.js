// pm2.ecosystem.config.js
// Rodar: pm2 start pm2.ecosystem.config.js

module.exports = {
  apps: [
    {
      name: "assistente-clinico",
      script: "./dist/index.js",
      instances: "max",               // usa todos os CPUs
      exec_mode: "cluster",
      watch: false,
      max_memory_restart: "512M",
      restart_delay: 3000,
      max_restarts: 10,
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      error_file:  "./logs/err.log",
      out_file:    "./logs/out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
    },
  ],
};
