import { useState, useEffect, useRef, useCallback } from 'react';
import type { TelemetryEvent } from '@/types';

const BUFFER_SIZE = 40; // ~20 seconds at 2Hz

function generateMockTelemetry(): TelemetryEvent {
  return {
    timestamp: Date.now(),
    frame_index: Math.floor(Math.random() * 100000),
    det_count: Math.floor(Math.random() * 5),
    avg_infer_ms: 6 + Math.random() * 6,
    avg_pipeline_ms: 10 + Math.random() * 8,
    status: Math.random() > 0.05 ? 'ok' : 'drop',
    heading_error_deg: (Math.random() - 0.5) * 30,
    distance_error_ctrl: (Math.random() - 0.5) * 2,
    v_cmd: Math.random() * 0.5,
    w_cmd: (Math.random() - 0.5) * 1.5,
    tracking_quality: 0.6 + Math.random() * 0.4,
  };
}

export function useWebSocketTelemetry(enabled: boolean = true) {
  const [data, setData] = useState<TelemetryEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    if (intervalRef.current) return;
    setConnected(true);
    intervalRef.current = setInterval(() => {
      setData(prev => {
        const next = [...prev, generateMockTelemetry()];
        return next.slice(-BUFFER_SIZE);
      });
    }, 500);
  }, []);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    if (enabled) start();
    return stop;
  }, [enabled, start, stop]);

  const latest = data[data.length - 1] || null;

  return { data, latest, connected, start, stop };
}
