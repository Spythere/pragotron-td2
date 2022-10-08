export interface ISceneryResponse {
  id: string;
  name: string;
  SUP: boolean;
  authors: string;
  availability: string;
  backupJSON: string;
  checkpoints: string;
  controlType: string;
  lines: string;
  project: string;
  reqLevel: number;
  routes: string;
  signalType: string;
  supportersOnly?: boolean;
  url: string;
}
