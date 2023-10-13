import React, { useMemo, useState, useCallback } from "react";
import type { Gender, Relation } from "relatives-tree/lib/types";
import treePackage from "relatives-tree/package.json";
import ReactFamilyTree from "react-family-tree";
// import { SourceSelect } from '../SourceSelect/SourceSelect';
import { PinchZoomPan } from "../PinchZoomPan/PinchZoomPan";
import { FamilyNode } from "../FamilyNode/FamilyNode";
import { NodeDetails } from "../NodeDetails/NodeDetails";
import { NODE_WIDTH, NODE_HEIGHT, SOURCES, DEFAULT_SOURCE } from "../const";
import { getNodeStyle } from "./utils";
import { AddFamily } from '../Family/AddFamily'

import css from "./App.module.css";

interface Node {
  id: string;
  name?: string;
  gender: Gender;
  parents: readonly Relation[];
  children: readonly Relation[];
  siblings: readonly Relation[];
  spouses: readonly Relation[];
  placeholder?: boolean;
}

interface ExtNode extends Node {
  readonly top: number;
  readonly left: number;
  readonly hasSubTree: boolean;
}

export default React.memo(function App() {
  const [source] = useState(DEFAULT_SOURCE);
  const [nodes] = useState(SOURCES[source]);
  const firstNodeId = useMemo(() => nodes[0].id, [nodes]);
  const [rootId, setRootId] = useState(firstNodeId);

  const [selectId, setSelectId] = useState<string>();
  const [hoverId, setHoverId] = useState<string>();
  const [addFamilyId, setAddFamilyId] = useState<string>();
  // const [addRelationId, setAddRelationId] = useState<string>();

  const resetRootHandler = useCallback(
    () => setRootId(firstNodeId),
    [firstNodeId]
  );

  const selected = useMemo(
    () => nodes.find((item) => item.id === selectId),
    [nodes, selectId]
  ); 

  const seeDetailNode = (selectId: string) => {
    setSelectId(selectId)
    setAddFamilyId(undefined)
  }

  return (
    <div className={css.root}>
      <header className={css.header}>
        <h1 className={css.title}>
          FamilyTree
          <span className={css.version}>core: {treePackage.version}</span>
        </h1>
      </header>
      {nodes.length > 0 && (
        <PinchZoomPan min={0.5} max={2.0} captureWheel className={css.wrapper}>
          <ReactFamilyTree
            nodes={nodes}
            rootId={rootId}
            width={NODE_WIDTH}
            height={NODE_HEIGHT}
            className={css.tree}
            renderNode={(node: Readonly<ExtNode>) => (
              <FamilyNode
                key={node.id}
                node={node}
                isRoot={node.id === rootId}
                isHover={node.id === hoverId}
                onClick={seeDetailNode}
                onSubClick={setRootId}
                style={getNodeStyle(node)}
              />
            )}
          />
        </PinchZoomPan>
      )}
      {rootId !== firstNodeId && (
        <button className={css.reset} onClick={resetRootHandler}>
          Reset
        </button>
      )}
      {selected && (
        <NodeDetails
          node={selected}
          className={css.details}
          onSelect={setSelectId}
          onHover={setHoverId}
          onClear={() => setHoverId(undefined)}
          onAddFamily={setAddFamilyId}
        />
      )}
      {addFamilyId && <AddFamily onAdd={setAddFamilyId} />}
    </div>
  );
});
