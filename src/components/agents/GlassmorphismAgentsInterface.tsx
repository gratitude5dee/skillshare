import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, Filter, X, Play, Info, Wand2, Clock, Check, ChevronDown, Send, Settings2, PlusSquare, Calendar, Link as LinkIcon, Loader2, ExternalLink, LayoutGrid, SlidersHorizontal } from "lucide-react";
import { ManusAPIService } from '@/services/ManusAPIService';
import { useToast } from '@/hooks/use-toast';

const AGENT_TYPES = ["All", "Create", "Connect", "Report", "Plan", "Research"] as const;

const TASK_TYPES = [
  "Slides",
  "Wide Research",
  "Webpage",
  "Video Generation",
  "Image Generation",
  "Scheduled Tasks",
  "Cloud Browser",
];

const CONNECTORS = [
  { id: "polygon", label: "Polygon" },
  { id: "supabase", label: "Supabase" },
  { id: "huggingface", label: "HuggingFace" },
  { id: "stripe", label: "Stripe" },
  { id: "cloudflare", label: "Cloudflare" },
  { id: "firecrawl", label: "Firecrawl" },
  { id: "heygen", label: "HeyGen" },
  { id: "invideo", label: "Invideo" },
  { id: "minimax", label: "Minimax" },
  { id: "gmail", label: "Gmail Send" },
];

/** Agents catalog: type, title, subtitle/description */
const AGENTS = [
  // Create
  { type: "Create", title: "5 Viral Content Ideas", subtitle: "Analyzes current viral trends and gives you 5 authentic content ideas with high viral potential and platform strategies." },
  { type: "Create", title: "Corporate Partnership Finder", subtitle: "Analyzes your audience to find perfect brand partnership opportunities ranked by revenue potential." },
  { type: "Create", title: "Image to Style Extractor", subtitle: "Turn image(s) into a style guide prompt." },
  { type: "Create", title: "Update YouTube Thumbnails", subtitle: "Finds your low-performing videos and creates new eye-catching thumbnails to improve click-through rates." },

  // Connect
  { type: "Connect", title: "Add Your Spin to Trends", subtitle: "Shows you how to authentically participate in current trends with unique angle strategies and optimal timing." },
  { type: "Connect", title: "Artist Cross-Promotion Finder", subtitle: "Finds compatible artists for mutual audience growth with fanbase overlap analysis and campaign ideas." },
  { type: "Connect", title: "Comment Response Priority", subtitle: "Tells you exactly which comments across all platforms to respond to first for maximum engagement impact." },
  { type: "Connect", title: "Find Podcast Guests", subtitle: "Finds 10 niche creators with audience overlap and writes personalized podcast invitation emails ready to send." },
  { type: "Connect", title: "Niche Community Outreach", subtitle: "Identifies 5 hyper-niche communities aligned with your brand and writes collaboration emails ready to send." },
  { type: "Connect", title: "Potential Fan Finder", subtitle: "Analyzes lookalike artists and finds their followers who would likely become your fans, delivered weekly via email." },

  // Report
  { type: "Report", title: "Brand Audit", subtitle: "Comprehensive multi-platform artist brand audit." },
  { type: "Report", title: "Daily Social Trends", subtitle: "Daily email of key social media trends aligned with your artist." },
  { type: "Report", title: "Fat Beats Social Media Analysis", subtitle: "Fat Beats Social Media Analysis." },
  { type: "Report", title: "Weekly Performance Dashboard", subtitle: "Sets up automated weekly reports of your performance across all platforms delivered to your email." },
  { type: "Report", title: "Weekly Release Reports", subtitle: "Setup Weekly Release Report for my song or album. First, ask me the name of the song or album to report on. Then, ask me a 4..." },
  { type: "Report", title: "YouTube Revenue Report", subtitle: "Gets your actual YouTube revenue data and video performance metrics in an easy-to-read report." },

  // Plan
  { type: "Plan", title: "Brand Redesign with Visual Mockups", subtitle: "Analyzes your current brand perception and creates visual mockups of your refreshed identity with implementation steps." },
  { type: "Plan", title: "Content Calendar Creator", subtitle: "Develops strategic monthly content calendar across all platforms with posting schedule and trending topics." },
  { type: "Plan", title: "Find New Fans Visual Map", subtitle: "Identifies untapped audience segments and creates visual map showing where to find and acquire new listeners." },
  { type: "Plan", title: "Instagram Comment Recap", subtitle: "Daily email of top fan comments on your latest post." },
  { type: "Plan", title: "Merchandise Strategy Plan", subtitle: "Analyzes successful merch in your genre and creates data-driven product plan with pricing and design recommendations." },
  { type: "Plan", title: "Release Launch Strategy", subtitle: "Analyzes your past releases and creates timing, messaging, and platform strategy for maximum impact." },
  { type: "Plan", title: "Social Posts to Shop Sales Strategy", subtitle: "Creates strategy to convert your social media posts into direct shop sales with friction analysis." },
  { type: "Plan", title: "Tour Planning Strategy", subtitle: "Creates complete tour plan with optimized routing, venue selection, VIP experiences, and pricing strategy." },

  // Research
  { type: "Research", title: "Copy Your Top 3 Competitors", subtitle: "Researches your 3 biggest competitors and gives you specific tactics to copy for better performance." },
  { type: "Research", title: "Cross-Platform Social Audit", subtitle: "Complete health check of all your social media platforms with performance analysis and visual improvement diagram." },
  { type: "Research", title: "Fan Segment Revenue Analysis", subtitle: "Analyzes your fan segments to show which groups are worth the most money for targeted campaigns." },
  { type: "Research", title: "Find Brand-Ready Segments", subtitle: "Find hyper-niche fan segments your artist can leverage for lucrative brand deals." },
  { type: "Research", title: "Find Your Most Valuable Fans", subtitle: "Identifies your highest-spending fans with demographics and campaign targeting for maximum monetization." },
  { type: "Research", title: "Instagram Brand Partnership Finder", subtitle: "Analyzes your Instagram audience to find brand partnership opportunities and creates content themes." },
  { type: "Research", title: "Instagram Comment Response Guide", subtitle: "Reviews your Instagram comments and tells you which ones to respond to with engagement priorities." },
  { type: "Research", title: "Spotify Playlist Placement Finder", subtitle: "Finds playlists your music should be on for maximum streams and discovery." },
  { type: "Research", title: "Top Performing Content Finder", subtitle: "Finds your best-performing posts across all platforms to show you what content actually works." },
];

