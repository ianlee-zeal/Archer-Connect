export interface ExpansionBarElement {
  valueGetter: () => string | number;
  width?: string;
  minWidth?: string;
  tooltip?: string;
  className?: string;
  isRightAligned?: boolean;
}
