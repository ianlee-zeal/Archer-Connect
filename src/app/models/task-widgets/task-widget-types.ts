export type TeamStats = {
  id: number;
  name: string;
  color: string;
  label: string;
  valueColor?: string;
};

export type OverdueGroup = {
  entityId:number;
  text:string;
  count:number;
  percent:number;
};

export type OverdueTaskStats = {
  title: string;
  count: number;
  percent: number;
  color: string;
};

export type AgingTaskStats = {
  title: string;
  total: number | string;
  high: number | string;
  medium: number | string;
  low: number | string;
  color: string;
};

export type Stages = {
  count: number;
  entityId?: number;
  entityType?: number;
  percent: number;
  text: string;
};

export type TableItem = {
  value: string | number;
  color: string;
};
