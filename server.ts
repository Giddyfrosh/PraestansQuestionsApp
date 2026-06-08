import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { OAuth2Client } from "google-auth-library";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  let subjects:any[] = [];

  app.get('/api/auth/google/url', (req, res) => {
    try {
      const redirectUri = `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}/auth/callback`;
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const authUrl = client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/userinfo.profile',
          'https://www.googleapis.com/auth/userinfo.email',
        ],
      });
      res.json({ url: authUrl });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to generate auth URL" });
    }
  });

  app.get('/auth/callback', async (req, res) => {
    try {
      const { code } = req.query;
      const redirectUri = `${req.headers['x-forwarded-proto'] || req.protocol}://${req.headers.host}/auth/callback`;
      const client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        redirectUri
      );
      
      const { tokens } = await client.getToken(code as string);
      client.setCredentials(tokens);
      
      const oauth2 = await client.request({ url: 'https://www.googleapis.com/oauth2/v2/userinfo' });
      const userInfo = oauth2.data as any;

      app.post("/api/subjects", (req,res)=>{
  subjects=req.body;
  res.json({
    success:true
  });
});

app.get("/api/subjects",(req,res)=>{
  res.json(subjects);
});
      res.send(`
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', payload: ${JSON.stringify({
                  email: userInfo.email,
                  name: userInfo.name,
                  picture: userInfo.picture,
                  id: userInfo.id
                })} }, '*');
                window.clggggose();
              } else {
                window.location.href = '/';
              }
            </script>
            <p>Authentication successful. You can close this window.</p>
          </body>
        </html>
      `);
    } catch (error) {
      res.send(`<html><body><p>Authentication failed: ${error}</p></body></html>`);
    }
  });

  app.post("/api/evaluate", async (req, res) => {
    try {
      const { studentName, examHistory } = req.body;
      
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "Gemini API key is not configured on the server." });
      }

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `You are an expert academic advisor. Analyze the following student performance data and provide a diagnostic report.
Student: ${studentName}

Performance Data:
${JSON.stringify({examHistory}, null, 2)}
`
Provide the evaluation in strict JSON format with exactly three string fields:
{
  "strengths": "Detailed strengths based on their correct answers or high scores.",
  "weaknesses": "Detailed weaknesses based on missed questions or low scores.",
  "recommendations": "Actionable study plan recommendations tailored to this student."
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const report = JSON.parse(response.text || '{}');
      res.json({ report });
    } catch (error) {
      console.error("AI Evaluation error:", error);
      res.status(500).json({ error: "Failed to generate evaluation" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
