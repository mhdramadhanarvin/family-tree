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
  name?: string;
  // gender: Gender;
  gender: string;
  parents: readonly Relation[];
  children: readonly Relation[];
  siblings: readonly Relation[];
  spouses: readonly Relation[];
  placeholder?: boolean;
}