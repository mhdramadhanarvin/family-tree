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
  className?: string;
  onSelect: (nodeId: string | undefined) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
}

export const NodeDetails = memo(function NodeDetails({
  node,
  className,
  ...props
}: NodeDetailsProps) {
  const closeHandler = useCallback(() => props.onSelect(undefined), [props]);

  const addRelation = () => {
    closeHandler();
    console.log(node);
  }; 

  return (
    <section className={classNames(css.root, className)}>
      <header className={css.header}>
        <h3 className={css.title}>{node.name}</h3>
        <button className={css.close} onClick={closeHandler}>
          &#10005;
        </button>
      </header>
      <Relations {...props} title="OrangTua" items={node.parents} />
      <Relations {...props} title="Anak" items={node.children} />
      <Relations {...props} title="Saudara" items={node.siblings} />
      <Relations {...props} title="Pasangan" items={node.spouses} />
      <Button variant="contained" size="small" onClick={addRelation}>
        TAMBAH KELUARGA
      </Button>
    </section>
  );
});
