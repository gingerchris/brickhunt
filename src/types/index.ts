export interface Part {
  part_num: string;
  name: string;
  part_cat_id: number;
  part_url: string;
  part_img_url: string;
  external_ids: {
    BrickLink?: string[];
    BrickOwl?: string[];
    Brickset?: string[];
    LDraw?: string[];
    LEGO?: string[];
  };
}

export interface SetPart {
  id: number;
  inv_part_id: number;
  part: Part;
  color: Color;
  set_num: string;
  quantity: number;
  is_spare: boolean;
  element_id: string;
  num_sets: number;
}

export interface Color {
  id: number;
  name: string;
  rgb: string;
  is_trans: boolean;
}

export interface LegoSet {
  set_num: string;
  name: string;
  year: number;
  theme_id: number;
  num_parts: number;
  set_img_url: string;
  set_url: string;
}

export interface BrickListItem {
  id: string;
  part: Part;
  color: Color;
  quantity: number;
  found: number;
}

export interface BrickList {
  id: string;
  name: string;
  setNum?: string;
  createdAt: number;
  updatedAt: number;
  items: BrickListItem[];
}

export type AddBrickMethod = 'qr' | 'manual' | 'ocr';
