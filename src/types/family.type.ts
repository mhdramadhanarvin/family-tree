import { Gender, Relation } from "relatives-tree/lib/types";

export default interface FamilyData {
  id: string;
  name?: string;
  gender: string;
  parents: any;
  children: any;
  siblings: any;
  spouses: any;
  placeholder?: boolean;
} 

export interface Node {
  id: string;
  name: string;
  gender: Gender;
  parents: readonly Relation[];
  children: readonly Relation[];
  siblings: readonly Relation[];
  spouses: readonly Relation[]; 
  placeholder?: boolean;
  birthday?: string;
  address?: string;
  job?: string; 
} 