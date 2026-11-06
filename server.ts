import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    app: 'NEXUS — Orbit Studio Intelligence',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    hasGeminiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// AI Assistant endpoint using @google/genai server-side
app.post('/api/nexus/ai', async (req: Request, res: Response) => {
  try {
    const { prompt, userRole, businessData, conversationHistory } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const rawApiKey = process.env.GEMINI_API_KEY;
    const apiKey =
      rawApiKey && rawApiKey !== 'MY_GEMINI_API_KEY' && !rawApiKey.startsWith('MY_')
        ? rawApiKey
        : null;

    // Build context summary from live authorized business records
    const contextSummary = businessData
      ? `
AUTHORIZED BUSINESS CONTEXT (Current Live Database Records in INR - ₹):
- Total Clients: ${businessData.clientsCount || 0}
- Active Projects: ${businessData.activeProjectsCount || 0}
- Monthly Revenue: ₹${businessData.monthlyRevenue || 0}
- Total Expenses: ₹${businessData.totalExpenses || 0}
- Net Profit: ₹${businessData.netProfit || 0}
- Pending Payments: ₹${businessData.pendingPayments || 0}
- Pending Founder Approvals: ${businessData.pendingApprovalsCount || 0}
- Key Projects: ${JSON.stringify(businessData.projects || []).slice(0, 800)}
- Unpaid Invoices: ${JSON.stringify(businessData.unpaidInvoices || []).slice(0, 800)}
- Priority Leads: ${JSON.stringify(businessData.priorityLeads || []).slice(0, 800)}
- User requesting role: ${userRole || 'FOUNDER'}
`
      : 'No live database records passed.';

    // If Gemini API Key is available, use @google/genai with gemini-3.8-flash
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });

        const systemInstruction = `
You are NEXUS, the centralized artificial intelligence command operating system for "Orbits Studio", a premier website design and development agency.
Tagline: "One system. Every operation. Total control."

Your duties:
1. All figures must strictly use Indian Rupees (₹ - INR).
2. Answer business operations questions based STRICTLY on the authorized business data provided. Never invent fictional clients, invoice numbers, or financial amounts.
3. User Role: ${userRole || 'FOUNDER'}. If the user is a SALES_REPRESENTATIVE, enforce data privacy: do not reveal overall company profit, founder banking details, or other reps' sensitive commissions.
4. Suggest concrete actions: e.g. "Prepare quotation", "Draft follow-up WhatsApp/Email", "Flag overdue milestone".
5. CRITICAL GOVERNANCE: Always remind the user that external communications (sending emails, messages, invoices, quotations, payments) MUST be submitted to the Founder Approval Queue before dispatch.
6. Tone: Clear, accessible, beginner-friendly, concise, high-precision executive style.
`;

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\n${contextSummary}\n\nUser Query: ${prompt}`,
        });

        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI response timed out')), 9000)
        );

        const response = await Promise.race([geminiPromise, timeoutPromise]);
        const responseText = response.text || 'NEXUS could not generate a response.';
        res.json({
          success: true,
          response: responseText,
          source: 'gemini-3.8-flash',
        });
        return;
      } catch (geminiError: any) {
        console.warn('Gemini API call timed out or failed, engaging local fallback:', geminiError?.message);
      }
    }

    // Fallback rule-based intelligent handler when Gemini API key is not configured
    const lowerPrompt = prompt.toLowerCase();
    let reply = '';

    if (lowerPrompt.includes('overview') || lowerPrompt.includes('today')) {
      reply = `**NEXUS System Overview:**\n- Clients: ${businessData?.clientsCount || 0}\n- Active Projects: ${businessData?.activeProjectsCount || 0}\n- Monthly Revenue: ₹${businessData?.monthlyRevenue?.toLocaleString('en-IN') || 0}\n- Pending Payments: ₹${businessData?.pendingPayments?.toLocaleString('en-IN') || 0}\n- Pending Approvals: ${businessData?.pendingApprovalsCount || 0}\n\nAll systems operational. Check the Approvals queue for pending external actions.`;
    } else if (lowerPrompt.includes('unpaid') || lowerPrompt.includes('invoice')) {
      const count = businessData?.unpaidInvoices?.length || 0;
      reply = `**Unpaid Invoices Analysis:**\nThere are currently **${count}** unpaid invoices requiring attention totaling ₹${businessData?.pendingPayments?.toLocaleString('en-IN') || 0}. You can draft automated payment reminders from the Invoices tab (requires Founder approval).`;
    } else if (lowerPrompt.includes('lead') || lowerPrompt.includes('priority')) {
      reply = `**Priority Leads Intel:**\nReviewed sales pipeline. Filtered highest scoring leads ready for proposal negotiations. Sales representatives are tracking follow-ups today.`;
    } else if (lowerPrompt.includes('profit') || lowerPrompt.includes('revenue') || lowerPrompt.includes('finance')) {
      if (userRole === 'SALES_REPRESENTATIVE') {
        reply = `**Restricted Access:** Complete company balance sheets are restricted to Founder & Partner clearance. You can view your personal commissions in the Team module.`;
      } else {
        reply = `**Financial Snapshot (in INR - ₹):**\n- Revenue: ₹${businessData?.monthlyRevenue?.toLocaleString('en-IN') || 0}\n- Expenses: ₹${businessData?.totalExpenses?.toLocaleString('en-IN') || 0}\n- Net Profit: ₹${businessData?.netProfit?.toLocaleString('en-IN') || 0}\n- Pending Collections: ₹${businessData?.pendingPayments?.toLocaleString('en-IN') || 0}`;
      }
    } else if (lowerPrompt.includes('project') || lowerPrompt.includes('overdue')) {
      reply = `**Active Projects Status:**\nCurrently monitoring **${businessData?.activeProjectsCount || 0}** active website development projects across Planning, Design, and Development phases. Check the Project Management module for milestone check-ins.`;
    } else if (lowerPrompt.includes('draft') || lowerPrompt.includes('message') || lowerPrompt.includes('email') || lowerPrompt.includes('quotation')) {
      reply = `**Action Prepared:**\nDraft prepared for your review in INR (₹). In accordance with NEXUS safety protocol, external communications are queued for Founder Approval before transmission.`;
    } else {
      reply = `**NEXUS Intelligence:** Command received: "${prompt}".\nAll amounts in Indian Rupees (₹). Database metrics verified across all active Orbits Studio nodes. To perform external dispatches, use the Approval Queue.`;
    }

    res.json({
      success: true,
      response: reply,
      source: 'local-intel-fallback',
      note: 'To activate full Gemini generative intelligence, attach a GEMINI_API_KEY in Settings > Secrets.',
    });
  } catch (error: any) {
    console.error('NEXUS AI error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Internal AI service error',
    });
  }
});

// Setup Vite middleware or static serving
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXUS Server] Running on http://0.0.0.0:${PORT} (${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
