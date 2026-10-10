import { useEffect, useMemo, useState } from "react";
import {
  Scale, Search, House, BookOpen, FileText, LifeBuoy, Menu, X,
  ArrowUpRight, ShieldCheck, ChevronRight, Clock3, Copy, Download,
  CheckCircle2, ExternalLink, Sparkles, GraduationCap, BriefcaseBusiness,
  ShoppingBag, MessageCircle, AlertCircle
} from "lucide-react";

const API = "http://127.0.0.1:5000/api";

const fallbackIssues = [
  { id: "deposit", title: "Rental deposit not returned", category: "Housing", icon: "home", description: "Your landlord or hostel has not returned your security deposit.", steps: ["Collect your rental agreement, payment proof, messages and move-out evidence.", "Send a calm written request listing the amount, date and a reasonable response deadline.", "If unresolved, contact a legal services authority or a qualified lawyer to understand the suitable next step."], source_name: "India Code — official legislation portal", source_url: "https://www.indiacode.nic.in/indiacode/home.jsp", note: "Rental rights depend on the agreement, state law and the facts of the situation." },
  { id: "internship", title: "Unpaid internship or overtime", category: "Work", icon: "briefcase", description: "You believe promised internship payment or wages have not been paid.", steps: ["Keep the offer letter, internship terms, attendance, timesheets and payment messages.", "Ask the organisation in writing to clarify the amount due and the payment date.", "If the issue continues, seek advice from the relevant labour authority or a legal services provider."], source_name: "India Code — official legislation portal", source_url: "https://www.indiacode.nic.in/indiacode/home.jsp", note: "Whether a payment or labour law applies depends on the work arrangement and applicable law." },
  { id: "college", title: "College disciplinary action", category: "Education", icon: "graduation", description: "You want to challenge a disciplinary decision or understand a college complaint process.", steps: ["Read the student handbook, notice and applicable university regulations.", "Keep copies of notices, emails and evidence; note any appeal deadline.", "Submit a factual written representation through the official college or university grievance process."], source_name: "UGC — official website", source_url: "https://www.ugc.gov.in/", note: "Follow the rules and appeal process applicable to your institution. Seek advice for serious or urgent matters." },
  { id: "consumer", title: "Online purchase or service complaint", category: "Consumer", icon: "shopping", description: "A seller or service provider has not resolved a purchase or service problem.", steps: ["Save the invoice, order ID, screenshots, warranty and communication.", "Contact the seller or service provider and clearly state the resolution you want.", "If unresolved, check the National Consumer Helpline and its current complaint process."], source_name: "National Consumer Helpline", source_url: "https://consumerhelpline.gov.in/", note: "The helpline offers consumer grievance support; it does not guarantee a particular outcome." },
  { id: "privacy", title: "Privacy or misuse of personal information", category: "Privacy", icon: "shield", description: "You are concerned about how an organisation or person used your personal information.", steps: ["Save relevant messages, screenshots, dates and account/security notifications.", "Use the service's official privacy, grievance or security reporting channel.", "If there is a threat, fraud or immediate safety concern, contact the appropriate official authority."], source_name: "India Code — official legislation portal", source_url: "https://www.indiacode.nic.in/indiacode/home.jsp", note: "The correct process depends on the type of data, who used it and the circumstances." }
];

const fallbackCards = [
  { title: "Keep a paper trail", category: "Practical tip", body: "Save agreements, receipts, emails, notices and dated screenshots. Organised records can help you explain a problem clearly." },
  { title: "Read before you sign", category: "Housing & work", body: "Read agreements and ask for unclear terms in writing before accepting them. Keep a copy of the signed version." },
  { title: "Ask for the process in writing", category: "Education", body: "For a college grievance, ask which policy applies, how to submit a representation and whether a deadline exists." },
  { title: "Know where to ask for help", category: "Legal aid", body: "NALSA and State/District Legal Services Authorities provide information about free legal services and eligibility." },
  { title: "Consumer complaints need evidence", category: "Consumer", body: "Keep order details, invoices, payment proof and a record of the attempts you made to resolve the issue." }
];

const resources = [
  { name: "NALSA — Legal Services", desc: "Information about free legal aid and legal services authorities.", url: "https://nalsa.gov.in/legal-services/", tag: "Legal aid" },
  { name: "India Code", desc: "Official repository for Central legislation. Check the current text of relevant laws.", url: "https://www.indiacode.nic.in/indiacode/home.jsp", tag: "Legislation" },
  { name: "National Consumer Helpline", desc: "Government consumer grievance support. The listed toll-free number is 1915.", url: "https://consumerhelpline.gov.in/", tag: "Consumer support" },
  { name: "UGC", desc: "Official University Grants Commission website and resources.", url: "https://www.ugc.gov.in/", tag: "Education" },
  { name: "Kerala State Legal Services Authority", desc: "Legal services information for Kerala.", url: "https://kerala.nalsa.gov.in/introduction/", tag: "Kerala legal aid" }
];

