// ─── Model & Runtime ────────────────────────────────────────

export interface ModelSpec {
  name: string;
  family: string;
  variant: string;
  input_size: [number, number];
  num_classes: number;
  description: string;
}

export interface RuntimePreset {
  profile: string;
  family: string;
  variant: string;
  conf: number;
  iou: number;
  max_det: number;
  det_every: number;
  prefilter: boolean;
  prefilter_min_ratio: number;
  min_box_orange_ratio: number;
}

// ─── Follow / Tracking ─────────────────────────────────────

export interface FollowState {
  kp_ang: number;
  kd_ang: number;
  kp_dist: number;
  max_v: number;
  max_w: number;
  deadband_ang_deg: number;
  deadband_dist_m: number;
  slowdown_angle_deg: number;
  active: boolean;
}

// ─── Camera ─────────────────────────────────────────────────

export interface CameraProfile {
  id: string;
  name: string;
  camera_hfov_deg: number;
  camera_fx_px: number;
  camera_fy_px: number;
  camera_width: number;
  camera_height: number;
  buffer_size: number;
  drop_grabs: boolean;
  preset_label?: 'indoor' | 'outdoor' | 'night' | 'backlight';
  created_at: string;
  updated_at: string;
}

// ─── Environment ────────────────────────────────────────────

export interface EnvironmentPreset {
  id: string;
  name: string;
  label: 'day' | 'cloudy' | 'night' | 'rain' | 'indoor_led' | 'backlight';
  description: string;
  conf: number;
  iou: number;
  prefilter: boolean;
  prefilter_min_ratio: number;
  roi: [number, number, number, number]; // x, y, w, h normalized
}

// ─── Session ────────────────────────────────────────────────

export interface SessionSummary {
  id: string;
  camera_profile_id: string;
  camera_name: string;
  started_at: string;
  ended_at: string | null;
  total_detections: number;
  skip_stride: number;
  skip_prefilter: number;
  avg_infer_ms: number;
  avg_pipeline_ms: number;
  status: 'running' | 'completed' | 'error';
}

export interface SessionDetail extends SessionSummary {
  runtime_params: RuntimePreset;
  follow_summary: FollowState;
  events: TelemetryEvent[];
}

// ─── Telemetry ──────────────────────────────────────────────

export interface TelemetryEvent {
  timestamp: number;
  frame_index: number;
  det_count: number;
  avg_infer_ms: number;
  avg_pipeline_ms: number;
  status: string;
  heading_error_deg: number;
  distance_error_ctrl: number;
  v_cmd: number;
  w_cmd: number;
  tracking_quality: number;
}

// ─── Camera Health ──────────────────────────────────────────

export interface CameraHealth {
  id: string;
  name: string;
  online: boolean;
  fps: number;
  latency_ms: number;
  dropped_frames: number;
  resolution: string;
}
