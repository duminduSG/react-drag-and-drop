import React, {useEffect, useState} from 'react';
import {buildQuestionViewTree, searchTree} from "./utils/tree-generation";
import * as _ from "lodash";
import Tree, {moveItemOnTree, mutateTree} from "@atlaskit/tree";
import VidVolumeMutedIcon from "@atlaskit/icon/glyph/vid-volume-muted";
import styled from "styled-components";
import baseItem, {withItemClick, withItemFocus} from "@atlaskit/item";
import history from "./history";
import {flattenTree, getItem} from "@atlaskit/tree/dist/cjs/utils/tree";
import { useLocation } from "react-router-dom";

const Dot = styled.span`
  display: flex;
  width: 24px;
  height: 32px;
  justify-content: center;
  font-size: 12px;
  line-height: 32px;
`;

const Item = withItemClick(withItemFocus(baseItem));

const QuestionViewTree = props => {

    const { questionList, searchValue } = props;
    let location = useLocation();
    const [rawData, setRawData] = useState(null);
    const [tree, setTree] = useState({});
    const [selectedNode, setSelectedNode] = useState({});

    useEffect(() => {
        if (!_.isEmpty(questionList)) {
            if (searchValue !== '') {
                setTree(searchTree(searchValue, questionList, false));

            } else {
                setTree(buildQuestionViewTree(questionList));
            }
        }
    }, [questionList, searchValue]);

    useEffect(() => {
        const urlParams = location.pathname.split('/').slice(4);
        if(!_.isEmpty(tree) && _.isEmpty(selectedNode) && !_.isEmpty(urlParams)) {
            if(urlParams[2]) {
                let childQuestionItem = tree.items[urlParams[2]];
                setSelectedNode(childQuestionItem);
            } else {
                let questionItem = tree.items[urlParams[1]];
                setSelectedNode(questionItem);
            }
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

            const questions = flattenedTree.filter(item => item.item.data.question && item.item.data.question.parent_question_id.toString() === '0')
                .map((question, index) => {
                    return {...question.item.data.question, question_order: index + 1}
                });

            console.log(questions)

            let updates = {}

            questions.forEach(question => {
                updates['audit_questions/2085/5ea7f3c1d56721001b64f4ce/' + question.question_id + '/question_order'] = question.question_order;
            });

            /*const ref = firebase
                .app()
                .database()
                .ref();
            ref.update(updates);*/

        }
    }, [tree])

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
                    elemBefore={<Dot>&bull;</Dot>}
                    dnd={{ dragHandleProps: provided.dragHandleProps }}
                    onClick={() => {
                        setSelectedNode(item);
                        buildRouteForSelectedItem(item);
                    }}
                    isSelected={!!(selectedNode && (item.id === selectedNode.id))}
                >
                    {item.data ? item.data.title : ''}
                    <> {item.data && item.data.question && item.data.question.muted ? <VidVolumeMutedIcon/> : null}</>
                </Item>
            </div>
        );
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
            const groups = item.data.question.question_groups;
            if(item.data.question.parent_question_id === '0') {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${groups[0].question_group_id}/${item.data.question.question_id}`
            } else {
                route = `/audit/conduct/5ea2948ff937cf001bf800b2/${groups[0].question_group_id}/${item.data.question.parent_question_id}/${item.data.question.question_id}`
            }
            history.push(route);
        }

    }

    return (
        <>
            {!_.isEmpty(tree) &&
            (<>
                <Tree
                    tree={tree}
                    renderItem={renderItem}
                    onDragEnd={onDragEnd}
                    isDragEnabled
                />
            </>)
            }

        </>
    )
}

export default QuestionViewTree;
