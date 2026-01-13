
export interface BoundingBox {
  ymin: number;
  xmin: number;
  ymax: number;
  xmax: number;
}

export type ItemCategory = 'main' | 'detail';

export interface FashionItem {
  id: string;
  name: string;
  confidence: number;
  box: BoundingBox;
  color: string;
  pattern?: string; // 'none', 'stripes', 'plaid', 'dots', 'floral', 'ribbed'
  category: ItemCategory;
  originalColor?: string;
  settings: {
    saturation: number;
    brightness: number;
    contrast: number;
  };
  isVisible: boolean;
}

export interface GlobalSettings {
  brightness: number;
  contrast: number;
  saturation: number;
  sharpness: number;
}

export interface AppState {
  image: string | null;
  items: FashionItem[];
  selectedIndices: number[];
  isProcessing: boolean;
  history: FashionItem[][];
  historyIndex: number;
  showMasks: boolean;
  globalSettings: GlobalSettings;
}

export enum ProcessStatus {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  DETECTING = 'DETECTING',
  RECOLORING = 'RECOLORING',
  ERROR = 'ERROR'
}
