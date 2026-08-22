import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { execFile } from 'child_process';
import { promisify } from 'util';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execFileAsync = promisify(execFile);
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);

  app.disable('x-powered-by');
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cache-Control', req.path.startsWith('/api/') ? 'no-store' : 'no-cache');
    next();
  });
  app.use(express.json({ limit: '50mb' }));

  // Gemini Client Initialization (Server-side only)
  let aiClient: GoogleGenAI | null = null;
  function getAiClient(): GoogleGenAI | null {
    if (!aiClient && process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiClient;
  }

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Structural Engineering AI Workstation',
      version: '1.3.2',
      timestamp: new Date().toISOString(),
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
    });
  });

  // Native Windows CSI process discovery. This intentionally does NOT fake an OAPI connection.
  app.get('/api/csi/status', async (req, res) => {
    if (process.platform !== 'win32') {
      return res.json({
        platform: process.platform,
        nativeBridgeAvailable: false,
        connectedSoftwares: [],
        message: 'CSI OAPI native bridge is available only on Windows 10/11 with ETABS/SAP2000/SAFE installed.'
      });
    }

    try {
      const ps = [
        '$ErrorActionPreference=\"SilentlyContinue\";',
        '$names=@(\"ETABS\",\"SAP2000\",\"SAFE\");',
        '$rows=@();',
        'foreach($n in $names){',
        '  $ps=Get-Process -Name $n -ErrorAction SilentlyContinue;',
        '  foreach($p in $ps){ $rows += [PSCustomObject]@{ software=$n; pid=$p.Id; exe=$p.Path; status=\"RUNNING\" } }',
        '}',
        '$rows | ConvertTo-Json -Compress'
      ].join(' ');
      const { stdout } = await execFileAsync('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', ps], { windowsHide: true, timeout: 5000 });
      const raw = stdout.trim();
      let rows: any[] = [];
      if (raw) { const parsed = JSON.parse(raw); rows = Array.isArray(parsed) ? parsed : [parsed]; }
      const all = ['ETABS','SAP2000','SAFE'].map(name => {
        const found = rows.filter(r => r.software === name);
        return {
          name, type: name, status: found.length ? 'PROCESS_DETECTED' : 'NOT_RUNNING',
          connectedPids: found.map(r => r.pid), executablePaths: found.map(r => r.exe).filter(Boolean),
          apiMode: 'CSI OAPI Native Bridge',
          note: found.length ? 'Process detected. Use Connect OAPI to attach to the active CSI model.' : 'Start the CSI application, then refresh.'
        };
      });
      res.json({ platform: 'win32', nativeBridgeAvailable: true, connectedSoftwares: all, readOnlyMode: true, bridgeVersion: 'HNL.CSI.Bridge.1.0' });
    } catch (error:any) {
      res.status(500).json({ nativeBridgeAvailable: false, connectedSoftwares: [], error: error.message });
    }
  });

  // AI Chat Route
  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const { prompt, context } = req.body;
      const client = getAiClient();

      if (!client) {
        return res.status(503).json({ reply: 'AI online chưa được cấu hình. Không tạo kết quả kỹ thuật giả. Hãy cấu hình GEMINI_API_KEY hoặc dùng Calculation Engine/RAG local đã được xác minh.', code: 'AI_PROVIDER_NOT_CONFIGURED' });
      }

      const systemInstruction = `You are a Senior Structural & Geotechnical Chief Engineer AI Assistant in Vietnam.
You specialize in ETABS, SAP2000, SAFE, TCVN 2737:2023, TCVN 5574:2018, TCVN 10304:2014, ACI 318, Eurocode, and Phan Vũ Group Piles (PHC, Nodular, Pre-bored).
You MUST NEVER hallucinate numbers or formulas. Ground all responses on engineering mechanics, clear equations, and exact standard citations.
Current Project Context: ${JSON.stringify(context || {})}`;

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: 0.2,
        },
      });

      return res.json({ reply: response.text });
    } catch (error: any) {
      console.error('Chat error:', error);
      return res.status(500).json({
        reply: `Lỗi xử lý AI: ${error.message}. Hệ thống chuyển sang chế độ phân tích cục bộ.`,
      });
    }
  });

  // AI Generation Proxy
  app.post('/api/gemini/generate', async (req, res) => {
    try {
      const { prompt, systemInstruction, temperature = 0.2, thinkingLevel } = req.body;
      const client = getAiClient();

      if (!client) {
        return res.status(503).json({ error: 'AI provider chưa được cấu hình.', text: 'Không có mô hình AI local/online đang hoạt động. Calculation Engine vẫn có thể dùng độc lập với dữ liệu người dùng nhập.', isFallback: false, code: 'AI_PROVIDER_NOT_CONFIGURED' });
      }

      const config: any = {
        systemInstruction:
          systemInstruction ||
          `You are an expert Structural Engineering AI Assistant specializing in ETABS, SAP2000, SAFE, Reinforced Concrete / Steel Design, Geotechnical & Pile Foundation Engineering according to TCVN, ACI, ASCE, Eurocode, and CSI Technical Manuals. 
All engineering statements must be rigorously verifiable, cite exact clauses/equations, avoid hallucinations, clearly distinguish between CSI analysis output, Independent Calculation Engine results, and Manufacturer specifications (Phan Vũ Group).`,
        temperature,
      };

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config,
      });

      return res.json({ text: response.text, isFallback: false });
    } catch (error: any) {
      console.error('Gemini generate error:', error);
      return res.status(500).json({
        error: error.message || 'Error processing AI request',
        fallbackExplanation: 'Calculation engine remains 100% active locally.',
      });
    }
  });

  // Deep Research & Knowledge RAG endpoint
  app.post('/api/gemini/research', async (req, res) => {
    try {
      const { query, domain, contextSources } = req.body;
      const client = getAiClient();

      const prompt = `Perform rigorous structural engineering research on: "${query}".
Domain scope: ${domain || 'General Structural & Geotechnical Engineering'}.
Context sources available: ${JSON.stringify(contextSources || [])}.
Only cite a source when its exact document metadata or retrieved text is actually present in the supplied context. Do not invent clause numbers, editions, URLs, or catalog data.

Please structure your response with:
1. Executive Technical Summary
2. Code & Standard References (with exact Clause / Section numbers)
3. Calculation Formulations & Variable Definitions
4. CSI Modeling / Analysis Guidance (ETABS/SAP/SAFE best practices)
5. Geotechnical & Foundation Considerations (if applicable)
6. Potential Pitfalls & Verification Checkpoints`;

      if (!client) {
        return res.status(503).json({ summary: 'Research provider chưa được cấu hình.', text: 'Không tạo citation/điều khoản giả. Hãy cấu hình AI online hoặc nạp tài liệu vào Knowledge Base để thực hiện RAG có nguồn.', citations: [], code: 'RESEARCH_PROVIDER_NOT_CONFIGURED' });
      }

      const response = await client.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: {
          systemInstruction:
            'You are a senior Structural Engineering Chief Engineer and peer reviewer. Ground all engineering facts on verified codes (TCVN/ACI/Eurocode/CSI docs).',
        },
      });

      return res.json({
        summary: `AI Research Analysis for "${query}"`,
        text: response.text,
        citations: [],
        sourceStatus: 'UNVERIFIED_MODEL_OUTPUT',
        note: 'Chỉ hiển thị citation khi Knowledge/RAG layer cung cấp metadata nguồn thực tế.'
      });
    } catch (error: any) {
      console.error('Research error:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Phan Vũ catalog sync guard. Không tuyên bố verified nếu chưa có fetcher thật.
  app.get('/api/phanvu/sync', (req, res) => {
    res.status(501).json({ status: 'NOT_CONFIGURED', lastChecked: new Date().toISOString(), source: 'phanvu.vn', verified: false, message: 'Live Phan Vũ catalog sync chưa được triển khai trong bản 1.3.2. Dữ liệu local là REFERENCE ONLY cho đến khi đối chiếu catalog chính thức.' });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = __dirname;
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`HNL Structural AI internal service: http://127.0.0.1:${PORT}`);
  });
}

startServer();
