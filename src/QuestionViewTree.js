import React, {useEffect, useState} from 'react';
import { buildQuestionViewTree } from "./utils/tree-generation";
import * as _ from "lodash";
import Tree, {moveItemOnTree, mutateTree} from "@atlaskit/tree";
import VidVolumeMutedIcon from "@atlaskit/icon/glyph/vid-volume-muted";
import styled from "styled-components";
import baseItem, {withItemClick, withItemFocus} from "@atlaskit/item";
import history from "./history";
import {getItem} from "@atlaskit/tree/dist/cjs/utils/tree";
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

    const { questionList } = props;
    let location = useLocation();
    const [rawData, setRawData] = useState(null);
    const [tree, setTree] = useState({});
    const [selectedNode, setSelectedNode] = useState({});

    useEffect(() => {
        if(rawData) {
            setTree(buildQuestionViewTree(rawData));
        }

    }, [rawData]);

    useEffect(() => {
        if (!_.isEmpty(questionList)) {
            setRawData(questionList);
        }
    }, [questionList]);

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
