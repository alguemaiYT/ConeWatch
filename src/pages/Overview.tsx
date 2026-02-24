import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Wifi, WifiOff, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { api, MOCK_CAMERAS } from '@/services/api';
import type { CameraHealth, SessionSummary } from '@/types';
import { OnboardingModal } from '@/components/OnboardingModal';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Overview() {
  const [cameras, setCameras] = useState<CameraHealth[]>(MOCK_CAMERAS);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.getCameraHealth().then(setCameras);
    api.getSessions().then(setSessions);
    const seen = localStorage.getItem('cone-onboarding-seen');
    if (!seen) setShowOnboarding(true);
  }, []);

  const onlineCount = cameras.filter(c => c.online).length;
  const runningSession = sessions.find(s => s.status === 'running');

  // Session-level aggregates
  const totalDetections = sessions.reduce((a, s) => a + s.total_detections, 0);
  const avgInfer = sessions.length ? (sessions.reduce((a, s) => a + s.avg_infer_ms, 0) / sessions.length) : 0;
  const avgPipeline = sessions.length ? (sessions.reduce((a, s) => a + s.avg_pipeline_ms, 0) / sessions.length) : 0;

  return (
    <>
      <OnboardingModal open={showOnboarding} onClose={() => { setShowOnboarding(false); localStorage.setItem('cone-onboarding-seen', '1'); }} />

      <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-6">
        {/* Page heading */}
        <motion.div variants={fadeUp}>
          <h1 className="text-2xl font-semibold tracking-tight">Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">System status and recent activity</p>
        </motion.div>

        {/* Camera health cards */}
        <motion.div variants={fadeUp}>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Camera Health</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {cameras.map(cam => (
              <div
                key={cam.id}
                className={`card-industrial rounded-lg p-4 ${cam.online ? 'glow-success' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-card-foreground">{cam.name}</span>
                  {cam.online ? (
                    <Wifi className="h-4 w-4 text-success" />
                  ) : (
                    <WifiOff className="h-4 w-4 text-destructive" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`h-2 w-2 rounded-full ${cam.online ? 'bg-success' : 'bg-destructive'}`} />
                  <span className={`text-xs font-mono ${cam.online ? 'text-success' : 'text-destructive'}`}>
                    {cam.online ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                {cam.online && (
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center">
                    <div>
                      <p className="text-data text-sm text-foreground">{cam.fps.toFixed(1)}</p>
                      <p className="text-[10px] text-muted-foreground">FPS</p>
                    </div>
                    <div>
                      <p className="text-data text-sm text-foreground">{cam.latency_ms}ms</p>
                      <p className="text-[10px] text-muted-foreground">Latency</p>
                    </div>
                    <div>
                      <p className={`text-data text-sm ${cam.dropped_frames > 10 ? 'text-warning' : 'text-foreground'}`}>{cam.dropped_frames}</p>
                      <p className="text-[10px] text-muted-foreground">Dropped</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Session summary cards */}
        <motion.div variants={fadeUp}>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Session Summary</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <SummaryCard label="Total Detections" value={totalDetections.toString()} />
            <SummaryCard label="Avg Infer" value={`${avgInfer.toFixed(1)} ms`} warn={avgInfer > 10} />
            <SummaryCard label="Avg Pipeline" value={`${avgPipeline.toFixed(1)} ms`} warn={avgPipeline > 15} />
            <SummaryCard label="Sessions" value={sessions.length.toString()} />
            <SummaryCard
              label="Active"
              value={runningSession ? '1 Running' : 'None'}
              accent={!!runningSession}
            />
          </div>
        </motion.div>

        {/* Recent sessions table */}
        <motion.div variants={fadeUp}>
          <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Recent Sessions</h2>
          <div className="card-industrial rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">Camera</th>
                    <th className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Detections</th>
                    <th className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider hidden md:table-cell">Infer (ms)</th>
                    <th className="px-4 py-3 text-xs font-mono text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Started</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map(session => (
                    <tr key={session.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-foreground">{session.camera_name}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full ${
                          session.status === 'running'
                            ? 'bg-success/10 text-success'
                            : session.status === 'error'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {session.status === 'running' && <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />}
                          {session.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-data text-muted-foreground hidden sm:table-cell">{session.total_detections}</td>
                      <td className="px-4 py-3 text-data text-muted-foreground hidden md:table-cell">{session.avg_infer_ms.toFixed(1)}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                        {new Date(session.started_at).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => navigate(`/sessions/${session.id}`)}
                          className="text-primary hover:text-primary/80 transition-colors"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>
  );
}

function SummaryCard({ label, value, warn, accent }: { label: string; value: string; warn?: boolean; accent?: boolean }) {
  return (
    <div className={`card-industrial rounded-lg p-4 ${warn ? 'glow-accent' : ''}`}>
      <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
      <p className={`text-data text-xl font-semibold ${warn ? 'text-warning' : accent ? 'text-primary' : 'text-foreground'}`}>{value}</p>
    </div>
  );
}
