import { Gender, Relation } from "relatives-tree/lib/types";

export default interface FamilyData {
  id: string;
  name?: string | undefined;
  gender: string;
  parents: any;
  children: any;
  siblings: any;
  spouses: any;
  placeholder?: boolean;
  birthday?: string;
  address?: string;
  job?: string;
  photo?: string;
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
  photo?: string;
}

export interface AuthType {
  email: string;
  password: string;
}

export interface RegisterType extends AuthType{
  fatherId: string;
  motherId: string;
}

export interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
}

export interface ParentDataType {
  parentId: string;
  parentName: string
}

export enum RelationType {
  spouse = "spouse",
  children = "children"
}

export enum statusTemporaryFamily {
  pending = 1,
  approve = 2,
  rejected = 3
}

export interface TemporaryFamilyType {
  id: number;
  parent_id: string;
  parent_name: string;
  relation_type: keyof RelationType;
  data: object;
  status: typeof statusTemporaryFamily;
  created_at: string
}