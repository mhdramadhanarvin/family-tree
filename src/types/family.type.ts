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

export interface NewUserType {
  email: string;
  password: string;
}

export interface AlertType {
  message: string;
  type: "error" | "warning" | "info" | "success";
}