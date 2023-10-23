import { Node } from '../types/family.type';

export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 120;

if (localStorage.getItem('family-tree') == null) {
  localStorage.setItem('family-tree', JSON.stringify({
    "tree": [
      {
        "id": "user1",
        "name": "Nama",
        "gender": "male",
        "parents": [],
        "siblings": [],
        "spouses": [],
        "children": []
      }
    ],
    "expired_at": ""
  }))
} 

export const SOURCES = {
  'new': JSON.parse(localStorage.getItem('family-tree') || '{}').tree,
} as Readonly<{ [key: string]: readonly Readonly<Node>[] }>;

export const DEFAULT_SOURCE = Object.keys(SOURCES)[0];

export const URL_LABEL = 'URL (Gist, Paste.bin, ...)';
