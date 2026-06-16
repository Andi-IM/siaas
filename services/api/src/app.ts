import express, { Request, Response } from 'express';
import cors from 'cors';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

/**
 * Health check endpoint for Cloud Run
 */
app.get('/', (req: Request, res: Response) => {
  res.send('SIAAS API is running');
});

/**
 * GET /updater
 * 
 * Proxies the updater.json from the latest GitHub release.
 * Tauri apps will call this endpoint.
 * Accepts query params like ?version=1.0.0 & platform=windows
 */
app.get('/updater', async (req: Request, res: Response) => {
  try {
    const owner = process.env.GITHUB_REPO_OWNER || 'Andi-IM';
    const repo = process.env.GITHUB_REPO_NAME || 'siaas';
    const url = `https://github.com/${owner}/${repo}/releases/latest/download/updater.json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(204).send(); // No updates available
      }
      throw new Error(`GitHub responded with ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching updater.json:', error);
    res.status(500).json({ error: 'Internal server error while fetching update.' });
  }
});

/**
 * Helper to analyze a bug report using Mistral-7B
 */
async function analyzeBugWithMistral(title: string, body: string, logs: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new Error('MISTRAL_API_KEY is not configured');
  }

  const prompt = `You are a helpful software engineering assistant.
Analyze this bug report and system logs from an offline-native academic administrative application.
Provide a structured analysis for the developer to help them debug and fix the issue.

Please format your response in Markdown with the following sections:
- **Summary**: A clear, 1-2 sentence description of what failed and why.
- **Estimated Root Cause**: An analysis based on the description and system logs.
- **Severity**: Assess severity (Low, Medium, High, or Critical) with a brief reason.
- **Steps to Reproduce**: Extracted steps if available.
- **Suggested Fix / Action Items**: Actionable suggestions for the developer.

Bug Title: ${title}
User Description: ${body}
System Logs:
${logs || 'No logs provided'}

Please respond with ONLY the markdown content.`;

  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'open-mistral-7b',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Mistral API returned status ${response.status}: ${errorText}`);
  }

  const data = await response.json() as any;
  return data.choices[0].message.content;
}

/**
 * POST /issues
 * 
 * Receives bug reports from the client app and creates a GitHub issue.
 */
app.post('/issues', async (req: Request, res: Response) => {
  const githubPat = process.env.GITHUB_PAT;
  if (!githubPat) {
    return res.status(500).json({ error: 'GitHub PAT is not configured on the server.' });
  }

  try {
    const { title, body, logs } = req.body;

    if (!title || !body) {
      return res.status(400).json({ error: 'Missing title or body' });
    }

    let aiAnalysis = '';
    if (process.env.MISTRAL_API_KEY) {
      try {
        aiAnalysis = await analyzeBugWithMistral(title, body, logs);
      } catch (err) {
        console.error('Failed to enrich bug report with Mistral-7B:', err);
      }
    }

    let issueBody = `${body}\n\n### Attached Logs\n\`\`\`\n${logs || 'No logs provided'}\n\`\`\``;
    if (aiAnalysis) {
      issueBody = `<details>\n<summary>🤖 AI Bug Analysis (Mistral-7B)</summary>\n\n${aiAnalysis}\n\n</details>\n\n${issueBody}`;
    }

    const owner = process.env.GITHUB_REPO_OWNER || 'Andi-IM';
    const repo = process.env.GITHUB_REPO_NAME || 'siaas';

    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${githubPat}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `[Bug Report] ${title}`,
        body: issueBody,
        labels: ['bug', 'user-report']
      })
    });

    if (!response.ok) {
      const errData = await response.text();
      console.error('Failed to create issue on GitHub:', errData);
      return res.status(response.status).json({ error: 'Failed to create GitHub issue' });
    }

    const responseData = await response.json() as any;
    res.status(201).json({ message: 'Issue created successfully', url: responseData.html_url });
  } catch (error) {
    console.error('Error creating issue:', error);
    res.status(500).json({ error: 'Internal server error while creating issue.' });
  }
});

export { app };
