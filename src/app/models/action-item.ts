export class ActionItem {
  name: string;
  icon: string;
  permissions: string | string[];
  action: () => void;
  hidden: () => boolean;
}
