import { useState, useRef, useEffect } from "react";

const MODULES = [
  { id: "tb",       icon: "ti-table",           label: "TB scrutiny",         color: "#185FA5" },
  { id: "ledger",   icon: "ti-list-details",     label: "Ledger scrutiny",     color: "#0F6E56" },
  { id: "variance", icon: "ti-chart-line",        label: "Variance analysis",   color: "#854F0B" },
  { id: "gst",      icon: "ti-receipt-tax",       label: "GST review",          color: "#3B6D11" },
  { id: "taxaudit", icon: "ti-file-certificate",  label: "Tax audit (3CD)",     color: "#533d8f" },
  { id: "query",    icon: "ti-question-mark",     label: "Audit queries",       color: "#A32D2D" },
  { id: "risk",     icon: "ti-alert-triangle",    label: "Risk & fraud flags",  color: "#993C1D" },
  { id: "prompts",  icon: "ti-books",             label: "Prompt library",      color: "#444441" },
];

const PROMPTS = {
  tb: {
    label: "Trial Balance Scrutiny",
    hint: "Paste your Trial Balance (ledger name, debit, credit) below:",
    placeholder: "Paste Trial Balance here...\n\nExample:\nShare Capital,,5,00,000\nReserves & Surplus,,3,50,000\nUnsecured Loans,,10,00,000\nBank (SBI CC),,2,50,000\nSalaries,18,00,000,\nPetty Cash,45,000,\n...",
    system: `You are a senior Chartered Accountant with 25+ years of experience in statutory audit, tax audit, and GST audit under Indian laws (Companies Act 2013, Income Tax Act 1961, CGST Act 2017). You work for Pratap B Sheth & Co., Chartered Accountants. 

Your task: Review the Trial Balance provided and produce a structured audit risk report covering:

1. **STATUTORY AUDIT RISKS** — by area (Share Capital, Fixed Assets, Debtors, Revenue, etc.)
2. **TAX AUDIT DISALLOWANCES** — Identify ledgers triggering Sec 37, 40(a)(ia), 40A(2), 40A(3), 43B, 43B(h)
3. **GST RISKS** — ITC reversal risk, RCM exposure, blocked credits, GSTR reconciliation gaps
4. **UNUSUAL BALANCES** — Negative balances, debit/credit mismatches, round numbers, year-end entries
5. **MISSING PROVISIONS** — Gratuity, bonus, doubtful debts, deferred tax, MSME interest
6. **CARO 2020 FLAGS** — Which paragraphs are likely to carry adverse observations
7. **RELATED PARTY INDICATORS** — Ledger names or balances suggesting RPT risk
8. **TDS DEFAULT INDICATORS** — Expenses where TDS likely applicable but not evident
9. **RECLASSIFICATION ENTRIES** — Items possibly misclassified in FS
10. **TOP 10 AUDIT QUERIES** — Specific questions to raise with management

Format each section clearly with sub-points. Be specific about ledger names found in the TB. Quantify risks where possible.`,
  },
  ledger: {
    label: "Ledger Scrutiny",
    hint: "Paste ledger transactions (date, narration, debit, credit, balance):",
    placeholder: "Paste ledger details here...\n\nExample:\nLedger: Cash Account\n01-Apr-25  Opening Balance                        15,000\n05-Apr-25  Payment to Ramesh Traders    50,000       Cr\n15-Apr-25  Petty Cash                   25,000\n31-Mar-26  Adjustment entry             1,00,000\n...",
    system: `You are a forensic-minded senior Chartered Accountant at Pratap B Sheth & Co. reviewing a ledger for audit purposes under:
- Income Tax Act 1961 (Sec 37, 40A, 43B, 269SS, 269T, 192, 194C/H/I/J etc.)
- Companies Act 2013 (Sec 185, 186, 188)
- CGST Act 2017 (Sec 17(5), Rule 37, Rule 42/43)
- CARO 2020

Review each entry and identify:
1. **ENTRY-WISE FLAGS** — For each suspicious entry: Date | Entry Description | Risk Type | Section/Rule | Severity (High/Med/Low)
2. **TDS COMPLIANCE** — Entries where TDS should have been deducted; compute estimated 40(a)(ia) disallowance
3. **GST ISSUES** — Blocked credits, RCM liability, ITC incorrectly availed
4. **SEC 40A(3)** — Cash payments >₹10,000 — list each with amount
5. **RELATED PARTY** — Entries suggesting payments to related persons
6. **YEAR-END ADJUSTMENTS** — Entries near 31-Mar-2026 with no voucher reference
7. **PERSONAL EXPENSES** — Non-business items charged to P&L
8. **AUDIT EVIDENCE REQUIRED** — List documents to obtain for each flagged entry
9. **SUMMARY DISALLOWANCE** — Estimated disallowance by section
10. **AUDIT QUERIES** — 5 specific queries for this ledger

Be specific. Reference actual entries from the ledger provided.`,
  },
  variance: {
    label: "Variance Analysis (PY vs CY)",
    hint: "Paste PY and CY financial data (P&L and/or Balance Sheet):",
    placeholder: "Paste comparison data here...\n\nExample:\nP&L ITEMS         FY 2024-25    FY 2025-26\nRevenue           45,00,000     62,00,000\nMaterial Cost     28,00,000     44,00,000\nSalaries           8,00,000     10,50,000\nGross Profit      17,00,000     18,00,000\nOther Expenses     5,00,000      9,00,000\nPBT               12,00,000      9,00,000\n...",
    system: `You are a senior audit partner at Pratap B Sheth & Co. performing analytical review procedures as per SA 520.

Compare the prior year (FY 2024-25) and current year (FY 2025-26) financial data provided. Produce:

1. **VARIANCE TABLE** — Line item | PY Amount | CY Amount | Change (₹) | Change (%) | Risk Assessment
2. **HIGH RISK ITEMS** — All items with >20% change: explain possible genuine business reasons AND audit risk reasons
3. **GROSS PROFIT ANALYSIS** — GP% change: enumerate all possible audit explanations (revenue manipulation, stock inflation, purchase overstatement, etc.)
4. **RATIO ANALYSIS** — Compute: Current Ratio, Debt-Equity, Debtor Days, Creditor Days, Inventory Turnover, EBITDA Margin, Net Profit Margin — compare PY vs CY
5. **RED FLAGS** — Expenses growing faster than revenue; margins deteriorating; debt increasing without revenue growth
6. **AUDIT PROCEDURES** — For each high-risk variance, state the specific audit procedure to verify
7. **GOING CONCERN INDICATORS** — Any indicators of financial distress
8. **MANAGEMENT QUESTIONS** — Top 5 questions to ask management about significant variances
9. **CARO FLAGS** — Any variances indicating CARO 2020 reporting issues

Quantify everything. Be the audit partner who would catch what junior staff miss.`,
  },
  gst: {
    label: "GST Reconciliation Review",
    hint: "Paste GST data — GSTR-1, GSTR-3B, GSTR-2B summaries and books turnover:",
    placeholder: "Paste GST data here...\n\nExample:\nTURNOVER RECONCILIATION:\nBooks Revenue (P&L)           62,00,000\nGSTR-1 Taxable Outward Supply 58,50,000\nGSTR-3B Tax Liability Declared 58,00,000\n\nITC AVAILED:\nGSTR-3B ITC claimed           8,20,000\nGSTR-2B Auto-populated ITC    7,45,000\nBooks Purchase (GST portion)   8,80,000\n\nMonth-wise GSTR-1 vs 3B...",
    system: `You are a GST audit specialist at Pratap B Sheth & Co. reviewing GST compliance for FY 2025-26 for GSTR-9C certification purposes.

Analyse the GST data provided and produce:

1. **TURNOVER RECONCILIATION** — Books vs GSTR-1 vs GSTR-3B vs GSTR-9: 
   - Compute each difference
   - Identify reason (exempt supplies not declared, advances, credit notes, timing)
   - Flag unexplained differences as audit risk

2. **ITC RECONCILIATION** — GSTR-2B vs GSTR-3B vs Books:
   - ITC availed but not in GSTR-2B (supplier non-compliance)
   - Blocked credits u/s 17(5) possibly availed (vehicles, food, club, personal)
   - Rule 37 reversal — identify probable unpaid vendors >180 days
   - Rule 42/43 reversal — exempt/non-business proportion
   - Estimated total ITC reversal required

3. **TAX LIABILITY GAPS** — Any months where 3B < GSTR-1: compute potential short payment + interest @18% p.a.

4. **RCM EXPOSURE** — Payments to unregistered vendors, advocates, freight, import of services

5. **E-INVOICING COMPLIANCE** — Whether applicable (>₹5Cr turnover); any non-compliant invoices

6. **GSTR-9 REPORTING** — Key items for Table 10/11 (prior year adjustments), Table 17/18 (HSN)

7. **GSTR-9C CERTIFICATION RISKS** — Items auditor must specifically certify and potential qualification points

8. **AUDIT QUERIES** — 5 specific queries to raise with the tax team / management

Format all amounts clearly with ₹ symbol. Flag HIGH / MEDIUM / LOW for each risk.`,
  },
  taxaudit: {
    label: "Tax Audit — Form 3CD Clause Review",
    hint: "Specify which clause(s) to review and paste relevant data:",
    placeholder: "Example:\n\nCLAUSE 26 — Section 43B review:\nPF (Employee share): Deducted ₹4,80,000 — Deposited on 20th of each month\nESIC: ₹96,000 — Deposited consistently by 15th\nBonus: ₹2,40,000 — Paid on 28-Feb-2026\nIncome Tax: ₹18,50,000 — Last installment 15-Mar-2026\nGST outstanding as on 31-Mar-26: ₹1,20,000\nMSME creditors >45 days: ABC Pvt Ltd ₹3,50,000 (Invoice Oct-25)\n\nor\n\nCLAUSE 34 — TDS details:\nSalaries paid: ₹48,00,000 — TDS deducted ₹3,20,000\nProfessional fees: ₹12,00,000 — TDS deducted ₹1,00,000\nRent paid: ₹9,60,000 — TDS deducted ₹96,000\nContractor payments: ₹28,00,000 — TDS ₹28,000\n...",
    system: `You are a tax audit expert at Pratap B Sheth & Co. with deep knowledge of Form 3CD (ICAI Guidance Note on Tax Audit 2023 edition) and all relevant IT Act provisions.

Review the data provided for the specified Form 3CD clause(s) and produce:

1. **CLAUSE-WISE ANALYSIS** — For each clause mentioned:
   - What the clause requires to be reported
   - What the data shows
   - What needs to be disclosed in Form 3CD
   - Whether any disallowance / adverse observation is required

2. **DISALLOWANCE COMPUTATION** — Section-wise:
   - Amount as per books
   - Allowable amount
   - Disallowance (with section reference)
   - Clause no. in Form 3CD for reporting

3. **COMPLIANCE GAPS** — Items not complied with that must be reported

4. **DRAFT 3CD LANGUAGE** — Suggested wording for the clause in Form 3CD (as auditor would write)

5. **DOCUMENTS REQUIRED** — Specific evidence auditor must obtain before signing

6. **AUDIT QUERIES** — Questions to ask the client to complete this clause

7. **CROSS-REFERENCES** — Any related clauses in Form 3CD that get affected

Be precise. Cite section numbers. Compute figures where data is provided. Use ICAI Guidance Note references where applicable.`,
  },
  query: {
    label: "Audit Query Generator",
    hint: "Paste your audit observations / findings — AI will draft formal queries:",
    placeholder: "Paste observations here...\n\nExample:\n1. Cash payments of ₹18,500 to Vendor X on 15-Jun-25\n2. Professional fees of ₹5,00,000 paid to ABC Consultants — no TDS deducted\n3. Closing stock increased 45% vs revenue increase of 12%\n4. Director's current account shows credit balance of ₹25 lakhs\n5. Unsecured loan of ₹50 lakhs received in cash from Mr. Y\n6. Repairs & maintenance includes ₹8,00,000 — appears capital in nature\n...",
    system: `You are a senior audit manager at Pratap B Sheth & Co. drafting formal audit queries to management / CFO.

Based on the observations provided, draft professional audit queries in the following format for each:

**QUERY NO. [n]**
- **Area**: [Balance Sheet / P&L / Compliance / GST / TDS]
- **Subject**: [Brief subject line]  
- **Query**: [Detailed, professional, factual query — non-accusatory, reference relevant law/AS/SA]
- **Documents/Information Required**: [Specific list]
- **Applicable Section/Standard**: [IT Act / Companies Act / CGST Act / AS / Ind AS / SA]
- **Risk Level**: [High / Medium / Low]
- **Deadline for Response**: [Suggested timeline]

Tone: Professional, factual, formal. Never accusatory. Reference relevant statutory provisions. The queries should be ready to include in the management letter / communication to client. Write as if sending to the CFO of a professionally managed company.

Also provide at the end:
- **SUMMARY TABLE**: Query No. | Area | Risk Level | Status (Open)
- **PRIORITY ORDER**: Which queries need response first and why`,
  },
  risk: {
    label: "Risk & Fraud Flag Analysis",
    hint: "Paste financial data, ledger excerpts, or describe the scenario:",
    placeholder: "Paste data or describe scenario...\n\nExample:\n- Revenue grew 40% but gross profit fell from 35% to 22%\n- Cash balance ₹45 lakhs (prior year ₹2 lakhs)\n- New vendor 'Sunrise Trading' received ₹28 lakhs in Q4 — registered 3 months ago\n- Director's salary doubled from ₹24L to ₹48L without AGM approval\n- Inventory increased ₹1.2 Cr — physical count not conducted\n- 3 key customers (60% revenue) have outstanding >180 days\n- Loans from 12 individuals totalling ₹85 lakhs — all cash receipts\n...",
    system: `You are a fraud-risk-focused audit partner at Pratap B Sheth & Co. with forensic accounting background.

Analyse the data/scenario provided and produce a comprehensive risk and fraud flag report:

1. **FRAUD RISK MATRIX**
   | Risk Area | Indicator | Fraud Scheme | Severity | Audit Test |
   Cover: Revenue manipulation, Expense fraud, Asset misappropriation, Financial statement fraud, Tax evasion, GST fraud

2. **RED FLAG ANALYSIS** — For each red flag:
   - What the indicator is
   - Why it is suspicious
   - What fraud scheme it could indicate
   - Severity: Critical / High / Medium / Low
   - Specific audit procedure to investigate

3. **CARO 2020 IMPLICATIONS** — Which CARO paragraphs may need qualified reporting

4. **SA 240 COMPLIANCE** — Auditor's responsibilities under SA 240 (Fraud) for identified risks

5. **MANAGEMENT OVERRIDE RISKS** — Areas where management could override controls

6. **GOING CONCERN ASSESSMENT** — Whether any indicators suggest financial distress / going concern doubt

7. **ESCALATION RECOMMENDATION** — Should any matter be escalated to:
   - Audit Committee
   - Board of Directors
   - Reporting u/s 143(12) (fraud reporting to Central Government)

8. **IMMEDIATE AUDIT STEPS** — Priority procedures to perform before signing the audit report

Be bold. Flag what needs flagging. An auditor who misses fraud bears professional and legal consequences.`,
  },
  prompts: {
    label: "Prompt Library",
    hint: "Browse and copy ready-to-use audit prompts:",
    placeholder: "",
    system: "",
  },
};

