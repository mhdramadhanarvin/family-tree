import React, { memo, useCallback } from "react";
import classNames from "classnames";
import type { Gender, Relation } from "relatives-tree/lib/types";
import { Relations } from "./Relations";
import css from "./NodeDetails.module.css";
import Button from "@mui/material/Button";
 
interface Node {
  id: string;
  name?: string;
  gender: Gender;
  parents: readonly Relation[];
  children: readonly Relation[];
  siblings: readonly Relation[];
  spouses: readonly Relation[];
  placeholder?: boolean;
};

interface NodeDetailsProps {
  node: Readonly<Node>;
  allNode: any;
  className?: string;
  onSelect: (nodeId: string | undefined) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
  onAddFamily: (nodeId: string | undefined) => void;
}

export const NodeDetails = memo(function NodeDetails({
  node,
  allNode,
  className,
  ...props
}: NodeDetailsProps) {
  const closeHandler = useCallback(() => props.onSelect(undefined), [props]);
  const addFamilyHandler = () => {
    closeHandler()  
    return props.onAddFamily(node.id)
  }; 

  return (
    <section className={classNames(css.root, className)}>
      <header className={css.header}>
        <h3 className={css.title}>{node.name}</h3>
        <button className={css.close} onClick={closeHandler}>
          &#10005;
        </button>
      </header>
      <Relations {...props} allNode={allNode} title="OrangTua" items={node.parents} />
      <Relations {...props} allNode={allNode} title="Anak" items={node.children} />
      <Relations {...props} allNode={allNode} title="Saudara" items={node.siblings} />
      <Relations {...props} allNode={allNode} title="Pasangan" items={node.spouses} />
      <Button variant="contained" size="small" onClick={addFamilyHandler}>
        TAMBAH KELUARGA
      </Button>
    </section>
  );
});
