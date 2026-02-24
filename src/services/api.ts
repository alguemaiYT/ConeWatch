import type {
  ModelSpec, CameraProfile, EnvironmentPreset,
  SessionSummary, SessionDetail, RuntimePreset,
  CameraHealth, TelemetryEvent, FollowState,
} from '@/types';

// ─── Delay helper ───────────────────────────────────────────
const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

// ─── Seed data ──────────────────────────────────────────────

export const MOCK_MODELS: ModelSpec[] = [
  { name: 'cone-v4-nano', family: 'YOLOv8', variant: 'nano', input_size: [640, 640], num_classes: 1, description: 'Fastest, for edge devices' },
  { name: 'cone-v4-small', family: 'YOLOv8', variant: 'small', input_size: [640, 640], num_classes: 1, description: 'Balanced speed/accuracy' },
  { name: 'cone-v4-medium', family: 'YOLOv8', variant: 'medium', input_size: [640, 640], num_classes: 1, description: 'Best accuracy, higher latency' },
];

export const MOCK_CAMERAS: CameraHealth[] = [
  { id: 'cam-1', name: 'Front Wide', online: true, fps: 29.97, latency_ms: 12, dropped_frames: 3, resolution: '1920×1080' },
  { id: 'cam-2', name: 'Rear Narrow', online: true, fps: 30.0, latency_ms: 8, dropped_frames: 0, resolution: '1280×720' },
  { id: 'cam-3', name: 'Side Left', online: false, fps: 0, latency_ms: 0, dropped_frames: 0, resolution: '1920×1080' },
  { id: 'cam-4', name: 'Side Right', online: true, fps: 28.5, latency_ms: 18, dropped_frames: 12, resolution: '1280×720' },
];

export const MOCK_CAMERA_PROFILES: CameraProfile[] = [
  { id: 'cp-1', name: 'Default Wide', camera_hfov_deg: 90, camera_fx_px: 600, camera_fy_px: 600, camera_width: 1920, camera_height: 1080, buffer_size: 4, drop_grabs: false, preset_label: 'outdoor', created_at: '2025-01-15T10:00:00Z', updated_at: '2025-02-20T14:30:00Z' },
  { id: 'cp-2', name: 'Night Mode', camera_hfov_deg: 60, camera_fx_px: 800, camera_fy_px: 800, camera_width: 1280, camera_height: 720, buffer_size: 2, drop_grabs: true, preset_label: 'night', created_at: '2025-01-20T08:00:00Z', updated_at: '2025-02-18T11:00:00Z' },
  { id: 'cp-3', name: 'Indoor Lab', camera_hfov_deg: 75, camera_fx_px: 700, camera_fy_px: 700, camera_width: 1920, camera_height: 1080, buffer_size: 8, drop_grabs: false, preset_label: 'indoor', created_at: '2025-02-01T09:00:00Z', updated_at: '2025-02-22T16:00:00Z' },
];

export const MOCK_ENV_PRESETS: EnvironmentPreset[] = [
  { id: 'env-1', name: 'Bright Daylight', label: 'day', description: 'Clear outdoor conditions with good visibility. High confidence thresholds work well.', conf: 0.45, iou: 0.5, prefilter: true, prefilter_min_ratio: 0.05, roi: [0, 0, 1, 1] },
  { id: 'env-2', name: 'Overcast / Cloudy', label: 'cloudy', description: 'Reduced contrast. Slightly lower confidence to catch muted cone colors.', conf: 0.35, iou: 0.45, prefilter: true, prefilter_min_ratio: 0.04, roi: [0, 0, 1, 1] },
  { id: 'env-3', name: 'Night / Low Light', label: 'night', description: 'Very low light. Prefilter disabled, lower confidence. Expect more false positives.', conf: 0.25, iou: 0.4, prefilter: false, prefilter_min_ratio: 0.02, roi: [0.1, 0.2, 0.8, 0.6] },
  { id: 'env-4', name: 'Rain', label: 'rain', description: 'Water droplets on lens reduce clarity. Tighter ROI avoids edge artifacts.', conf: 0.3, iou: 0.4, prefilter: true, prefilter_min_ratio: 0.03, roi: [0.05, 0.1, 0.9, 0.8] },
  { id: 'env-5', name: 'Indoor LED', label: 'indoor_led', description: 'Artificial indoor lighting with potential flicker. Good contrast for detection.', conf: 0.4, iou: 0.5, prefilter: true, prefilter_min_ratio: 0.06, roi: [0, 0, 1, 1] },
  { id: 'env-6', name: 'Strong Backlight', label: 'backlight', description: 'Harsh backlight silhouettes cones. Lower thresholds and prefilter needed.', conf: 0.2, iou: 0.35, prefilter: false, prefilter_min_ratio: 0.02, roi: [0.1, 0.15, 0.8, 0.7] },
];

