import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Copy, FlaskConical, Pencil, Trash2, X } from 'lucide-react';
import { api } from '@/services/api';
import type { CameraProfile } from '@/types';
import { toast } from '@/hooks/use-toast';

const fadeUp = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };
const LABELS = ['indoor', 'outdoor', 'night', 'backlight'] as const;

const emptyProfile: Omit<CameraProfile, 'id' | 'created_at' | 'updated_at'> = {
  name: '', camera_hfov_deg: 90, camera_fx_px: 600, camera_fy_px: 600,
  camera_width: 1920, camera_height: 1080, buffer_size: 4, drop_grabs: false,
};

export default function CameraProfiles() {
  const [profiles, setProfiles] = useState<CameraProfile[]>([]);
  const [editing, setEditing] = useState<Partial<CameraProfile> | null>(null);
  const [isNew, setIsNew] = useState(false);

  const load = () => api.getCameraProfiles().then(setProfiles);
  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing({ ...emptyProfile }); setIsNew(true); };
  const openEdit = (p: CameraProfile) => { setEditing({ ...p }); setIsNew(false); };
  const duplicate = (p: CameraProfile) => {
    setEditing({ ...p, name: `${p.name} (copy)`, id: undefined });
    setIsNew(true);
  };

  const save = async () => {
    if (!editing?.name?.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    if (isNew) {
      await api.createCameraProfile(editing as any);
      toast({ title: 'Profile created' });
    } else {
      await api.updateCameraProfile(editing!.id!, editing);
      toast({ title: 'Profile updated' });
    }
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    await api.deleteCameraProfile(id);
    toast({ title: 'Profile deleted' });
    load();
  };

  const testProfile = (name: string) => {
    toast({ title: `Testing "${name}"…`, description: 'Simulated test pass ✓' });
  };

  return (
    <motion.div initial="hidden" animate="show" variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }} className="space-y-6">
      <motion.div variants={fadeUp} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Camera Profiles</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage camera configurations</p>
        </div>
        <button onClick={openNew} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> New Profile
        </button>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map(p => (
          <div key={p.id} className="card-industrial rounded-lg p-4 group">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="font-medium text-foreground">{p.name}</h3>
                {p.preset_label && (
                  <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded bg-primary/10 text-primary mt-1 inline-block">
                    {p.preset_label}
                  </span>
                )}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <IconBtn icon={Pencil} onClick={() => openEdit(p)} title="Edit" />
                <IconBtn icon={Copy} onClick={() => duplicate(p)} title="Duplicate" />
                <IconBtn icon={FlaskConical} onClick={() => testProfile(p.name)} title="Test" />
                <IconBtn icon={Trash2} onClick={() => remove(p.id)} title="Delete" className="hover:text-destructive" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
              <Field label="HFOV" value={`${p.camera_hfov_deg}°`} />
              <Field label="Resolution" value={`${p.camera_width}×${p.camera_height}`} />
              <Field label="fx / fy" value={`${p.camera_fx_px} / ${p.camera_fy_px}`} />
              <Field label="Buffer" value={`${p.buffer_size}`} />
              <Field label="Drop grabs" value={p.drop_grabs ? 'Yes' : 'No'} />
            </div>
            <p className="text-[10px] text-muted-foreground/50 mt-3">Updated {new Date(p.updated_at).toLocaleDateString()}</p>
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
              <h2 className="text-lg font-semibold">{isNew ? 'New Profile' : 'Edit Profile'}</h2>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-foreground"><X className="h-5 w-5" /></button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InputField label="Name" value={editing.name || ''} onChange={v => setEditing(p => ({ ...p, name: v }))} span={2} />
              <InputField label="HFOV (°)" value={editing.camera_hfov_deg} type="number" onChange={v => setEditing(p => ({ ...p, camera_hfov_deg: +v }))} />
              <InputField label="Width" value={editing.camera_width} type="number" onChange={v => setEditing(p => ({ ...p, camera_width: +v }))} />
              <InputField label="Height" value={editing.camera_height} type="number" onChange={v => setEditing(p => ({ ...p, camera_height: +v }))} />
              <InputField label="fx (px)" value={editing.camera_fx_px} type="number" onChange={v => setEditing(p => ({ ...p, camera_fx_px: +v }))} />
              <InputField label="fy (px)" value={editing.camera_fy_px} type="number" onChange={v => setEditing(p => ({ ...p, camera_fy_px: +v }))} />
              <InputField label="Buffer Size" value={editing.buffer_size} type="number" onChange={v => setEditing(p => ({ ...p, buffer_size: +v }))} />
              <div className="col-span-2">
                <label className="text-xs font-mono text-muted-foreground block mb-1">Preset Label</label>
                <div className="flex gap-2 flex-wrap">
                  {LABELS.map(l => (
                    <button
                      key={l}
                      onClick={() => setEditing(p => ({ ...p, preset_label: p?.preset_label === l ? undefined : l }))}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                        editing.preset_label === l
                          ? 'bg-primary/15 text-primary border border-primary/30'
                          : 'bg-muted text-muted-foreground border border-transparent hover:border-border'
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div className="col-span-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editing.drop_grabs || false}
                  onChange={e => setEditing(p => ({ ...p, drop_grabs: e.target.checked }))}
                  className="accent-primary"
                />
                <span className="text-xs font-mono text-muted-foreground">Drop grabs</span>
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

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-muted-foreground/60 font-mono text-[10px] uppercase">{label}</span>
      <p className="text-data text-foreground">{value}</p>
    </div>
  );
}

function IconBtn({ icon: Icon, onClick, title, className }: { icon: any; onClick: () => void; title: string; className?: string }) {
  return (
    <button onClick={onClick} title={title} className={`p-1 rounded text-muted-foreground hover:text-foreground transition-colors ${className || ''}`}>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

function InputField({ label, value, onChange, type, span }: { label: string; value: any; onChange: (v: string) => void; type?: string; span?: number }) {
  return (
    <div className={span === 2 ? 'col-span-2' : ''}>
      <label className="text-xs font-mono text-muted-foreground block mb-1">{label}</label>
      <input
        type={type || 'text'}
        value={value ?? ''}
        onChange={e => onChange(e.target.value)}
        className="w-full px-3 py-1.5 rounded-md bg-input border border-border text-foreground text-sm font-mono focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}