function classNames(...a: (string | false | undefined)[]) {
  return a.filter(Boolean).join(" ");
}

function useDebounced<T>(value: T, delay = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const id = setTimeout(() => setV(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return v;
}

const GradientBackground: React.FC = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:24px_24px]"></div>
    <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-fuchsia-400/30 blur-3xl" />
    <div className="absolute top-1/3 -right-24 h-96 w-96 rounded-full bg-gradient-to-br from-emerald-400/20 to-sky-400/20 blur-3xl" />
    <div className="absolute bottom-0 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-500/20 to-pink-500/20 blur-3xl" />
  </div>
);

const GlassPill: React.FC<{ active?: boolean; onClick?: () => void; children: React.ReactNode }> = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={classNames(
      "relative rounded-full px-4 py-2 text-sm font-medium transition",
      "backdrop-blur-xl border border-white/15",
      active ? "bg-white/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25)]" : "bg-white/10 text-white/80 hover:bg-white/15"
    )}
  >
    {children}
  </button>
);

const GlassCard: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={classNames(
    "group relative rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-xl",
    "shadow-[0_10px_30px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)]",
    "hover:shadow-[0_15px_45px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.35)] transition",
    className
  )}>
    <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition" style={{ background: "linear-gradient(120deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 40%)", maskImage: "radial-gradient(120px 60px at 10% 0%, #000 20%, transparent)" }} />
    {children}
  </div>
);

