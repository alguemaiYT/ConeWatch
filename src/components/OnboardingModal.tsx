import { motion } from 'framer-motion';
import { Camera, ChevronRight, Settings, Layers } from 'lucide-react';

interface OnboardingModalProps {
  open: boolean;
  onClose: () => void;
}

export function OnboardingModal({ open, onClose }: OnboardingModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-elevated rounded-xl p-8 w-full max-w-md mx-4"
      >
        <div className="text-center mb-6">
          <div className="h-14 w-14 mx-auto rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center mb-4">
            <span className="text-primary font-mono font-bold text-xl">CD</span>
          </div>
          <h2 className="text-xl font-semibold text-foreground">Welcome to Cone Detector v4</h2>
          <p className="text-sm text-muted-foreground mt-2">Let's get your detection system up and running.</p>
        </div>

        <div className="space-y-3 mb-6">
          <Step icon={Camera} number={1} title="Set up a Camera Profile" description="Configure your camera's optics and capture parameters." />
          <Step icon={Layers} number={2} title="Choose an Environment" description="Select a preset that matches your lighting conditions." />
          <Step icon={Settings} number={3} title="Tune & Detect" description="Open Live Debug to calibrate thresholds and start detecting cones." />
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-md bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          Get Started <ChevronRight className="h-4 w-4" />
        </button>
      </motion.div>
    </div>
  );
}

function Step({ icon: Icon, number, title, description }: { icon: any; number: number; title: string; description: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
      <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">
          <span className="text-muted-foreground mr-1.5">{number}.</span>{title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  );
}
