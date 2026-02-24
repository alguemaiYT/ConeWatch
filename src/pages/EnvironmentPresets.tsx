import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, X, Info } from 'lucide-react';
import { api } from '@/services/api';
import type { EnvironmentPreset } from '@/types';
import { toast } from '@/hooks/use-toast';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const LABEL_COLORS: Record<string, string> = {
  day: 'bg-warning/10 text-warning',
  cloudy: 'bg-muted text-muted-foreground',
  night: 'bg-primary/10 text-primary',
  rain: 'bg-primary/15 text-primary',
  indoor_led: 'bg-success/10 text-success',
  backlight: 'bg-destructive/10 text-destructive',
};

export default function EnvironmentPresets() {
  const [presets, setPresets] = useState<EnvironmentPreset[]>([]);
  const [editing, setEditing] = useState<Partial<EnvironmentPreset> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => api.getEnvironmentPresets().then(setPresets);
  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing({ name: '', label: 'day', description: '', conf: 0.4, iou: 0.5, prefilter: true, prefilter_min_ratio: 0.05, roi: [0, 0, 1, 1] });
    setIsNew(true);
  };

  const save = async () => {
    if (!editing?.name?.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    if (isNew) {
      await api.createEnvironmentPreset(editing as any);
      toast({ title: 'Preset created' });
    } else {
      await api.updateEnvironmentPreset(editing!.id!, editing);
      toast({ title: 'Preset updated' });
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await api.deleteEnvironmentPreset(id);
    toast({ title: 'Preset deleted' });
    load();
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Environment Presets</h1>
          <p className="text-sm text-muted-foreground mt-1">Optimized detection settings per lighting condition</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Preset
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {presets.map(p => (
          <div key={p.id} className="card-industrial rounded-lg p-4 group">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-medium text-foreground">{p.name}</h3>
                <span className={`text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded mt-1 inline-block ${LABEL_COLORS[p.label] || ''}`}>
                  {p.label.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditing({ ...p }); setIsNew(false); }} className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => remove(p.id)} className="p-1 rounded text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{p.description}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <div><span className="text-muted-foreground/60 font-mono text-[10px]">CONF</span><p className="text-data text-foreground">{p.conf}</p></div>
              <div><span className="text-muted-foreground/60 font-mono text-[10px]">IOU</span><p className="text-data text-foreground">{p.iou}</p></div>
              <div><span className="text-muted-foreground/60 font-mono text-[10px]">PREFILTER</span><p className="text-data text-foreground">{p.prefilter ? 'ON' : 'OFF'}</p></div>
              <div><span className="text-muted-foreground/60 font-mono text-[10px]">MIN RATIO</span><p className="text-data text-foreground">{p.prefilter_min_ratio}</p></div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Edit/create modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setEditing(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-elevated rounded-lg p-6 w-full max-w-lg mx-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{isNew ? 'New Preset' : 'Edit Preset'}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Name</label>
                <input value={editing.name || ''} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-1.5 rounded-md bg-input border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
              </div>
              <div>
                <label className="text-xs font-mono text-muted-foreground block mb-1">Description</label>
                <textarea value={editing.description || ''} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-md bg-input border border-border text-foreground text-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">Confidence</label>
                  <input type="number" step="0.05" min="0.05" max="0.95" value={editing.conf ?? 0.4}
                    onChange={e => setEditing(p => ({ ...p, conf: +e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-md bg-input border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
                <div>
                  <label className="text-xs font-mono text-muted-foreground block mb-1">IOU</label>
                  <input type="number" step="0.05" min="0.1" max="0.9" value={editing.iou ?? 0.5}
                    onChange={e => setEditing(p => ({ ...p, iou: +e.target.value }))}
                    className="w-full px-3 py-1.5 rounded-md bg-input border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring" />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-5">
              <button onClick={() => setEditing(null)} className="px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors">Cancel</button>
              <button onClick={save} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Save</button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