const PROMPT_LIBRARY = [
  { cat: "TB Scrutiny", title: "Full Risk Analysis", text: 'Act as a senior CA at Pratap B Sheth & Co. conducting statutory + tax audit for FY 2025-26. Review the Trial Balance and identify: (1) Statutory audit risks by area (2) Tax disallowances — Sec 40, 40A, 43B (3) GST risks (4) Unusual balances (5) Missing provisions (6) CARO 2020 flags (7) RPT indicators (8) TDS defaults (9) Reclassification needs (10) Top 10 audit queries for management.' },
  { cat: "TB Scrutiny", title: "Expense Disallowances", text: 'Review the expense section of this Trial Balance. Identify amounts disallowable under: Sec 37(1) — personal/capital, Sec 40(a)(ia) — TDS default 30%, Sec 40A(2) — related party excess, Sec 40A(3) — cash >₹10,000, Sec 43B — delayed dues, Sec 43B(h) — MSME 45 days. Compute estimated disallowance against each ledger.' },
  { cat: "TB Scrutiny", title: "CARO 2020 Flags", text: 'Based on this Trial Balance, identify which of the 21 CARO 2020 paragraphs are likely to carry adverse/qualified reporting. For each: state the TB figure triggering concern, information required from management, and draft the likely CARO observation language.' },
  { cat: "Ledger Scrutiny", title: "Cash Ledger", text: 'Review this cash ledger as a forensic CA. Flag: (1) Payments >₹10,000 — Sec 40A(3) (2) Round-sum fictitious entries (3) Suspicious narrations without voucher (4) Year-end adjustments (5) Director/relative payments (6) GST violation entries (7) Cash loans >₹20,000 — Sec 269SS. Rate each: High/Medium/Low risk.' },
  { cat: "Ledger Scrutiny", title: "Unsecured Loans", text: 'Review this Unsecured Loans ledger: (1) Sec 269SS — cash receipts >₹20,000 (2) Sec 269T — cash repayments (3) Sec 2(22)(e) deemed dividend risk (4) TDS u/s 194A on interest (5) Accommodation entry indicators — round amounts, same-day return (6) Year-end borrowing pattern. Flag each entry with risk level.' },
  { cat: "Ledger Scrutiny", title: "Salaries & Payroll", text: 'Review this salary ledger: (1) Monthly consistency — spikes for ghost employees (2) TDS u/s 192 (3) PF/ESIC employee contribution — paid before due date (Checkmate SC ruling — disallowed if late) (4) Director remuneration — Sec 197 limit (5) Cash payments — Sec 40A(3) (6) Bonus — paid before ITR date u/s 43B. Compute 40(a)(ia) disallowance.' },
  { cat: "Variance Analysis", title: "PY vs CY Full", text: 'Compare FY 2024-25 and FY 2025-26 financial data. Identify: all items >20% change, GP% deterioration, expenses growing faster than revenue, unusual BS movements, ratio changes (debtor days, creditor days, inventory turnover, EBITDA margin), red flags, going concern indicators. For each high-risk variance — state specific audit procedure.' },
  { cat: "Variance Analysis", title: "Gross Profit Deep Dive", text: 'GP% changed from [X]% to [Y]% between FY24-25 and FY25-26. As audit partner — analyse all possible audit explanations: revenue timing, inventory overstatement, purchase understatement, sales return treatment, discount policy, cost allocation change, theft/pilferage, RPT pricing. For each possibility — state the audit test to verify.' },
  { cat: "GST Review", title: "Turnover Reconciliation", text: 'Reconcile: Books Turnover → GSTR-1 → GSTR-3B → GSTR-9. Month-wise: identify mismatch, explain possible reason (exempt supplies, advances, credit notes, timing). Flag unexplained differences. Compute potential short GST payment + interest @18% p.a. Format as month-wise reconciliation table.' },
  { cat: "GST Review", title: "ITC Reversal Computation", text: 'Compute ITC reversal required: (1) GSTR-3B vs GSTR-2B gap — supplier non-compliance (2) Blocked credits u/s 17(5) — vehicles, food, club, personal (3) Rule 37 — vendors not paid >180 days (4) Rule 42 — exempt/non-business proportion (5) RCM — GST paid before ITC claimed? Net reversal amount with section reference.' },
  { cat: "Tax Audit", title: "Clause 26 — Sec 43B", text: 'Verify Sec 43B compliance for Form 3CD Clause 26: For each — Employee PF (due 15th), ESIC (due 15th), Bonus, Income Tax, GST, Profession Tax, MSME payments (Sec 43B(h) — 45-day rule) — state: amount per books, due date, actual payment date, delayed amount, disallowance. Total Sec 43B disallowance.' },
  { cat: "Tax Audit", title: "Clause 34 — TDS", text: 'Verify TDS for Form 3CD Clause 34: For each section (192, 194A, 194C, 194H, 194I, 194J, 195) — applicable?, total payment, TDS rate, TDS deducted, any short deduction, date of deposit (any delay?), interest u/s 201A. Check: timely filing of 26Q/27Q quarterly returns, late filing fees u/s 234E.' },
  { cat: "Risk & Fraud", title: "Fraud Red Flags", text: 'Analyse the data and identify fraud red flags: Revenue manipulation (fictitious sales, early recognition), Expense fraud (inflated invoices, fictitious vendors), Asset misappropriation (cash theft, payroll fraud), FS fraud (misclassification, timing), Tax fraud, GST ITC fraud. Rate: Critical/High/Medium/Low. State audit test for each.' },
  { cat: "Risk & Fraud", title: "Going Concern Assessment", text: 'Assess going concern risk per SA 570 based on: current ratio, consecutive losses, working capital deficit, loan defaults, key customer/supplier dependency, legal proceedings. Output: going concern doubt indicators, management mitigating factors to verify, draft disclosure language for audit report if applicable.' },
  { cat: "Working Papers", title: "Draft Audit Queries", text: 'Based on audit observations below, draft 10 formal queries to CFO/management. Format: Query No. | Area | Subject | Query (professional, non-accusatory, with section reference) | Documents Required | Risk Level | Deadline. Ready to include in management communication letter.' },
  { cat: "Working Papers", title: "Mgmt Rep Letter", text: 'Draft Management Representation Letter per SA 580 for [Company] for FY ended 31-Mar-2026. Include all standard representations + specific ones for: [insert matters]. Format ready for MD/CFO signature.' },
  { cat: "Industry", title: "Real Estate Builder", text: 'Audit scrutiny of real estate developer FY 2025-26: Revenue recognition (POCM/completion), advances from customers, RERA escrow, GST on under-construction vs completed units, TDS u/s 194-IA, related party flat allotments below market, loans from buyers (Sec 269SS), unsold inventory valuation. Risks + procedures.' },
  { cat: "Industry", title: "Manufacturing", text: 'Review manufacturing company: RM consumption ratio vs prior year, power/fuel vs production, labour per unit, WIP/FG absorption costing, CWIP ageing >2 years, GST job work + GTA RCM, additional depreciation u/s 32(1)(iia), captive consumption GST, scrap sales TCS u/s 206C. Top 5 risks + audit tests.' },
];

