/**
 * Type of captured content
 */
export type CaptureType = 'url' | 'text';

/**
 * A single captured item
 */
export interface Capture {
  /** The captured content (URL or text) */
  content: string;
  /** Type of the content */
  type: CaptureType;
  /** Optional note/context for the capture */
  note: string | null;
  /** Time of capture in HH:mm:ss format */
  time: string;
}

/**
 * Daily captures file structure
 */
export interface DailyCaptures {
  date: string;
  captures: Capture[];
}
