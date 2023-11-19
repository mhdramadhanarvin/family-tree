import React, { memo, useCallback } from "react";
import { Relation } from "relatives-tree/lib/types";
import css from "./Relations.module.css";

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

  const translateType = (type: string): string => {
    switch (type) {
      case "blood":
        return "kandung";
      case "married":
        return "menikah";
      default:
        return type;
    }
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
          {getNameById(item.id)} - ({translateType(item.type)})
        </div>
      ))}
    </div>
  );
});
