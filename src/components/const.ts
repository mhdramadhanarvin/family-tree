// import averageTree from 'relatives-tree/samples/average-tree.json';
// import couple from 'relatives-tree/samples/couple.json';
// import diffParents from 'relatives-tree/samples/diff-parents.json';
// import divorcedParents from 'relatives-tree/samples/divorced-parents.json';
// import empty from 'relatives-tree/samples/empty.json';
// import severalSpouses from 'relatives-tree/samples/several-spouses.json';
// import simpleFamily from 'relatives-tree/samples/simple-family.json';
// import testTreeN1 from 'relatives-tree/samples/test-tree-n1.json';
// import testTreeN2 from 'relatives-tree/samples/test-tree-n2.json';
// import familyData from './data/family.json'
import type { Gender, Relation } from 'relatives-tree/lib/types';
import FamilyDataService from '../services/FamilyDataService';
import { Node } from '../types/family.type';

export const NODE_WIDTH = 100;
export const NODE_HEIGHT = 120;

if (localStorage.getItem('family-tree') == null) {
  localStorage.setItem('family-tree', JSON.stringify([
    {
      "id": "user1",
      "name": "Nama",
      "gender": "male",
      "parents": [],
      "siblings": [],
      "spouses": [],
      "children": []
    }
  ]))
}

export const SOURCES = {
  'new': JSON.parse(localStorage.getItem('family-tree') || '{}'),
} as Readonly<{ [key: string]: readonly Readonly<Node>[] }>;

export const DEFAULT_SOURCE = Object.keys(SOURCES)[0];

export const URL_LABEL = 'URL (Gist, Paste.bin, ...)';