function fuzzyIncludes(hay: string, needle: string) {
  return hay.toLowerCase().includes(needle.trim().toLowerCase());
}

const QuickAction: React.FC<{ title: string; subtitle: string; onClick: () => void }> = ({ title, subtitle, onClick }) => (
  <GlassCard className="cursor-pointer bg-gradient-to-br from-white/15 to-white/5">
    <div className="flex items-start gap-4">
      <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
        <Sparkles className="h-6 w-6 text-white" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="text-white text-lg font-semibold">{title}</h4>
          <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs text-emerald-300">Preset</span>
        </div>
        <p className="mt-1 text-sm text-white/80">{subtitle}</p>
      </div>
      <button onClick={onClick} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
        <Play className="h-5 w-5" />
      </button>
    </div>
  </GlassCard>
);

function recommendedConnectors(agentType: string, title: string) {
  const base = ["supabase"] as string[];
  if (agentType === "Connect") base.push("gmail");
  if (agentType === "Research") base.push("firecrawl", "cloudflare");
  if (title.toLowerCase().includes("video") || title.toLowerCase().includes("youtube")) base.push("invideo", "minimax");
  if (title.toLowerCase().includes("partnership") || title.toLowerCase().includes("sponsor")) base.push("stripe");
  return Array.from(new Set(base));
}

const AgentCard = ({ agent, onOpen }: { agent: typeof AGENTS[number]; onOpen: () => void }) => (
  <motion.div layout whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
    <GlassCard>
      <div className="flex items-start gap-3">
        <div className="rounded-2xl bg-white/20 p-2.5">
          <Wand2 className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/80">{agent.type}</span>
          </div>
          <h3 className="text-white text-lg font-semibold leading-tight">{agent.title}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-white/80">{agent.subtitle}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {recommendedConnectors(agent.type, agent.title).map((c) => (
              <span key={c} className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[11px] text-white/80">{CONNECTORS.find(x=>x.id===c)?.label ?? c}</span>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onOpen} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/30">
            <Info className="h-5 w-5" />
          </button>
          <button onClick={onOpen} className="rounded-full bg-emerald-400/90 p-2 text-emerald-950 hover:bg-emerald-300">
            <Play className="h-5 w-5" />
          </button>
        </div>
      </div>
    </GlassCard>
  </motion.div>
);

const ToastHost: React.FC<{ toasts: { id: number; text: string }[]; onClose: (id: number) => void }> = ({ toasts, onClose }) => (
  <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/20 px-4 py-3 text-white backdrop-blur-xl shadow-lg">
          <Check className="h-5 w-5 text-emerald-300" />
          <span className="text-sm">{t.text}</span>
          <button onClick={() => onClose(t.id)} className="ml-2 rounded-full bg-white/20 p-1 hover:bg-white/30">
            <X className="h-4 w-4" />
          </button>
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
);

