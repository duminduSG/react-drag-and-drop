import React, { useState } from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import Button from '@atlaskit/button';
import Tree, {
    mutateTree,
    moveItemOnTree
} from '@atlaskit/tree';
import baseItem, { withItemClick, withItemFocus } from '@atlaskit/item';
import { treeWithTwoBranches }from './packages/mock';
import Content from './Content';

const Container = styled.div`
  display: flex;
`;

const Dot = styled.span`
  display: flex;
  width: 24px;
  height: 32px;
  justify-content: center;
  font-size: 12px;
  line-height: 32px;
`;

const Item = withItemClick(withItemFocus(baseItem));

function App() {

    const [tree, setTree] = useState(treeWithTwoBranches);
    const [selectedNode, setSelectedNode] = useState(null);

    const getIcon = (item, onExpand, onCollapse) => {
        if (item.children && item.children.length > 0) {
            return item.isExpanded ? (
                <Button
                    spacing="none"
                    appearance="subtle-link"
                    onClick={() => onCollapse(item.id)}
                >
                    <ChevronDownIcon label="" size="medium" />
                </Button>
            ) : (
                <Button
                    spacing="none"
                    appearance="subtle-link"
                    onClick={() => onExpand(item.id)}
                >
                    <ChevronRightIcon label="" size="medium" />
                </Button>
            );
        }
        return <Dot>&bull;</Dot>;
    };

    const renderItem = ({
                      item,
                      onExpand,
                      onCollapse,
                      provided,
                      snapshot,
                  }) => {
        return (
            <div ref={provided.innerRef} {...provided.draggableProps}>
                <Item
                    isDragging={snapshot.isDragging}
                    //text={item.data ? item.data.title : ''}
                    elemBefore={getIcon(item, onExpand, onCollapse)}
                    dnd={{ dragHandleProps: provided.dragHandleProps }}
                    //theme={{}}
                    onClick={() => setSelectedNode(item)}
                >{item.data ? item.data.title : ''}</Item>
            </div>
        );
    };

    const onExpand = itemId => {
        console.log(itemId);
        setTree(mutateTree(tree, itemId, { isExpanded: true }));
    };

    const onCollapse = itemId => {
        setTree(mutateTree(tree, itemId, { isExpanded: false }));
    };

    const onDragEnd = (source, destination) => {

        console.log(source, destination);

        if (!destination) {
            return;
        }

        if (source.parentId !== destination.parentId) {
            return;
        }

        const newTree = moveItemOnTree(tree, source, destination);
        setTree(newTree);
    };


  return (
      <Container>
              <Tree
                  tree={tree}
                  renderItem={renderItem}
                  onExpand={onExpand}
                  onCollapse={onCollapse}
                  onDragEnd={onDragEnd}
                  isDragEnabled
              />
          <Content node={selectedNode}/>
      </Container>
  );
}

export default App;
