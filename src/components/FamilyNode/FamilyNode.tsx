import React, { useCallback } from 'react';
import classNames from 'classnames';
// import type { Node, ExtNode } from 'relatives-tree/lib/types';
import css from './FamilyNode.module.css';
import { getName } from '../App/utils';

interface FamilyNodeProps {
  node: any;
  isRoot: boolean;
  isHover?: boolean;
  onClick: (id: string) => void;
  onSubClick: (id: string) => void;
  style?: React.CSSProperties;
}

export const FamilyNode = React.memo(
  function FamilyNode({ node, isRoot, isHover, onClick, onSubClick, style }: FamilyNodeProps) {
    const clickHandler = useCallback(() => onClick(node.id), [node.id, onClick]);
    const clickSubHandler = useCallback(() => onSubClick(node.id), [node.id, onSubClick]);

    return (
      <div className={css.root} style={style}>
        <div
          className={classNames(
            css.inner,
            css[node.gender],
            isRoot && css.isRoot,
            isHover && css.isHover,
          )}
          onClick={clickHandler}
        >
          <div className={css.id}>{getName(node.name)}</div>
        </div>
        {node.hasSubTree && (
          <div
            className={classNames(css.sub, css[node.gender])}
            onClick={clickSubHandler}
          />
        )}
      </div>
    );
  },
);
