import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Clock } from 'lucide-react';
import { api } from '@/services/api';
import type { SessionDetail as SessionDetailType } from '@/types';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

export default function SessionDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [session, setSession] = useState<SessionDetailType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.getSession(id).then(s => { setSession(s); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm font-mono">Loading session…</div>;
  }

  if (!session) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Session not found</div>;
  }

  const downloadStub = (format: string) => {
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.id}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Session {session.id}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{session.camera_name} · {new Date(session.started_at).toLocaleString()}</p>
        </div>
      </motion.div>

      {/* Summary stats */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Detections" value={session.total_detections.toString()} />
        <StatCard label="Avg Infer" value={`${session.avg_infer_ms.toFixed(1)} ms`} />
        <StatCard label="Avg Pipeline" value={`${session.avg_pipeline_ms.toFixed(1)} ms`} />
        <StatCard label="Status" value={session.status.toUpperCase()} accent={session.status === 'running'} />
      </motion.div>

      {/* Timeline */}
      <motion.div variants={fadeUp}>
        <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Event Timeline</h2>
        <div className="card-industrial rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
          {session.events.slice(-30).map((ev, i) => (
            <div key={i} className="flex items-start gap-3 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
              <span className="text-data text-muted-foreground w-20 shrink-0">
                {new Date(ev.timestamp).toLocaleTimeString()}
              </span>
              <span className={`text-data ${ev.status === 'ok' ? 'text-foreground' : 'text-warning'}`}>
                frame {ev.frame_index} · {ev.det_count} det · {ev.avg_infer_ms.toFixed(1)}ms · quality {ev.tracking_quality.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* JSON previews */}
      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Runtime Params</h2>
          <pre className="card-industrial rounded-lg p-4 text-xs text-data text-foreground overflow-x-auto max-h-64">
            {JSON.stringify(session.runtime_params, null, 2)}
          </pre>
        </div>
        <div>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Follow Summary</h2>
          <pre className="card-industrial rounded-lg p-4 text-xs text-data text-foreground overflow-x-auto max-h-64">
            {JSON.stringify(session.follow_summary, null, 2)}
          </pre>
        </div>
      </motion.div>

      {/* Downloads */}
      <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
        <button onClick={() => downloadStub('json')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors">
          <Download className="h-4 w-4" /> Download JSON
        </button>
        <button onClick={() => downloadStub('jsonl')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors">
          <Download className="h-4 w-4" /> Download JSONL
        </button>
        <button onClick={() => downloadStub('txt')} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground text-sm hover:bg-secondary/80 transition-colors">
          <Download className="h-4 w-4" /> Download TXT
        </button>
      </motion.div>
    </motion.div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="card-industrial rounded-lg p-4">
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={`text-data text-xl font-semibold ${accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