const AgentModal: React.FC<{
  open: boolean;
  onClose: () => void;
  agent?: typeof AGENTS[number] | null;
  onCreateTask: (payload: any) => Promise<string>;
}> = ({ open, onClose, agent, onCreateTask }) => {
  const [taskType, setTaskType] = useState(TASK_TYPES[0]);
  const [connectors, setConnectors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [schedule, setSchedule] = useState("One-off");
  const [notes, setNotes] = useState("");

  React.useEffect(() => {
    if (agent) setConnectors(recommendedConnectors(agent.type, agent.title));
  }, [agent]);

  const toggleConn = (id: string) => setConnectors((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));

  const submit = async () => {
    if (!agent) return;
    setLoading(true);
    try {
      const link = await onCreateTask({ agent, taskType, connectors, schedule, notes });
      setLoading(false);
      onClose();
    } catch (error) {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && agent ? (
        <motion.div className="fixed inset-0 z-50 grid place-items-center p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
          <motion.div layout initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }} className="relative w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 p-6 text-white backdrop-blur-2xl shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-[11px] uppercase tracking-wide text-white/80">{agent.type}</span>
                </div>
                <h2 className="text-2xl font-semibold">{agent.title}</h2>
                <p className="mt-1 max-w-3xl text-white/85">{agent.subtitle}</p>
              </div>
              <button onClick={onClose} className="rounded-full bg-white/15 p-2 hover:bg-white/25">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/80">Task Type</label>
                <div className="relative">
                  <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="w-full appearance-none rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-10 text-white backdrop-blur">
                    {TASK_TYPES.map((t) => (
                      <option key={t} className="bg-slate-900" value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/70" />
                </div>
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-sm text-white/80">Connectors</label>
                <div className="flex flex-wrap gap-2">
                  {CONNECTORS.map((c) => (
                    <button key={c.id} onClick={() => toggleConn(c.id)} className={classNames("rounded-full border px-3 py-1.5 text-sm backdrop-blur transition", connectors.includes(c.id) ? "border-emerald-300/50 bg-emerald-400/20 text-emerald-100" : "border-white/20 bg-white/10 text-white/80 hover:bg-white/15")}>{c.label}</button>
                  ))}
                </div>
              </div>

              <div className="col-span-1">
                <label className="mb-2 block text-sm text-white/80">Schedule</label>
                <div className="grid grid-cols-2 gap-2">
                  {(["One-off", "Daily", "Weekly", "Monthly"] as const).map((s) => (
                    <button key={s} onClick={() => setSchedule(s)} className={classNames("rounded-xl border px-3 py-2 text-sm", schedule === s ? "border-emerald-300/60 bg-emerald-400/20" : "border-white/20 bg-white/10 hover:bg-white/15")}>{s}</button>
                  ))}
                </div>
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-sm text-white/80">Notes / Instructions</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any constraints, data sources, cities, budgets, etc." className="h-28 w-full resize-none rounded-2xl border border-white/20 bg-white/10 p-3 text-white backdrop-blur placeholder:text-white/50" />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-3 text-white/80">
                <Settings2 className="h-4 w-4" />
                <span className="text-sm">This will create a Manus task with the selected connectors.</span>
              </div>
              <button onClick={submit} disabled={loading} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400/90 px-5 py-2.5 font-semibold text-emerald-950 shadow-lg hover:bg-emerald-300 disabled:cursor-not-allowed">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />} Create Task
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};

const TopSearch: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="mx-auto mt-10 max-w-5xl">
    <div className="mx-auto flex w-full items-center gap-3 rounded-3xl border border-white/15 bg-white/10 p-3 backdrop-blur-xl">
      <Search className="mx-2 h-5 w-5 text-white/80" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder="Search agents, e.g. 'venues', 'brand', 'YouTube'" className="flex-1 bg-transparent text-white placeholder:text-white/60 focus:outline-none" />
      <button className="rounded-full bg-white/15 px-3 py-2 text-xs font-semibold text-white/90 hover:bg-white/25">
        <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Recommender</span>
      </button>
    </div>
  </div>
);

const SegmentedFilters: React.FC<{ active: typeof AGENT_TYPES[number]; setActive: (t: typeof AGENT_TYPES[number]) => void }> = ({ active, setActive }) => (
  <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-between gap-3 px-1">
    <div className="flex flex-wrap gap-2">
      {AGENT_TYPES.map((t) => (
        <GlassPill key={t} active={active === t} onClick={() => setActive(t)}>{t}</GlassPill>
      ))}
    </div>
    <div className="flex items-center gap-2 text-white/80">
      <SlidersHorizontal className="h-4 w-4" />
      <span className="text-sm">Glass view</span>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="mx-auto mt-16 max-w-md text-center text-white/80">
    <LayoutGrid className="mx-auto h-10 w-10" />
    <p className="mt-3">No agents match your filters. Try a different search or type.</p>
  </div>
);

function useToastState() {
  const [toasts, setToasts] = React.useState<{ id: number; text: string }[]>([]);
  const push = (text: string) => setToasts((t) => [...t, { id: Date.now(), text }]);
  const remove = (id: number) => setToasts((t) => t.filter((x) => x.id !== id));
  return { toasts, push, remove } as const;
}

export default function GlassmorphismAgentsInterface() {
  const [query, setQuery] = useState("");
  const debounced = useDebounced(query, 200);
  const [active, setActive] = useState<typeof AGENT_TYPES[number]>("All");
  const [selected, setSelected] = useState<typeof AGENTS[number] | null>(null);
  const [open, setOpen] = useState(false);
  const toast = useToastState();
  const { toast: systemToast } = useToast();

  const filtered = useMemo(() => {
    return AGENTS.filter((a) => (active === "All" ? true : a.type === active) && (debounced ? fuzzyIncludes(a.title + " " + a.subtitle, debounced) : true));
  }, [active, debounced]);

  const onCreateTask = async (payload: any) => {
    try {
      const prompt = `Create ${payload.agent.title} task with the following configuration:
      
Task Type: ${payload.taskType}
Schedule: ${payload.schedule}
Connectors: ${payload.connectors.join(', ')}
Notes: ${payload.notes}

${payload.agent.subtitle}`;

      const task = await ManusAPIService.createTask(prompt, {
        mode: 'speed',
        connectors: payload.connectors
      });

      systemToast({
        title: "Task Created Successfully",
        description: `Your ${payload.agent.title} task has been created with ID: ${task.id}`,
      });

      toast.push(`Task created for "${payload.agent.title}".`);
      return task.id;
    } catch (error) {
      systemToast({
        title: "Error",
        description: "Failed to create task. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const openAgent = (agent: typeof AGENTS[number]) => {
    setSelected(agent);
    setOpen(true);
  };

  return (
    <div className="relative min-h-screen bg-slate-950">
      <GradientBackground />

      {/* Header */}
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 pt-8 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur"><Sparkles className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold">Agents Studio</h1>
            <p className="text-sm text-white/70">Glassmorphism dashboard for Manus agents</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-sm hover:bg-white/20">
            <span className="inline-flex items-center gap-2"><Search className="h-4 w-4" /> Search Venues</span>
          </button>
          <button className="rounded-2xl border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-400/30">
            <span className="inline-flex items-center gap-2"><Sparkles className="h-4 w-4" /> AI Recommender</span>
          </button>
        </div>
      </header>

      <TopSearch value={query} onChange={setQuery} />
      <SegmentedFilters active={active} setActive={setActive} />

      {/* Quick actions */}
      <div className="mx-auto mt-10 grid max-w-6xl grid-cols-1 gap-5 px-6 md:grid-cols-3">
        <QuickAction title="Mass Venue Outreach" subtitle="Research venues, generate a booking microsite and Stripe hold link, and send 1:1 emails." onClick={() => toast.push("Preset queued: Mass Venue Outreach")} />
        <QuickAction title="Brand Deals Desk" subtitle="Source sponsors, price packages, negotiate via email, and collect payment." onClick={() => toast.push("Preset queued: Brand Deals Desk")} />
        <QuickAction title="Shorts Factory" subtitle="Daily angles → scripts → auto-assembled verticals with AB testing." onClick={() => toast.push("Preset queued: Shorts Factory")} />
      </div>

      {/* Agents grid */}
      <div className="mx-auto mt-8 max-w-6xl px-6 pb-24">
        {filtered.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a, idx) => (
              <AgentCard key={a.title + idx} agent={a} onOpen={() => openAgent(a)} />
            ))}
          </motion.div>
        )}
      </div>

      <AgentModal open={open} onClose={() => setOpen(false)} agent={selected} onCreateTask={onCreateTask} />
      <ToastHost toasts={toast.toasts} onClose={toast.remove} />

      {/* Footer */}
      <footer className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-32 bg-gradient-to-t from-slate-950 to-transparent" />
    </div>
  );
}