import type { CSSProperties } from 'react';
import type { ExtNode } from 'relatives-tree/lib/types';
import { NODE_HEIGHT, NODE_WIDTH } from '../const'; 

export function getNodeStyle({ left, top }: Readonly<ExtNode>): CSSProperties {
  return {
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    transform: `translate(${left * (NODE_WIDTH / 2)}px, ${top * (NODE_HEIGHT / 2)}px)`,
  };
}

// export function getName(name: string) {
//   // return name + "=";
//   var words = name.split('-');

//   for (var i = 0; i < words.length; i++) {
//     var word = words[i];
//     words[i] = word.charAt(0).toUpperCase() + word.slice(1);
//   }

//   return words.join(' ');
// }