import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Square, Eye, Target, Crosshair, Navigation, PanelRight,
  RotateCcw,
} from 'lucide-react';
import { useWebSocketTelemetry } from '@/hooks/useWebSocket';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const DEFAULT_RUNTIME = {
  conf: 0.4, iou: 0.5, max_det: 20, det_every: 1,
  prefilter: true, prefilter_min_ratio: 0.05, min_box_orange_ratio: 0.3,
};

const DEFAULT_FOLLOW = {
  kp_ang: 1.2, kd_ang: 0.1, kp_dist: 0.8, max_v: 0.5, max_w: 1.5,
  deadband_ang_deg: 3, deadband_dist_m: 0.1, slowdown_angle_deg: 15,
};

export default function LiveDebug() {
  const { data: telemetry, connected } = useWebSocketTelemetry(true);

  const [overlays, setOverlays] = useState({
    boxes: true, confidence: true, orangeRatio: false,
    roi: false, reticle: true, followPanel: false,
  });

  const [runtime, setRuntime] = useState(DEFAULT_RUNTIME);
  const [follow, setFollow] = useState(DEFAULT_FOLLOW);

  const toggleOverlay = (key: keyof typeof overlays) =>
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }));

  const chartData = telemetry.slice(-20).map((t, i) => ({
    i,
    heading: t.heading_error_deg,
    distance: t.distance_error_ctrl,
    v: t.v_cmd,
    w: t.w_cmd,
    quality: t.tracking_quality,
  }));

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.06 } } }} className="space-y-4">
      <motion.div variants={fadeUp}>
        <h1 className="text-2xl font-semibold tracking-tight">Live Debug</h1>
        <div className="flex items-center gap-2 mt-1">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-success animate-pulse-glow' : 'bg-destructive'}`} />
          <span className="text-xs font-mono text-muted-foreground">{connected ? 'Telemetry connected' : 'Disconnected'}</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-4">
        {/* Left column: Video + Charts */}
        <div className="space-y-4">
          {/* Video placeholder */}
          <motion.div variants={fadeUp} className="card-industrial rounded-lg overflow-hidden">
            <div className="relative aspect-video bg-muted/30 flex items-center justify-center scanline">
              <div className="text-center">
                <div className="h-16 w-16 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center mb-3">
                  <Eye className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">Video feed placeholder</p>
                <p className="text-xs text-muted-foreground/50 mt-1">Connect camera to start streaming</p>
              </div>
              {/* Overlay toggles */}
              {overlays.reticle && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Crosshair className="h-12 w-12 text-primary/30" />
                </div>
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-border flex flex-wrap gap-2">
              {([
                ['boxes', Square, 'Boxes'],
                ['confidence', Eye, 'Conf'],
                ['orangeRatio', Target, 'Orange'],
                ['roi', PanelRight, 'ROI'],
                ['reticle', Crosshair, 'Reticle'],
                ['followPanel', Navigation, 'Follow'],
              ] as const).map(([key, Icon, label]) => (
                <button
                  key={key}
                  onClick={() => toggleOverlay(key as keyof typeof overlays)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    overlays[key as keyof typeof overlays]
                      ? 'bg-primary/15 text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground border border-transparent hover:border-border'
                  }`}
                >
                  <Icon className="h-3 w-3" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Telemetry charts */}
          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <MiniChart title="Heading Error (°)" data={chartData} dataKey="heading" color="hsl(210, 100%, 55%)" />
            <MiniChart title="Distance Error" data={chartData} dataKey="distance" color="hsl(38, 95%, 55%)" />
            <MiniChart title="v_cmd / w_cmd" data={chartData} dataKey="v" color="hsl(142, 70%, 45%)" secondKey="w" secondColor="hsl(0, 72%, 51%)" />
            <MiniChart title="Tracking Quality" data={chartData} dataKey="quality" color="hsl(210, 100%, 55%)" domain={[0, 1]} />
          </motion.div>
        </div>

        {/* Right column: Tuning panels */}
        <div className="space-y-4">
          <motion.div variants={fadeUp} className="card-industrial rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Detection Tuning</h3>
              <button
                onClick={() => setRuntime(DEFAULT_RUNTIME)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
            <div className="space-y-3">
              <SliderField label="conf" value={runtime.conf} min={0.05} max={0.95} step={0.05} warn={runtime.conf < 0.2} onChange={v => setRuntime(p => ({ ...p, conf: v }))} />
              <SliderField label="iou" value={runtime.iou} min={0.1} max={0.9} step={0.05} onChange={v => setRuntime(p => ({ ...p, iou: v }))} />
              <SliderField label="max_det" value={runtime.max_det} min={1} max={100} step={1} onChange={v => setRuntime(p => ({ ...p, max_det: v }))} />
              <SliderField label="det_every" value={runtime.det_every} min={1} max={30} step={1} warn={runtime.det_every > 10} onChange={v => setRuntime(p => ({ ...p, det_every: v }))} />
              <SliderField label="prefilter_min_ratio" value={runtime.prefilter_min_ratio} min={0} max={0.2} step={0.01} onChange={v => setRuntime(p => ({ ...p, prefilter_min_ratio: v }))} />
              <SliderField label="min_box_orange_ratio" value={runtime.min_box_orange_ratio} min={0} max={1} step={0.05} onChange={v => setRuntime(p => ({ ...p, min_box_orange_ratio: v }))} />
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-muted-foreground">prefilter</span>
                <button
                  onClick={() => setRuntime(p => ({ ...p, prefilter: !p.prefilter }))}
                  className={`h-5 w-9 rounded-full transition-colors ${runtime.prefilter ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`block h-4 w-4 rounded-full bg-foreground transition-transform ${runtime.prefilter ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} className="card-industrial rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Follow Gains</h3>
              <button
                onClick={() => setFollow(DEFAULT_FOLLOW)}
                className="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
            <div className="space-y-3">
              <SliderField label="kp_ang" value={follow.kp_ang} min={0} max={5} step={0.1} onChange={v => setFollow(p => ({ ...p, kp_ang: v }))} />
              <SliderField label="kd_ang" value={follow.kd_ang} min={0} max={1} step={0.01} onChange={v => setFollow(p => ({ ...p, kd_ang: v }))} />
              <SliderField label="kp_dist" value={follow.kp_dist} min={0} max={3} step={0.1} onChange={v => setFollow(p => ({ ...p, kp_dist: v }))} />
              <SliderField label="max_v" value={follow.max_v} min={0} max={2} step={0.1} onChange={v => setFollow(p => ({ ...p, max_v: v }))} />
              <SliderField label="max_w" value={follow.max_w} min={0} max={5} step={0.1} onChange={v => setFollow(p => ({ ...p, max_w: v }))} />
              <SliderField label="deadband_ang" value={follow.deadband_ang_deg} min={0} max={15} step={0.5} unit="°" onChange={v => setFollow(p => ({ ...p, deadband_ang_deg: v }))} />
              <SliderField label="deadband_dist" value={follow.deadband_dist_m} min={0} max={1} step={0.01} unit="m" onChange={v => setFollow(p => ({ ...p, deadband_dist_m: v }))} />
              <SliderField label="slowdown_angle" value={follow.slowdown_angle_deg} min={0} max={45} step={1} unit="°" onChange={v => setFollow(p => ({ ...p, slowdown_angle_deg: v }))} />
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function SliderField({
  label, value, min, max, step, unit, warn, onChange,
}: {
  label: string; value: number; min: number; max: number; step: number;
  unit?: string; warn?: boolean; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
        <span className={`text-data text-xs ${warn ? 'text-warning' : 'text-foreground'}`}>
          {value.toFixed(step < 1 ? 2 : 0)}{unit || ''}
          {warn && <span className="ml-1 text-warning">⚠</span>}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none bg-muted cursor-pointer accent-primary"
      />
      <div className="flex justify-between text-[9px] text-muted-foreground/50 font-mono mt-0.5">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function MiniChart({
  title, data, dataKey, color, secondKey, secondColor, domain,
}: {
  title: string; data: any[]; dataKey: string; color: string;
  secondKey?: string; secondColor?: string; domain?: [number, number];
}) {
  return (
    <div className="card-industrial rounded-lg p-3">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{title}</h4>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis hide />
            <YAxis hide domain={domain || ['auto', 'auto']} />
            <Tooltip
              contentStyle={{
                background: 'hsl(220, 20%, 9%)',
                border: '1px solid hsl(220, 15%, 18%)',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'JetBrains Mono',
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} />
            {secondKey && (
              <Line type="monotone" dataKey={secondKey} stroke={secondColor} strokeWidth={1.5} dot={false} />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
