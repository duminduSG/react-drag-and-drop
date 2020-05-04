import React, {useState, useEffect, useRef} from 'react';
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
import firebase from './firebase';
import {initialTree, searchTree} from './utils/tree-generation';
import * as _ from 'lodash';
import VidVolumeMutedIcon from '@atlaskit/icon/glyph/vid-volume-muted';
import history from './history';
import { useLocation } from 'react-router-dom'

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
    const parentNodes = flattenedTree.filter(item => item.item.data.isCategory || item.item.data.isGroup).map((category, index) => {
        return {id: category.item.id, index}
    })
    const questions = flattenedTree.filter(item => item.item.data.question && (item.item.data.isSimplifyaQuestion || item.item.data.isCustomQuestionCategoryQuestion) && item.item.data.question.parent_question_id.toString() === '0');
    return  questions.map((question, index) => {
        const selectedParentNode = parentNodes.find(node => node.id === question.item.data.question.category_id.toString())
        if(selectedParentNode) {
            return {...question.item.data.question, question_order: index + 1, category_order: selectedParentNode.index}
        }
    })
}

const createQuestionGroupQuestionOrder = flattenedTree => {
    const questionGroups = flattenedTree.filter(item => item.item.data.isGroup).map((questionGroup, index) => {
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
    return mapQuestions;

}

const CategoryViewTree = props => {

    const { audit, questionList, searchValue } = props;
    let location = useLocation();
    const [tree, setTree] = useState({});
    const [rawData, setRawData] = useState(null);
    const [selectedNode, setSelectedNode] = useState({});

    useEffect(() => {
        if (!_.isEmpty(questionList) && !_.isEmpty(audit)) {
            if (searchValue !== '') {
                setTree(searchTree(searchValue, questionList, true, audit));

            } else {
                setTree(initialTree(audit, questionList));
            }
        }
    }, [questionList, searchValue, audit]);


    useEffect(() => {
        const urlParams = location.pathname.split('/').slice(4);
        if(!_.isEmpty(tree) && searchValue === '' && _.isEmpty(selectedNode) && !_.isEmpty(urlParams)) {
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
            setTree(mutateTree(tree, categoryOrGroupItem.id, { isExpanded: true }));

        } else if(!_.isEmpty(tree) && searchValue === '' && _.isEmpty(selectedNode) && _.isEmpty(urlParams)) {
            const firstItemToSelect = getItem(tree, [0,0]);
            const firstItemCategoryOrGroup = getItem(tree, [0]);
            setSelectedNode(firstItemToSelect);
            setTree(mutateTree(tree, firstItemCategoryOrGroup.id, { isExpanded: true }));
            buildRouteForSelectedItem(firstItemToSelect);
        }

    }, [location.pathname, tree]);

    useEffect(() => {
        if(!_.isEmpty(tree) && searchValue === '') {
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

            const parentNodes = flattenedTree.filter(item => item.item.data.isCategory || item.item.data.isGroup).map((node, index) => {
                return {
                    id: !isNaN(node.item.id) ? parseInt(node.item.id) : node.item.id,
                    name: node.item.data.title,
                    node_type: node.item.data.isCategory ? 'category' : 'group',
                    node_order: index + 1}
            })

            let updates = {}
            updates['audits/2085/5ea7f3c1d56721001b64f4ce/parent_question_nodes'] = parentNodes;

            const questions = flattenedTree.filter(item => item.item.data.question && (item.item.data.isSimplifyaQuestion || item.item.data.isCustomQuestionCategoryQuestion || item.item.data.isQuestionGroupQuestion) && item.item.data.question.parent_question_id.toString() === '0')
                .map((question, index) => {
                    return {...question.item.data.question, question_order: index + 1}
                });

            const uniqQuestions = _.uniqBy(questions, 'question_id');
            const orderedGroupQuestions = createQuestionGroupQuestionOrder(flattenedTree);


            uniqQuestions.forEach(question => {
                updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/question_order'] = question.question_order;
                updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/category_order'] = question.category_order;
            });

            orderedGroupQuestions.forEach(question => {
                updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/question_groups'] = question.question_groups;
                question.question_groups.forEach(group => {
                    updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/group_order_' + group.question_group_id] = group.group_order;
                    updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/question_order_in_group_' + group.question_group_id] = group.question_order_in_group;
                })

            });

            /*const ref = firebase
                .app()
                .database()
                .ref();
            ref.update(updates);*/

        }

    }, [tree]);

    const buildRouteForSelectedItem = item => {
        if(item.data.isSimplifyaQuestion || item.data.isCustomQuestionCategoryQuestion) {
            let route;
            if(item.data.question.parent_question_id === '0') {
                route = `/audit/conduct/5ea7f3c1d56721001b64f4ce/${item.data.question.category_id}/${item.data.question.question_id}`
            } else {
                route = `/audit/conduct/5ea7f3c1d56721001b64f4ce/${item.data.question.category_id}/${item.data.question.parent_question_id}/${item.data.question.question_id}`
            }
            history.push(route);

        } else if(item.data.isQuestionGroupQuestion) {
            let route;
            const idInfo = item.id.split('_');
            if(item.data.question.parent_question_id === '0') {
                route = `/audit/conduct/5ea7f3c1d56721001b64f4ce/${idInfo[2]}/${item.data.question.question_id}`
            } else {
                route = `/audit/conduct/5ea7f3c1d56721001b64f4ce/${idInfo[2]}/${item.data.question.parent_question_id}/${item.data.question.question_id}`
            }
            history.push(route);
        }

    }

    const getIcon = (item, onExpand, onCollapse) => {
        if (item.children && item.children.length > 0 &&
            (item.data.isCategory || item.data.isGroup)) {
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
                        if(item.data.isSimplifyaQuestion || item.data.isCustomQuestionCategoryQuestion || item.data.isQuestionGroupQuestion) {
                            setSelectedNode(item);
                        }
                        buildRouteForSelectedItem(item);
                        if(item.data.isCategory || item.data.isGroup) {
                            item.isExpanded ? onCollapse(item.id) : onExpand(item.id);
                        }
                    }}
                    isSelected={!!(selectedNode && (item.id === selectedNode.id))}
                >
                    {item.data ? item.data.title.concat('-').concat(item.id) : ''}
                    <> {item.data && item.data.question && item.data.question.muted ? <VidVolumeMutedIcon/> : null}</>
                </Item>
            </div>
        );
    };

    const onExpand = itemId => {
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
        <>
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
            </>)
            }

        </>
    );
}

export default CategoryViewTree;