const now = Date.now();
export const MOCK_SESSIONS: SessionSummary[] = [
  { id: 'sess-1', camera_profile_id: 'cp-1', camera_name: 'Front Wide', started_at: new Date(now - 3600000).toISOString(), ended_at: new Date(now - 1800000).toISOString(), total_detections: 247, skip_stride: 12, skip_prefilter: 34, avg_infer_ms: 8.3, avg_pipeline_ms: 14.7, status: 'completed' },
  { id: 'sess-2', camera_profile_id: 'cp-2', camera_name: 'Rear Narrow', started_at: new Date(now - 7200000).toISOString(), ended_at: new Date(now - 5400000).toISOString(), total_detections: 89, skip_stride: 5, skip_prefilter: 11, avg_infer_ms: 6.1, avg_pipeline_ms: 11.2, status: 'completed' },
  { id: 'sess-3', camera_profile_id: 'cp-1', camera_name: 'Front Wide', started_at: new Date(now - 600000).toISOString(), ended_at: null, total_detections: 53, skip_stride: 2, skip_prefilter: 8, avg_infer_ms: 9.1, avg_pipeline_ms: 16.3, status: 'running' },
  { id: 'sess-4', camera_profile_id: 'cp-3', camera_name: 'Indoor Lab', started_at: new Date(now - 86400000).toISOString(), ended_at: new Date(now - 82800000).toISOString(), total_detections: 412, skip_stride: 20, skip_prefilter: 67, avg_infer_ms: 7.8, avg_pipeline_ms: 13.9, status: 'completed' },
];

function generateTelemetry(count: number): TelemetryEvent[] {
  const events: TelemetryEvent[] = [];
  const base = Date.now() - count * 500;
  for (let i = 0; i < count; i++) {
    events.push({
      timestamp: base + i * 500,
      frame_index: i * 15,
      det_count: Math.floor(Math.random() * 5),
      avg_infer_ms: 6 + Math.random() * 6,
      avg_pipeline_ms: 10 + Math.random() * 8,
      status: Math.random() > 0.05 ? 'ok' : 'drop',
      heading_error_deg: (Math.random() - 0.5) * 30,
      distance_error_ctrl: (Math.random() - 0.5) * 2,
      v_cmd: Math.random() * 0.5,
      w_cmd: (Math.random() - 0.5) * 1.5,
      tracking_quality: 0.6 + Math.random() * 0.4,
    });
  }
  return events;
}

// ─── API stubs ──────────────────────────────────────────────

