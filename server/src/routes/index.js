const router = require("express").Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

router.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Vinayak Tavatam API</title>

      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0f172a, #1e3a8a);
          color: white;
        }

        .container {
          width: 90%;
          max-width: 600px;
          padding: 50px 35px;
          text-align: center;
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          backdrop-filter: blur(15px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.3);
        }

        .icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: linear-gradient(135deg, #38bdf8, #6366f1);
          font-size: 36px;
        }

        h1 {
          font-size: 32px;
          margin-bottom: 12px;
        }

        p {
          color: #cbd5e1;
          font-size: 16px;
          line-height: 1.6;
        }

        .status {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 25px;
          padding: 10px 18px;
          border-radius: 50px;
          background: rgba(34, 197, 94, 0.15);
          color: #4ade80;
          font-weight: bold;
        }

        .dot {
          width: 10px;
          height: 10px;
          background: #4ade80;
          border-radius: 50%;
          box-shadow: 0 0 10px #4ade80;
        }

        .footer {
          margin-top: 30px;
          font-size: 13px;
          color: #94a3b8;
        }
      </style>
    </head>

    <body>
      <div class="container">
        <div class="icon">🚀</div>

        <h1>Vinayak Tavatam API</h1>

        <p>
          Welcome! Your Node.js API is up and running successfully.
        </p>

        <div class="status">
          <span class="dot"></span>
          API is Online
        </div>

        <div class="footer">
          Powered by Node.js & Express
        </div>
      </div>
    </body>
    </html>
  `);
});


module.exports = router;