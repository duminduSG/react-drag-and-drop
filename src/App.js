import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import Button from '@atlaskit/button';
import Tree, {
    mutateTree,
    moveItemOnTree
} from '@atlaskit/tree';
import baseItem, {withItemClick, withItemFocus} from '@atlaskit/item';
import {treeWithTwoBranches, sample} from './packages/mock';
import Content from './Content';
import {getFirstLeaf, findParentNode} from './utils/tree-search';
import firebase from './firebase';
import axios from 'axios';
import {initialTree, searchTree} from './utils/tree-generation';
import * as _ from 'lodash';


export const LEFT = 'LEFT';
export const RIGHT = 'RIGHT';

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

    const [tree, setTree] = useState({});
    const [rawData, setRawData] = useState(null);
    const [searchValue, setSearchValue] = useState(null);
    const leftMostLeaf = getFirstLeaf(sample.items, sample.items[1]);
    const [selectedNode, setSelectedNode] = useState(leftMostLeaf);

    //console.log(searchValue);

    useEffect(() => {

        axios.get('http://34.211.0.229/firebase/custom/token', {
            headers: {
                Authorization: `Bearer ${process.env.REACT_APP_BACK_END_TOKEN}`
            }
        })
            .then(function (response) {
                firebase
                    .auth()
                    .signInWithCustomToken(response.data.token)
                    .then(data => {

                        firebase.database()
                            .ref(`audits/2000/5e8abee88dd6ef001a26a859`)
                            .once('value')
                            .then(snapshot => {
                                //console.log(snapshot.val());
                            });

                        firebase
                            .database()
                            .ref(`audit_questions/2000/5e8abee88dd6ef001a26a859`)
                            .on('value', snapshot => {
                                setRawData(snapshot.val());
                            });

                    })
                    .catch(error => {
                        console.log(error);
                    });
            })
            .catch(function (error) {
                console.log(error);
            })

    }, []);

    useEffect(() => {
        if(rawData) {
            setTree(initialTree(filterRawData(rawData)));
        }

    }, [rawData]);

    useEffect(() => {
        if(searchValue) {
            setTree(initialTree(filterRawData(rawData)));
        }

    }, [searchValue]);

    //console.log(findParentNode(treeWithTwoBranches.items, '1-1-1'))

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
                    onClick={() => {
                        setSelectedNode(item);

                    }}
                    //isSelected={!!(selectedNode && (item.id === selectedNode.id))}
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

    const filterRawData = data => {
        if(searchValue) {
            return searchTree(searchValue, data);
        }
        return data;
    };


    return (
        <Container>
            <div><input
                placeholder="Search Questions"
                onChange={e => setSearchValue(e.target.value)}
            />
            </div>
            {!_.isEmpty(tree) &&
            (<>
                <Tree
                    tree={tree}
                    renderItem={renderItem}
                    onExpand={onExpand}
                    onCollapse={onCollapse}
                    onDragEnd={onDragEnd}
                    isDragEnabled
                />
                {/*<Content node={selectedNode}/>*/}
            </>)
            }


        </Container>
    );
}

export default App;
