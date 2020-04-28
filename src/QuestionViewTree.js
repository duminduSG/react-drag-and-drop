import React, {useEffect, useState} from 'react';
import { buildQuestionViewTree } from "./utils/tree-generation";
import * as _ from "lodash";
import Tree, {moveItemOnTree, mutateTree} from "@atlaskit/tree";
import VidVolumeMutedIcon from "@atlaskit/icon/glyph/vid-volume-muted";
import styled from "styled-components";
import baseItem, {withItemClick, withItemFocus} from "@atlaskit/item";

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
    const [rawData, setRawData] = useState(null);
    const [tree, setTree] = useState({});

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
        console.log(tree)
    }, [tree]);

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
                    onClick={() => {}}
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