function IconFor({ name, size = 19 }) {
  if (name === "home") return <House size={size} />;
  if (name === "briefcase") return <BriefcaseBusiness size={size} />;
  if (name === "graduation") return <GraduationCap size={size} />;
  if (name === "shopping") return <ShoppingBag size={size} />;
  if (name === "shield") return <ShieldCheck size={size} />;
  return <Scale size={size} />;
}

function App() {
  const [page, setPage] = useState("home");
  const [mobileNav, setMobileNav] = useState(false);
  const [query, setQuery] = useState("");
  const [issues, setIssues] = useState(fallbackIssues);
  const [cards, setCards] = useState(fallbackCards);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState("");
  const [form, setForm] = useState({ full_name: "", recipient: "", date: new Date().toISOString().slice(0, 10), issue: "Request for resolution", details: "", amount: "" });
  const [documentText, setDocumentText] = useState("");
  const [docLoading, setDocLoading] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [backendOnline, setBackendOnline] = useState(false);

  useEffect(() => {
    fetch(`${API}/health`).then(r => r.ok ? r.json() : Promise.reject())
      .then(() => setBackendOnline(true)).catch(() => setBackendOnline(false));
    fetch(`${API}/issues`).then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setIssues(d.issues || fallbackIssues)).catch(() => {});
    fetch(`${API}/flashcards`).then(r => r.ok ? r.json() : Promise.reject())
      .then(d => setCards(d.flashcards?.length ? d.flashcards : fallbackCards)).catch(() => {});
  }, []);

  const filteredIssues = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return issues;
    return issues.filter(i => `${i.title} ${i.category} ${i.description}`.toLowerCase().includes(q));
  }, [issues, query]);

  function go(to) {
    setPage(to);
    setMobileNav(false);
    setNotice("");
  }

  async function runSearch(e) {
    e?.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    try {
      const response = await fetch(`${API}/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) throw new Error("Search unavailable");
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch {
      setSearchResults(filteredIssues);
    } finally {
      setSearching(false);
      setPage("guide");
    }
  }

  async function generateDocument(e) {
    e.preventDefault();
    setDocLoading(true);
    setNotice("");
    try {
      const response = await fetch(`${API}/generate-document`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!response.ok) throw new Error("Could not generate document");
      const data = await response.json();
      setDocumentText(data.document);
    } catch {
      const text = `${form.full_name || "[Your name]"}\n${form.date}\n\nTo,\n${form.recipient || "[Recipient / organisation]"}\n\nSubject: ${form.issue}\n\nRespected Sir/Madam,\n\nI am writing to request your attention to the following matter:\n${form.details || "[Describe the issue, dates and relevant facts.]"}\n${form.amount ? `\nAmount involved: ₹${form.amount}\n` : ""}\nI request that you review this matter and inform me of the appropriate resolution in writing. I have retained the relevant records and can provide them if required.\n\nThank you.\n\nYours faithfully,\n${form.full_name || "[Your name]"}`;
      setDocumentText(text);
    } finally {
      setDocLoading(false);
    }
  }

  async function copyDocument() {
    try {
      await navigator.clipboard.writeText(documentText);
      setNotice("Draft copied to clipboard.");
    } catch {
      setNotice("Copy was blocked by your browser. Select the draft text and copy it manually.");
    }
  }

  function downloadDocument() {
    const blob = new Blob([documentText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "rightspocket-draft-letter.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  function chooseIssue(issue) {
    setSelectedIssue(issue);
    setPage("issue");
    setNotice("");
  }

  const navItems = [
    { id: "home", label: "Overview", icon: <House size={18} /> },
    { id: "guide", label: "Rights guide", icon: <Scale size={18} /> },
    { id: "learn", label: "Learn daily", icon: <BookOpen size={18} /> },
    { id: "documents", label: "Document generator", icon: <FileText size={18} /> },
    { id: "support", label: "Find legal help", icon: <LifeBuoy size={18} /> }
  ];

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><Scale size={24} /></div>
          <div><strong>RightsPocket</strong><span>Know your rights</span></div>
          <button className="icon-button close-nav" onClick={() => setMobileNav(false)} aria-label="Close menu"><X /></button>
        </div>
        <div className="workspace-label">YOUR SPACE</div>
        <nav>
          {navItems.map(item => <button key={item.id} className={`nav-link ${page === item.id || (page === "issue" && item.id === "guide") ? "active" : ""}`} onClick={() => go(item.id)}>{item.icon}<span>{item.label}</span>{item.id === "guide" && <ChevronRight className="nav-chevron" size={16} />}</button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="privacy-card"><ShieldCheck size={19}/><div><strong>Your privacy matters</strong><p>This demo does not save your form details to a database.</p></div></div>
          <div className="sidebar-foot"><span className={`status-dot ${backendOnline ? "online" : ""}`}></span>{backendOnline ? "Backend connected" : "Demo mode · backend offline"}</div>
        </div>
      </aside>

      {mobileNav && <button className="mobile-scrim" onClick={() => setMobileNav(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <button className="icon-button mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open menu"><Menu /></button>
          <div className="breadcrumb">Student support <ChevronRight size={15} /> <strong>{navItems.find(n => n.id === page)?.label || (page === "issue" ? "Issue details" : "Rights guide")}</strong></div>
          <div className="topbar-right"><span className="top-tag"><span className="tiny-green"></span> Student-first legal info</span><div className="avatar">RP</div></div>
        </header>

        <div className="page-content">
          {notice && <div className="notice"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}

          {page === "home" && <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow"><Sparkles size={15}/> LEGAL CLARITY FOR STUDENTS</div>
                <h1>Your rights.<br/><span>Made easier.</span></h1>
                <p>Everyday legal information, practical next steps, and trusted support — all in one pocket-friendly place.</p>
                <form className="hero-search" onSubmit={runSearch}><Search size={19}/><input value={query} onChange={e => {setQuery(e.target.value); setSearchResults(null);}} placeholder="Describe your situation..." aria-label="Search legal issues"/><button type="submit" disabled={searching}>{searching ? "Searching…" : "Find guidance"} <ArrowUpRight size={16}/></button></form>
                <div className="hero-trust"><ShieldCheck size={16}/> Clear language <span>·</span> Official source links <span>·</span> No paid API required</div>
              </div>
              <div className="hero-art" aria-hidden="true">
                <div className="art-circle circle-one"></div><div className="art-circle circle-two"></div>
                <div className="floating-card card-top"><span className="float-icon mint"><CheckCircle2 size={20}/></span><div><strong>Know your options</strong><small>Clear, practical steps</small></div></div>
                <div className="shield-illustration"><div className="shield-inner"><Scale size={66}/></div><div className="shield-check"><CheckCircle2 size={23}/></div></div>
                <div className="floating-card card-bottom"><span className="float-icon lavender"><FileText size={20}/></span><div><strong>Ready when you are</strong><small>Draft a letter in minutes</small></div></div>
              </div>
            </section>

            <section className="section-block">
              <div className="section-heading"><div><span className="section-kicker">START HERE</span><h2>What can we help with?</h2><p>Choose a situation to see general information and practical next steps.</p></div><button className="text-button" onClick={() => go("guide")}>Browse all topics <ArrowUpRight size={16}/></button></div>
              <div className="issue-grid">
                {issues.slice(0, 4).map(issue => <button className="issue-card" key={issue.id} onClick={() => chooseIssue(issue)}><div className={`issue-icon tone-${issue.category.toLowerCase()}`}><IconFor name={issue.icon} size={21}/></div><span className="category-label">{issue.category}</span><h3>{issue.title}</h3><p>{issue.description}</p><span className="card-link">Explore guidance <ChevronRight size={16}/></span></button>)}
              </div>
            </section>

            <section className="bottom-grid">
              <div className="learning-banner"><div className="learn-symbol"><BookOpen size={25}/></div><div><span className="section-kicker">A LITTLE KNOWLEDGE GOES A LONG WAY</span><h3>One minute. One useful right.</h3><p>Build your legal awareness with simple daily learning cards.</p><button className="button-light" onClick={() => go("learn")}>Explore flashcards <ArrowUpRight size={16}/></button></div><div className="banner-decoration">✳</div></div>
              <div className="support-mini"><div className="support-mini-icon"><LifeBuoy size={23}/></div><span className="section-kicker">NEED A HUMAN?</span><h3>Find trusted support</h3><p>Connect with official legal aid and grievance resources.</p><button className="button-outline" onClick={() => go("support")}>View resources <ChevronRight size={16}/></button></div>
            </section>
            <p className="disclaimer"><AlertCircle size={15}/> RightsPocket provides general legal information, not legal advice. Check the current law and seek qualified help for your situation.</p>
          </>}

          {page === "guide" && <>
            <div className="page-intro"><span className="section-kicker">SITUATION-TO-RIGHTS GUIDE</span><h1>Let's find your next step.</h1><p>Search by issue or select a topic. Results are general guidance, not a legal decision.</p></div>
            <form className="search-panel" onSubmit={runSearch}><Search size={20}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Try “deposit”, “internship”, or “college complaint”"/><button className="button-primary" type="submit">{searching ? "Searching…" : "Search"}</button></form>
            {searchResults && <div className="results-note">Search results for <strong>“{query}”</strong>. {searchResults.length} matching topic(s) found.</div>}
            <div className="guide-list">{(searchResults || filteredIssues).map(issue => <button className="guide-row" key={issue.id} onClick={() => chooseIssue(issue)}><div className={`issue-icon tone-${issue.category.toLowerCase()}`}><IconFor name={issue.icon}/></div><div className="guide-row-text"><span className="category-label">{issue.category}</span><h3>{issue.title}</h3><p>{issue.description}</p></div><ChevronRight className="guide-arrow"/></button>)}</div>
            {!(searchResults || filteredIssues).length && <div className="empty-state">No exact match found. Try different words or browse the support resources.</div>}
          </>}

          {page === "issue" && selectedIssue && <>
            <button className="back-link" onClick={() => go("guide")}>← Back to all topics</button>
            <div className="issue-detail-head"><div className={`issue-icon large tone-${selectedIssue.category.toLowerCase()}`}><IconFor name={selectedIssue.icon} size={26}/></div><div><span className="category-label">{selectedIssue.category} · GENERAL INFORMATION</span><h1>{selectedIssue.title}</h1><p>{selectedIssue.description}</p></div></div>
            <div className="detail-layout"><section className="content-panel"><div className="panel-title"><span className="number-badge">1</span><div><h2>Practical next steps</h2><p>Start by organising the facts and records.</p></div></div><ol className="step-list">{selectedIssue.steps.map((step, i) => <li key={i}><span>{i + 1}</span><p>{step}</p></li>)}</ol><div className="caution-box"><AlertCircle size={19}/><p><strong>Keep in mind</strong><br/>{selectedIssue.note}</p></div><div className="source-box"><div className="source-symbol"><ShieldCheck size={21}/></div><div><span className="section-kicker">REFERENCE SOURCE</span><h3>{selectedIssue.source_name}</h3><p>Check the current official information relevant to your facts and location.</p><a href={selectedIssue.source_url} target="_blank" rel="noreferrer">Open official source <ExternalLink size={14}/></a></div></div></section><aside className="side-action-panel"><div className="side-action-icon"><FileText size={24}/></div><h3>Need to put it in writing?</h3><p>Create an editable draft to explain your concern clearly.</p><button className="button-primary full-width" onClick={() => {setForm(f => ({...f, issue: selectedIssue.title})); go("documents");}}>Create a draft <ArrowUpRight size={16}/></button><div className="side-divider"></div><h4>Need professional help?</h4><p>Contact a legal services authority or an appropriate official support channel.</p><button className="button-outline full-width" onClick={() => go("support")}>Find support <ChevronRight size={16}/></button></aside></div>
          </>}

          {page === "learn" && <>
            <div className="page-intro"><span className="section-kicker">MICRO-LEARNING</span><h1>Small lessons. Stronger awareness.</h1><p>Short, practical reminders to help you spot issues early.</p></div>
            <div className="flashcard-wrap"><div className="flashcard-top"><span><BookOpen size={16}/> DAILY LEARNING</span><span>{cards.length ? cardIndex + 1 : 0} / {cards.length}</span></div><div className="flashcard"><div className="flashcard-art"><div className="flash-ring"></div><BookOpen size={48}/></div><span className="category-label">{cards[cardIndex]?.category || "Legal awareness"}</span><h2>{cards[cardIndex]?.title || "Know your rights"}</h2><p>{cards[cardIndex]?.body || "Learn how to identify a problem and find reliable support."}</p><div className="flashcard-tip"><Sparkles size={17}/><span>Remember: keep relevant records and verify legal information from official sources.</span></div></div><div className="flash-controls"><button className="button-outline" onClick={() => setCardIndex(i => (i - 1 + cards.length) % cards.length)} disabled={cards.length < 2}>Previous</button><div className="dots">{cards.map((_, i) => <button key={i} className={i === cardIndex ? "dot active" : "dot"} onClick={() => setCardIndex(i)} aria-label={`Show card ${i + 1}`}/>)}</div><button className="button-primary" onClick={() => setCardIndex(i => (i + 1) % cards.length)} disabled={cards.length < 2}>Next lesson <ChevronRight size={16}/></button></div></div>
            <div className="info-note"><ShieldCheck size={18}/><p>These flashcards are general awareness tips, not a complete statement of the law. Check official sources for the law that applies to your circumstances.</p></div>
          </>}

          {page === "documents" && <>
            <div className="page-intro"><span className="section-kicker">AUTO-DOCUMENT GENERATOR</span><h1>Make your concern clear.</h1><p>Create a starting draft for a request or complaint. Review and edit it before sending.</p></div>
            <div className="document-layout"><form className="content-panel document-form" onSubmit={generateDocument}><div className="panel-title"><span className="number-badge"><FileText size={17}/></span><div><h2>Tell us the basics</h2><p>Only enter information you are comfortable using in this demo.</p></div></div><label>Your full name<input value={form.full_name} onChange={e => setForm({...form, full_name: e.target.value})} placeholder="e.g. Ananya Kumar"/></label><label>Recipient / organisation<input value={form.recipient} onChange={e => setForm({...form, recipient: e.target.value})} placeholder="e.g. Hostel manager or college office"/></label><div className="form-two"><label>Date<input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required/></label><label>Amount (optional)<input value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="e.g. 5000" inputMode="decimal"/></label></div><label>Subject<select value={form.issue} onChange={e => setForm({...form, issue: e.target.value})}><option>Request for resolution</option><option>Rental deposit return request</option><option>Unpaid internship payment</option><option>Academic appeal</option><option>Consumer complaint</option><option>Request for information</option>{selectedIssue && <option>{selectedIssue.title}</option>}</select></label><label>Describe the issue<textarea value={form.details} onChange={e => setForm({...form, details: e.target.value})} placeholder="Explain what happened, dates, what you have already tried, and the resolution you are requesting." rows={5} required/></label><div className="form-tip"><ShieldCheck size={16}/><span>Avoid entering passwords, identity numbers, or other highly sensitive personal data.</span></div><button className="button-primary full-width" type="submit" disabled={docLoading}>{docLoading ? "Generating draft…" : "Generate my draft"} <Sparkles size={16}/></button></form><section className="content-panel preview-panel"><div className="preview-header"><div><span className="section-kicker">LIVE PREVIEW</span><h2>Your document</h2></div><div className="preview-icon"><FileText size={21}/></div></div>{documentText ? <><pre className="document-preview">{documentText}</pre><div className="preview-actions"><button className="button-outline" onClick={copyDocument}><Copy size={15}/> Copy text</button><button className="button-primary" onClick={downloadDocument}><Download size={15}/> Download .txt</button></div></> : <div className="preview-empty"><div className="preview-empty-icon"><FileText size={31}/></div><h3>Your draft will appear here</h3><p>Complete the form and select “Generate my draft”. You can then copy, download and edit it.</p></div>}<p className="preview-disclaimer"><AlertCircle size={15}/> This is a template, not a lawyer-reviewed legal notice. Verify the facts, applicable law, recipient and procedure before sending.</p></section></div>
          </>}

          {page === "support" && <>
            <div className="page-intro"><span className="section-kicker">TRUSTED SUPPORT</span><h1>You don't have to figure it out alone.</h1><p>Start with official sources. Eligibility, procedures and available services can vary.</p></div>
            <div className="support-feature"><div className="support-feature-icon"><LifeBuoy size={26}/></div><div><span className="section-kicker">FREE LEGAL SERVICES</span><h2>National Legal Services Authority (NALSA)</h2><p>NALSA provides information about free legal services for eligible people and connects with legal services institutions across India.</p><a href="https://nalsa.gov.in/legal-services/" target="_blank" rel="noreferrer" className="button-light">Explore legal services <ArrowUpRight size={16}/></a></div><div className="support-feature-number">01</div></div>
            <div className="resource-grid">{resources.map((r, i) => <article className="resource-card" key={r.name}><span className="resource-number">0{i + 2}</span><span className="resource-tag">{r.tag}</span><h3>{r.name}</h3><p>{r.desc}</p><a href={r.url} target="_blank" rel="noreferrer">Visit official website <ExternalLink size={15}/></a></article>)}</div>
            <div className="info-note"><AlertCircle size={18}/><p>For immediate danger or urgent threats, contact the appropriate emergency service or local authorities. RightsPocket is not an emergency service and cannot assess eligibility for legal aid.</p></div>
          </>}

          <footer className="footer"><div className="footer-brand"><Scale size={17}/> RightsPocket</div><span></span><a href="https://www.indiacode.nic.in/indiacode/home.jsp" target="_blank" rel="noreferrer">Verify laws at India Code <ExternalLink size={13}/></a></footer>
        </div>
      </main>
    </div>
  );
}

export default App;