export const api = {
  getModels: async (): Promise<ModelSpec[]> => {
    await delay(200);
    return MOCK_MODELS;
  },

  getCameraProfiles: async (): Promise<CameraProfile[]> => {
    await delay(200);
    return [...MOCK_CAMERA_PROFILES];
  },

  createCameraProfile: async (profile: Omit<CameraProfile, 'id' | 'created_at' | 'updated_at'>): Promise<CameraProfile> => {
    await delay(300);
    const newProfile: CameraProfile = {
      ...profile,
      id: `cp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    MOCK_CAMERA_PROFILES.push(newProfile);
    return newProfile;
  },

  updateCameraProfile: async (id: string, updates: Partial<CameraProfile>): Promise<CameraProfile> => {
    await delay(300);
    const idx = MOCK_CAMERA_PROFILES.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Profile not found');
    MOCK_CAMERA_PROFILES[idx] = { ...MOCK_CAMERA_PROFILES[idx], ...updates, updated_at: new Date().toISOString() };
    return MOCK_CAMERA_PROFILES[idx];
  },

  deleteCameraProfile: async (id: string): Promise<void> => {
    await delay(200);
    const idx = MOCK_CAMERA_PROFILES.findIndex(p => p.id === id);
    if (idx !== -1) MOCK_CAMERA_PROFILES.splice(idx, 1);
  },

  getEnvironmentPresets: async (): Promise<EnvironmentPreset[]> => {
    await delay(200);
    return [...MOCK_ENV_PRESETS];
  },

  createEnvironmentPreset: async (preset: Omit<EnvironmentPreset, 'id'>): Promise<EnvironmentPreset> => {
    await delay(300);
    const newPreset: EnvironmentPreset = { ...preset, id: `env-${Date.now()}` };
    MOCK_ENV_PRESETS.push(newPreset);
    return newPreset;
  },

  updateEnvironmentPreset: async (id: string, updates: Partial<EnvironmentPreset>): Promise<EnvironmentPreset> => {
    await delay(300);
    const idx = MOCK_ENV_PRESETS.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Preset not found');
    MOCK_ENV_PRESETS[idx] = { ...MOCK_ENV_PRESETS[idx], ...updates };
    return MOCK_ENV_PRESETS[idx];
  },

  deleteEnvironmentPreset: async (id: string): Promise<void> => {
    await delay(200);
    const idx = MOCK_ENV_PRESETS.findIndex(p => p.id === id);
    if (idx !== -1) MOCK_ENV_PRESETS.splice(idx, 1);
  },

  updateRuntime: async (params: Partial<RuntimePreset>): Promise<{ ok: boolean }> => {
    await delay(150);
    console.log('Runtime updated:', params);
    return { ok: true };
  },

  startSession: async (cameraProfileId: string): Promise<SessionSummary> => {
    await delay(300);
    const session: SessionSummary = {
      id: `sess-${Date.now()}`,
      camera_profile_id: cameraProfileId,
      camera_name: MOCK_CAMERA_PROFILES.find(p => p.id === cameraProfileId)?.name || 'Unknown',
      started_at: new Date().toISOString(),
      ended_at: null,
      total_detections: 0,
      skip_stride: 0,
      skip_prefilter: 0,
      avg_infer_ms: 0,
      avg_pipeline_ms: 0,
      status: 'running',
    };
    MOCK_SESSIONS.unshift(session);
    return session;
  },

  stopSession: async (id: string): Promise<SessionSummary> => {
    await delay(200);
    const idx = MOCK_SESSIONS.findIndex(s => s.id === id);
    if (idx !== -1) {
      MOCK_SESSIONS[idx].ended_at = new Date().toISOString();
      MOCK_SESSIONS[idx].status = 'completed';
    }
    return MOCK_SESSIONS[idx];
  },

  getSessions: async (): Promise<SessionSummary[]> => {
    await delay(200);
    return [...MOCK_SESSIONS];
  },

  getSession: async (id: string): Promise<SessionDetail> => {
    await delay(300);
    const summary = MOCK_SESSIONS.find(s => s.id === id);
    if (!summary) throw new Error('Session not found');
    return {
      ...summary,
      runtime_params: {
        profile: 'cone-v4-small', family: 'YOLOv8', variant: 'small',
        conf: 0.4, iou: 0.5, max_det: 20, det_every: 1,
        prefilter: true, prefilter_min_ratio: 0.05, min_box_orange_ratio: 0.3,
      },
      follow_summary: {
        kp_ang: 1.2, kd_ang: 0.1, kp_dist: 0.8, max_v: 0.5, max_w: 1.5,
        deadband_ang_deg: 3, deadband_dist_m: 0.1, slowdown_angle_deg: 15, active: true,
      },
      events: generateTelemetry(60),
    };
  },

  getCameraHealth: async (): Promise<CameraHealth[]> => {
    await delay(200);
    return [...MOCK_CAMERAS];
  },
};
