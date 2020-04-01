import { isEmpty } from 'lodash';
import objects from "@atlaskit/icon/glyph/emoji/objects";

export const getFirstLeaf = (tree, node) => {
    const { children } = node;
    if(isEmpty(children)) {
        return node;
    } else {
        return getFirstLeaf(tree, tree[children[0]]);
    }

};

export const findParentNode = (tree, childId) => {

    Object.keys(tree).every(node => {
        console.log(node)
        if(tree[node].children.includes(childId)) {
            console.log(tree[node])
            return tree[node]
        }
    });
};
