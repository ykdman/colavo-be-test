export interface Workhour {
  close_interval: number;
  is_day_off: boolean;
  key: string;
  open_interval: number;
  weekday: number;
}

export interface Event {
  begin_at: number;
  end_at: number;
  created_at: number;
  updated_at: number;
}
