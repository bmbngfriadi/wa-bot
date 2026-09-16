module.exports = {
  apps: [
    {
      name: "wabot-backend",
      script: "server.js",
      max_memory_restart: '200M',
      env: {
        PORT: 5001, // Menggunakan port 5001 agar tidak bentrok dengan sistem CHES di port 5000
      }
    },
    {
      name: "wabot-worker",
      script: "index.js",
      max_memory_restart: '300M'
    }
  ]
};