const CLAUSE_MAP = [
  { no: 1, title: "Name of assessee" }, { no: 3, title: "PAN" },
  { no: 6, title: "Books of account prescribed" }, { no: 9, title: "Method of accounting (Sec 145)" },
  { no: 10, title: "Change in accounting method" }, { no: 11, title: "Change in stock valuation" },
  { no: 12, title: "Turnover / gross receipts" }, { no: 16, title: "Related party payments — 40A(2)" },
  { no: 17, title: "Amounts not deductible — Sec 40(a), 37" }, { no: 18, title: "Cash payments >₹10K — 40A(3)" },
  { no: 21, title: "MODVAT / GST credit" }, { no: 26, title: "Statutory dues — Sec 43B" },
  { no: 28, title: "TDS deduction — all sections" }, { no: 29, title: "Sec 269SS / 269T compliance" },
  { no: 30, title: "Losses brought forward" }, { no: 34, title: "TDS — detailed clause" },
  { no: 36, title: "Transfer Pricing — Form 3CEB" }, { no: 42, title: "VDA / Crypto — Sec 115BBH" },
  { no: 44, title: "GST reconciliation" },
];

function PromptLibrary({ onUsePrompt }) {
  const cats = [...new Set(PROMPT_LIBRARY.map(p => p.cat))];
  const [active, setActive] = useState(cats[0]);
  const [copied, setCopied] = useState(null);

  const copy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
        {cats.map(c => (
          <button key={c} onClick={() => setActive(c)}
            style={{ padding: "6px 14px", borderRadius: "var(--border-radius-md)",
              background: active === c ? "var(--color-background-info)" : "var(--color-background-secondary)",
              color: active === c ? "var(--color-text-info)" : "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)", fontSize: 13, cursor: "pointer" }}>
            {c}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {PROMPT_LIBRARY.filter(p => p.cat === active).map((p, i) => (
          <div key={i} style={{ background: "var(--color-background-primary)",
            border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)",
            padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <span style={{ fontWeight: 500, fontSize: 14, color: "var(--color-text-primary)" }}>{p.title}</span>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => copy(p.text, i)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: "var(--border-radius-md)",
                    background: copied === i ? "var(--color-background-success)" : "var(--color-background-secondary)",
                    color: copied === i ? "var(--color-text-success)" : "var(--color-text-secondary)",
                    border: "0.5px solid var(--color-border-secondary)", cursor: "pointer" }}>
                  <i className={`ti ${copied === i ? "ti-check" : "ti-copy"}`} style={{ marginRight: 4 }} />
                  {copied === i ? "Copied" : "Copy"}
                </button>
                <button onClick={() => onUsePrompt(p)}
                  style={{ fontSize: 12, padding: "4px 10px", borderRadius: "var(--border-radius-md)",
                    background: "var(--color-background-info)", color: "var(--color-text-info)",
                    border: "0.5px solid var(--color-border-info)", cursor: "pointer" }}>
                  Use ↗
                </button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: "var(--color-text-secondary)", margin: 0, lineHeight: 1.6,
              display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {p.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ClauseSelector({ onSelect }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <p style={{ fontSize: 13, color: "var(--color-text-secondary)", margin: "0 0 8px" }}>Quick-select Form 3CD clause:</p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {CLAUSE_MAP.map(c => (
          <button key={c.no} onClick={() => onSelect(c)}
            style={{ fontSize: 11, padding: "4px 10px", borderRadius: "var(--border-radius-md)",
              background: "var(--color-background-secondary)", color: "var(--color-text-secondary)",
              border: "0.5px solid var(--color-border-secondary)", cursor: "pointer" }}>
            Cl. {c.no} — {c.title}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [activeModule, setActiveModule] = useState("tb");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [streaming, setStreaming] = useState("");
  const bottomRef = useRef(null);
  const mod = PROMPTS[activeModule];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  const switchModule = (id) => {
    setActiveModule(id);
    setMessages([]);
    setInput("");
    setError("");
    setStreaming("");
  };

  const usePromptFromLibrary = (p) => {
    switchModule("tb");
    setTimeout(() => setInput(p.text + "\n\n[Paste your data below this line]\n"), 100);
  };

  const addClause = (c) => {
    setInput(prev => `Clause ${c.no} — ${c.title}\n\n${prev}`);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setError("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);
    setStreaming("");

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 4000,
          system: mod.system || "You are a helpful audit assistant.",
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }),
      });

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));
        for (const line of lines) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "content_block_delta" && data.delta?.text) {
              full += data.delta.text;
              setStreaming(full);
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: "assistant", content: full }]);
      setStreaming("");
    } catch (e) {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderMarkdown = (text) => {
    if (!text) return "";
    return text
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.+?)\*/g, "<em>$1</em>")
      .replace(/^### (.+)$/gm, '<h3 style="font-size:15px;font-weight:500;margin:16px 0 6px;color:var(--color-text-primary)">$1</h3>')
      .replace(/^## (.+)$/gm, '<h2 style="font-size:17px;font-weight:500;margin:20px 0 8px;color:var(--color-text-primary)">$1</h2>')
      .replace(/^# (.+)$/gm, '<h2 style="font-size:17px;font-weight:500;margin:20px 0 8px;color:var(--color-text-primary)">$1</h2>')
      .replace(/^\d+\. (.+)$/gm, '<div style="margin:4px 0;padding-left:16px">$&</div>')
      .replace(/^- (.+)$/gm, '<div style="margin:3px 0;padding-left:12px;color:var(--color-text-primary)">• $1</div>')
      .replace(/\n\n/g, '<div style="height:10px"></div>')
      .replace(/\n/g, "<br/>");
  };

  const displayText = streaming || "";
  const showClauses = activeModule === "taxaudit";
  const showPromptLib = activeModule === "prompts";

  return (
    <div style={{ display: "flex", height: 680, fontFamily: "var(--font-sans)",
      border: "0.5px solid var(--color-border-tertiary)", borderRadius: "var(--border-radius-lg)", overflow: "hidden" }}>

      {/* Sidebar */}
      <div style={{ width: 190, background: "var(--color-background-secondary)",
        borderRight: "0.5px solid var(--color-border-tertiary)", display: "flex",
        flexDirection: "column", flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "14px 14px 10px",
          borderBottom: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 11, fontWeight: 500, color: "var(--color-text-secondary)",
            textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>PBS & Co.</div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>AI Audit Assistant</div>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 2 }}>FY 2025-26</div>
        </div>
        <div style={{ padding: "10px 8px", flex: 1 }}>
          {MODULES.map(m => (
            <button key={m.id} onClick={() => switchModule(m.id)}
              style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 10px",
                borderRadius: "var(--border-radius-md)", marginBottom: 2, cursor: "pointer",
                background: activeModule === m.id ? "var(--color-background-primary)" : "transparent",
                border: activeModule === m.id ? "0.5px solid var(--color-border-secondary)" : "0.5px solid transparent",
                color: activeModule === m.id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                textAlign: "left" }}>
              <i className={`ti ${m.icon}`} style={{ fontSize: 15, color: activeModule === m.id ? m.color : "var(--color-text-tertiary)", flexShrink: 0 }} aria-hidden="true" />
              <span style={{ fontSize: 12.5, fontWeight: activeModule === m.id ? 500 : 400, lineHeight: 1.3 }}>{m.label}</span>
            </button>
          ))}
        </div>
        <div style={{ padding: "10px 14px 14px", borderTop: "0.5px solid var(--color-border-tertiary)" }}>
          <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", lineHeight: 1.5 }}>
            Mask PAN, Aadhaar, account numbers before uploading client data.
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, background: "var(--color-background-primary)" }}>

        {/* Header */}
        <div style={{ padding: "12px 18px", borderBottom: "0.5px solid var(--color-border-tertiary)",
          display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 32, height: 32, borderRadius: "var(--border-radius-md)",
            background: "var(--color-background-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
            <i className={`ti ${MODULES.find(m => m.id === activeModule)?.icon}`}
              style={{ fontSize: 16, color: MODULES.find(m => m.id === activeModule)?.color }} aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{mod.label}</div>
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
              {messages.length === 0 ? "Start a new analysis" : `${Math.ceil(messages.filter(m=>m.role==="assistant").length)} response${messages.filter(m=>m.role==="assistant").length !== 1 ? "s" : ""}`}
            </div>
          </div>
          {messages.length > 0 && (
            <button onClick={() => setMessages([])}
              style={{ marginLeft: "auto", fontSize: 12, padding: "5px 12px", cursor: "pointer",
                borderRadius: "var(--border-radius-md)", background: "var(--color-background-secondary)",
                color: "var(--color-text-secondary)", border: "0.5px solid var(--color-border-secondary)" }}>
              <i className="ti ti-refresh" style={{ marginRight: 4 }} />Clear
            </button>
          )}
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
          {showPromptLib ? (
            <PromptLibrary onUsePrompt={usePromptFromLibrary} />
          ) : messages.length === 0 && !streaming ? (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", height: "100%", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: "var(--border-radius-lg)",
                background: "var(--color-background-secondary)", display: "flex",
                alignItems: "center", justifyContent: "center" }}>
                <i className={`ti ${MODULES.find(m => m.id === activeModule)?.icon}`}
                  style={{ fontSize: 24, color: "var(--color-text-tertiary)" }} aria-hidden="true" />
              </div>
              <div style={{ textAlign: "center", maxWidth: 400 }}>
                <div style={{ fontSize: 15, fontWeight: 500, color: "var(--color-text-primary)", marginBottom: 6 }}>
                  {mod.label}
                </div>
                <div style={{ fontSize: 13, color: "var(--color-text-secondary)", lineHeight: 1.6 }}>
                  {mod.hint}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => { setActiveModule("prompts"); }}
                  style={{ fontSize: 12, padding: "7px 14px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                    background: "var(--color-background-secondary)", color: "var(--color-text-secondary)",
                    border: "0.5px solid var(--color-border-secondary)" }}>
                  <i className="ti ti-books" style={{ marginRight: 6 }} />View prompt library
                </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: 20,
                  display: "flex", flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div style={{ maxWidth: "88%",
                    background: msg.role === "user" ? "var(--color-background-info)" : "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)", padding: "12px 16px" }}>
                    {msg.role === "user" ? (
                      <p style={{ margin: 0, fontSize: 13, color: "var(--color-text-info)",
                        whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{msg.content}</p>
                    ) : (
                      <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}
                        dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 4,
                    paddingLeft: msg.role === "user" ? 0 : 4, paddingRight: msg.role === "user" ? 4 : 0 }}>
                    {msg.role === "user" ? "You" : "AI Audit Assistant"}
                  </div>
                </div>
              ))}
              {streaming && (
                <div style={{ marginBottom: 20, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                  <div style={{ maxWidth: "88%", background: "var(--color-background-secondary)",
                    border: "0.5px solid var(--color-border-tertiary)",
                    borderRadius: "var(--border-radius-lg)", padding: "12px 16px" }}>
                    <div style={{ fontSize: 13, color: "var(--color-text-primary)", lineHeight: 1.7 }}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(streaming) }} />
                    <span style={{ display: "inline-block", width: 6, height: 14, background: "var(--color-text-secondary)",
                      marginLeft: 2, animation: "blink 1s infinite", verticalAlign: "text-bottom" }} />
                  </div>
                </div>
              )}
              {loading && !streaming && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", color: "var(--color-text-tertiary)", fontSize: 13 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0,1,2].map(d => (
                      <div key={d} style={{ width: 6, height: 6, borderRadius: "50%",
                        background: "var(--color-text-tertiary)",
                        animation: `pulse 1.2s ease-in-out ${d*0.2}s infinite` }} />
                    ))}
                  </div>
                  Analysing...
                </div>
              )}
              {error && (
                <div style={{ padding: "10px 14px", background: "var(--color-background-danger)",
                  border: "0.5px solid var(--color-border-danger)", borderRadius: "var(--border-radius-md)",
                  color: "var(--color-text-danger)", fontSize: 13, marginBottom: 12 }}>
                  <i className="ti ti-alert-circle" style={{ marginRight: 6 }} />{error}
                </div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input area */}
        {!showPromptLib && (
          <div style={{ borderTop: "0.5px solid var(--color-border-tertiary)", padding: "12px 18px" }}>
            {showClauses && messages.length === 0 && <ClauseSelector onSelect={addClause} />}
            <div style={{ display: "flex", gap: 8 }}>
              <textarea value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) sendMessage(); }}
                placeholder={mod.placeholder || "Type your query or paste data here... (Ctrl+Enter to send)"}
                style={{ flex: 1, minHeight: 80, maxHeight: 200, resize: "vertical", fontSize: 13,
                  padding: "10px 12px", borderRadius: "var(--border-radius-md)",
                  border: "0.5px solid var(--color-border-secondary)", lineHeight: 1.6,
                  fontFamily: "var(--font-sans)", color: "var(--color-text-primary)",
                  background: "var(--color-background-secondary)" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <button onClick={sendMessage} disabled={!input.trim() || loading}
                  style={{ padding: "10px 16px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                    background: input.trim() && !loading ? "var(--color-background-info)" : "var(--color-background-secondary)",
                    color: input.trim() && !loading ? "var(--color-text-info)" : "var(--color-text-tertiary)",
                    border: "0.5px solid var(--color-border-secondary)", fontSize: 13, fontWeight: 500,
                    display: "flex", alignItems: "center", gap: 6 }}>
                  <i className="ti ti-send" />Analyse
                </button>
                {messages.length > 0 && (
                  <button onClick={() => setMessages([])}
                    style={{ padding: "6px 10px", borderRadius: "var(--border-radius-md)", cursor: "pointer",
                      background: "var(--color-background-secondary)", color: "var(--color-text-tertiary)",
                      border: "0.5px solid var(--color-border-tertiary)", fontSize: 12 }}>
                    New
                  </button>
                )}
              </div>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-tertiary)", marginTop: 6 }}>
              Ctrl+Enter to send · Responses are AI-assisted; professional judgment of the signing CA is mandatory before use.
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes pulse { 0%,100%{opacity:0.3;transform:scale(0.8)} 50%{opacity:1;transform:scale(1)} }
        textarea:focus { outline: none; border-color: var(--color-border-primary) !important; }
        button:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}
