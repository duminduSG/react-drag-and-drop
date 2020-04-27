import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import ChevronDownIcon from '@atlaskit/icon/glyph/chevron-down';
import ChevronRightIcon from '@atlaskit/icon/glyph/chevron-right';
import Button from '@atlaskit/button';
import Tree, {
    mutateTree,
    moveItemOnTree,
} from '@atlaskit/tree';
import { flattenTree, getItem, getTreePosition, getParent } from '@atlaskit/tree/dist/cjs/utils/tree';
import baseItem, {withItemClick, withItemFocus} from '@atlaskit/item';
import {treeWithTwoBranches, sample} from './packages/mock';
import Content from './Content';
import {getFirstLeaf, findParentNode} from './utils/tree-search';
import firebase from './firebase';
import axios from 'axios';
import {initialTree, searchTree} from './utils/tree-generation';
import * as _ from 'lodash';
import VidVolumeMutedIcon from '@atlaskit/icon/glyph/vid-volume-muted';
import history from './history';
import { useLocation } from 'react-router-dom'


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

const createCategoryQuestionOrder = flattenedTree => {
    const categories = flattenedTree.filter(item => item.item.data.isSimplifyaCategory || item.item.data.isCustomQuestionCategory).map((category, index) => {
        return {category_id: category.item.id, index}
    })
    const questions = flattenedTree.filter(item => item.item.data.question && (item.item.data.isSimplifyaQuestion || item.item.data.isCustomQuestionCategoryQuestion) && item.item.data.question.parent_question_id.toString() === '0');
    return  questions.map((question, index) => {
        const categoryOrder = categories.filter(category => category.category_id === question.item.data.question.category_id.toString())
        return {...question.item.data.question, question_order: index + 1, category_order: categoryOrder[0].index}
    })
}

const createQuestionGroupQuestionOrder = flattenedTree => {
    const questionGroups = flattenedTree.filter(item => item.item.data.isQuestionGroup).map((questionGroup, index) => {
        return {question_group_id: questionGroup.item.id, children: questionGroup.item.children, index}
    });

    const questions = flattenedTree.filter(item =>  item.item.data.question &&
        item.item.data.isQuestionGroupQuestion &&
        item.item.data.question.parent_question_id.toString() === '0');

    const mapQuestions = _.unionBy(questions.map(item => item.item.data.question), 'question_id');

    questionGroups.forEach(questionGroup => {
        mapQuestions.forEach(question=> {

            const questionIndexOfGroup = questionGroup.children.findIndex(child => child === `${question.question_id}_group_${questionGroup.question_group_id}`);

            if(questionIndexOfGroup !== -1) {
                const selectedGroup = question.question_groups.find(group => group.question_group_id === questionGroup.question_group_id);
                if(selectedGroup) {
                    selectedGroup.group_order = questionGroup.index;
                    selectedGroup.question_order_in_group = questionIndexOfGroup;
                }
            }

        })
    })
    //console.log(mapQuestions)
    return mapQuestions;

}



