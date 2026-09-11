module.exports = {
  apps: [
    {
      name: "wabot-backend",
      script: "server.js",
      env: {
        PORT: 5001, // Menggunakan port 5001 agar tidak bentrok dengan sistem CHES di port 5000
      }
    },
    {
      name: "wabot-worker",
      script: "index.js"
    }
  ]
};
