import React, { memo, useCallback, useState } from "react";
import { Relation } from "relatives-tree/lib/types";
import css from "./Relations.module.css";
import { SOURCES, DEFAULT_SOURCE } from "../const";

interface RelationsProps {
  allNode: any;
  title: string;
  items: readonly Relation[];
  onSelect: (nodeId: string) => void;
  onHover: (nodeId: string) => void;
  onClear: () => void;
}

export const Relations = memo(function Relations({
  allNode,
  title,
  items,
  onSelect,
  onHover,
  onClear,
}: RelationsProps) {
  const selectHandler = useCallback(
    (id: string) => () => onSelect(id),
    [onSelect]
  );
  const hoverHandler = useCallback(
    (id: string) => () => onHover(id),
    [onHover]
  );
  const clearHandler = useCallback(() => onClear(), [onClear]);

  const getNameById = (id: string | undefined): string => {
    const node = allNode.filter((node: any) => node.id === id)[0]; 
    return node.name;
  };

  if (!items.length) return null;

  return (
    <div>
      <h4>{title}</h4>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={css.item}
          onClick={selectHandler(item.id)}
          onMouseEnter={hoverHandler(item.id)}
          onMouseLeave={clearHandler}
        >
          {getNameById(item.id)} - ({item.type})
        </div>
      ))}
    </div>
  );
});