function App() {

    let location = useLocation();
    const [tree, setTree] = useState({});
    const [rawData, setRawData] = useState(null);
    const [searchValue, setSearchValue] = useState(null);
    const leftMostLeaf = getFirstLeaf(sample.items, sample.items[1]);
    const [selectedNode, setSelectedNode] = useState({});

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
                            .ref(`audits/2000/5ea2948ff937cf001bf800b2`)
                            .once('value')
                            .then(snapshot => {
                                //console.log(snapshot.val());
                            });

                        firebase
                            .database()
                            .ref(`audit_questions/2000/5ea2948ff937cf001bf800b2`)
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

    useEffect(() => {
        const urlParams = location.pathname.split('/').slice(4);
        if(!_.isEmpty(tree) && !_.isEmpty(urlParams)) {
            const categoryOrGroupItem = tree.items[urlParams[0]];
            let questionItem;
            if(categoryOrGroupItem.children.includes(urlParams[1])) {
                questionItem = tree.items[urlParams[1]];
            } else {
                questionItem = tree.items[`${urlParams[1]}_group_${urlParams[0]}`]
            }
            if(urlParams[2]) {
                let childQuestionItem;
                if(questionItem.children.includes(urlParams[2])) {
                    childQuestionItem = tree.items[urlParams[2]];
                } else {
                    childQuestionItem = tree.items[`${urlParams[2]}_group_${urlParams[0]}`]
                }
                setSelectedNode(childQuestionItem);
            } else {
                setSelectedNode(questionItem);
            }

        } else if(!_.isEmpty(tree) && _.isEmpty(urlParams)) {
            const firstItemToSelect = getItem(tree, [0,0]);
            setSelectedNode(firstItemToSelect);
            buildRouteForSelectedItem(firstItemToSelect);
        }

    }, [location.pathname, tree]);

    useEffect(() => {
        if(!_.isEmpty(selectedNode)) {
            console.log(selectedNode)
        }
    }, [selectedNode])

    useEffect(() => {
        if(!_.isEmpty(tree)) {
            let clonedTree = _.cloneDeep(tree);
            let alteredTreeItems = {};
            _.values(clonedTree.items).forEach(value => {
                alteredTreeItems[value.id] = { ...value, isExpanded: true }
            })

            const alteredTree = {
                rootId: '1',
                items: alteredTreeItems
            }

            const flattenedTree = flattenTree(alteredTree);
            //console.log(flattenedTree)
            const orderedCategoryQuestions = createCategoryQuestionOrder(flattenedTree);
            const orderedGroupQuestions = createQuestionGroupQuestionOrder(flattenedTree);

            let updates = {}
            orderedCategoryQuestions.forEach(question => {
                updates['audit_questions/2000/5ea2948ff937cf001bf800b2/' + question.question_id + '/question_order'] = question.question_order;
                updates['audit_questions/2000/5ea2948ff937cf001bf800b2/' + question.question_id + '/category_order'] = question.category_order;
            });

            orderedGroupQuestions.forEach(question => {
                updates['audit_questions/2000/5ea2948ff937cf001bf800b2/' + question.question_id + '/question_groups'] = question.question_groups;
                question.question_groups.forEach(group => {
                    updates['audit_questions/2000/5ea2948ff937cf001bf800b2/' + question.question_id + '/group_order_' + group.question_group_id] = group.group_order;
                    updates['audit_questions/2000/5ea2948ff937cf001bf800b2/' + question.question_id + '/question_order_in_group_' + group.question_group_id] = group.question_order_in_group;
                })

            });

            const ref = firebase
                .app()
                .database()
                .ref();
            ref.update(updates);



            //console.log(getItem(tree, [1, 0]))
            //console.log(getTreePosition(tree, [0, 1]))
            //console.log(getParent(tree, [0, 0]))

        }

    }, [tree]);

    const buildRouteForSelectedItem = item => {
        if(item.data.isSimplifyaQuestion || item.data.isCustomQuestionCategoryQuestion) {
            let route;
            if(item.data.question.parent_question_id === '0') {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${item.data.question.category_id}/${item.data.question.question_id}`
            } else {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${item.data.question.category_id}/${item.data.question.parent_question_id}/${item.data.question.question_id}`
            }
            history.push(route);

        } else if(item.data.isQuestionGroupQuestion) {
            let route;
            const idInfo = item.id.split('_');
            if(item.data.question.parent_question_id === '0') {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${idInfo[2]}/${item.data.question.question_id}`
            } else {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${idInfo[2]}/${item.data.question.parent_question_id}/${item.data.question.question_id}`
            }
            history.push(route);
        }

    }

    const getIcon = (item, onExpand, onCollapse) => {
        if (item.children && item.children.length > 0 &&
            (item.data.isSimplifyaCategory || item.data.isCustomQuestionCategory || item.data.isQuestionGroup)) {
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
                        buildRouteForSelectedItem(item);
                        if(item.data.isSimplifyaCategory || item.data.isCustomQuestionCategory || item.data.isQuestionGroup) {
                            item.isExpanded ? onCollapse(item.id) : onExpand(item.id);
                        }
                    }}
                    isSelected={!!(selectedNode && (item.id === selectedNode.id))}
                >
                    {item.data ? item.data.title : ''}
                    <> {item.data && item.data.question && item.data.question.muted ? <VidVolumeMutedIcon/> : null}</>
                </Item>
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

    const getQuestionOrder = () => {

        let clonedTree = _.cloneDeep(tree);
        let alteredTreeItems = {};
        _.values(clonedTree.items).forEach(value => {
            alteredTreeItems[value.id] = { ...value, isExpanded: true }
        })

        const alteredTree = {
            rootId: '1',
            items: alteredTreeItems
        }

        const flattenedTree = flattenTree(alteredTree);
        console.log(flattenedTree)
        const categories = flattenedTree.filter(item => item.item.data.isSimplifyaCategory);
        const questions = flattenedTree.filter(item => item.item.data.question);

        const orderedQuestions = questions.map((question, index) => {
            const categoryOrder = categories.filter(category => category.category_id === question.item.data.question.category_id.toString())
            return {...question.item.data.question, question_order: index, category_order: categoryOrder[0].index}
        })

        /*firebase.child('audit_questions/2085').on('value', function(snapshot) {
            updates["audit_questions/2000/"+snapshot.key+"/a"] = true;
        });*/

    }


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
