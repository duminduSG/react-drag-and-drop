import * as _ from 'lodash';
import question from "@atlaskit/icon/glyph/question";

const PARENT_NODE_TYPE_CATEGORY = 'category';
const PARENT_NODE_TYPE_GROUP = 'group';

let treeTemplateMock = {
    rootId: '1',
    items: {
        '1': {
            id: '1',
            children: [],
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: 'root',
            },
        }
    }
};


const getUniqueCategories = data => {
    return  _.uniqBy(
        _.values(data).filter(question => !question.is_custom && !question.question_groups).map(question => {return {category_id: question.category_id, category_name: question.category_name, category_order: question.category_order}}),
        'category_id'
    );
}
;

const getCustomCategories = data => {
    return _.uniqBy(
        _.values(data)
            .filter(question => question.is_custom).map(question => {return {category_id: question.category_id, category_name: question.category_name, category_order: question.category_order}}),
        'category_id'
    );
}

const getQuestionGroups = data => {
    let questionGroups = []
    _.values(data)
        .forEach(question => {
            if(question.question_groups) {
                let groups = question.question_groups.map(questionGroup => questionGroup);
                questionGroups = [...questionGroups, ...groups];
            }
        })
    return _.uniqBy(questionGroups, 'question_group_id');
}

const addSimplifyaQuestionToTree = (treeTemplate, data, simplifyaCategories) => {

    simplifyaCategories.map(category => {
        const simplifyaQuestions = _.sortBy(_.values(data).filter(item => item.category_id === category.category_id && !item.is_custom && !item.question_groups ), 'question_order');
        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: simplifyaQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id),
                isSimplifyaCategory: true
            }
        };

        simplifyaQuestions.map(question => {

            let { citations, city, company_id, is_duplicate_from ,licenses, state, ...rest } =question;

            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isSimplifyaQuestion: true
                }
            }
        });

        simplifyaQuestions.map(question => {

            if(question.parent_question_id.toString() !== '0') {

                if(treeTemplate.items[question.parent_question_id] &&
                    treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

                    treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
                    treeTemplate.items[question.parent_question_id].hasChildren = true;
                }

            }

        });

    });

}

const addCustomCategoryQuestionsToTree = (treeTemplate, data, customCategories) => {
    customCategories.forEach(category => {
        const customCategoryQuestions = _.sortBy(_.values(data).filter(question => question.is_custom && !question.question_groups && question.category_id === category.category_id), 'question_order');

        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: customCategoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id).concat('-custom'),
                isCustomQuestionCategory: true
            }
        };

        customCategoryQuestions.map(question => {

            let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;

            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isCustomQuestionCategoryQuestion: true
                }
            }
        });


        customCategoryQuestions.map(question => {

            if(question.parent_question_id.toString() !== '0') {

                if(treeTemplate.items[question.parent_question_id] &&
                    treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

                    treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
                    treeTemplate.items[question.parent_question_id].hasChildren = true;
                }
            }
        });



    });

}

const addQuestionGroupQuestionsToTree = (treeTemplate, data, questionGroups) => {
    const questionGroupQuestions = _.values(data).filter(question => question.is_custom && question.question_groups);
    //console.log(questionGroups)
    //console.log(questionGroupQuestions)
    //TODO: check the array.includes method for the filtering
    questionGroups.forEach(group => {
        let questionGroupQuestionsByCategory = [];
        questionGroupQuestions.forEach(question => {
            if(question.question_groups.some(questionGroup => questionGroup.question_group_id === group.question_group_id)) {
                questionGroupQuestionsByCategory = [ ...questionGroupQuestionsByCategory , question];
            }
        });

        questionGroupQuestionsByCategory = _.sortBy(questionGroupQuestionsByCategory, `question_order_in_group_${group.question_group_id}`);


        treeTemplate.items['1'].children.push(group.question_group_id.toString());
        treeTemplate.items[group.question_group_id] = {
            id: group.question_group_id.toString(),
            children: questionGroupQuestionsByCategory.filter(item => item.parent_question_id.toString() === '0').map(item => `${item.question_id}_group_${group.question_group_id}`),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: group.question_group_name.concat('-').concat(group.question_group_id),
                isQuestionGroup: true
            }
        };

        questionGroupQuestionsByCategory.map(question => {

            let { citations, city, company_id, is_duplicate_from ,licenses, state, ...rest } =question;

            treeTemplate.items[`${question.question_id}_group_${group.question_group_id}`] = {
                id: `${question.question_id.toString()}_group_${group.question_group_id}`,
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isQuestionGroupQuestion: true
                }
            }

        });

        questionGroupQuestionsByCategory.map(question => {

            if(question.parent_question_id.toString() !== '0') {

                if(treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`] &&
                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].data.question.selected_answer_id === question.question_answer_id) {

                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].children.push(`${question.question_id}_group_${group.question_group_id}`);
                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].hasChildren = true;
                }

            }

        });


    });

}

export const searchTree = (searchValue, data, isCategoryView, audit) => {
    const questionArray = _.values(data)
    const selectedAllQuestions = questionArray.filter(
        question =>
            (question.question.toLowerCase().includes(searchValue.toLowerCase()) ||
                question.explanation.toLowerCase().includes(searchValue.toLowerCase()))
    );

    let selectedQuestionsToBuildTree = [];

    const selectedParentQuestions = selectedAllQuestions.filter(question => question.parent_question_id.toString() === '0');
    const selectedChildQuestions = selectedAllQuestions.filter(question => question.parent_question_id.toString() !== '0');

    selectedQuestionsToBuildTree = [...selectedQuestionsToBuildTree, ...selectedParentQuestions];

    selectedChildQuestions.forEach(childQuestion => {

        const matchedParent = questionArray.find(question => question.question_id === childQuestion.parent_question_id &&
            question.selected_answer_id === childQuestion.question_answer_id
        );
        if(matchedParent) {
            selectedQuestionsToBuildTree = [...selectedQuestionsToBuildTree , childQuestion]
        }
    });

    const uniqueQuestions = _.uniqBy(selectedQuestionsToBuildTree, 'question_id');
    return isCategoryView ? buildSearchTreeForCategoryView(audit, uniqueQuestions) : buildSearchTreeForQuestionView(uniqueQuestions);

};

export const initialTree = (audit, data) => {
    let treeTemplate = _.cloneDeep(treeTemplateMock);
    const parentNodes = _.sortBy(audit.parent_question_nodes, 'node_order');
    const questionGroupQuestions = _.values(data).filter(question => question.is_custom && question.question_groups);

    parentNodes.forEach(node => {

        if(node.node_type === PARENT_NODE_TYPE_CATEGORY) {

            const categoryQuestions = _.sortBy(_.values(data).filter(item => item.category_id === node.id && !item.question_groups), 'question_order');

            if(categoryQuestions.length > 0) {
                treeTemplate.items['1'].children.push(node.id.toString());
                treeTemplate.items[node.id.toString()] = {
                    id: node.id.toString(),
                    children: categoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
                    hasChildren: true,
                    isExpanded: false,
                    isChildrenLoading: false,
                    data: {
                        title: node.name,
                        isCategory: true
                    }
                };

                categoryQuestions.map(question => {

                    let { citations, city, company_id, is_duplicate_from ,licenses, state, ...rest } =question;

                    treeTemplate.items[question.question_id] = {
                        id: question.question_id.toString(),
                        children: [],
                        hasChildren: false,
                        isExpanded: true,
                        isChildrenLoading: false,
                        data: {
                            title: question.explanation,
                            question: rest,
                            [findQuestionType(question)]: true
                        }
                    }
                });

                categoryQuestions.map(question => {

                    if(question.parent_question_id.toString() !== '0') {

                        if(treeTemplate.items[question.parent_question_id] &&
                            treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

                            treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
                            treeTemplate.items[question.parent_question_id].hasChildren = true;
                        }

                    }

                });
            }

        }

        if(node.node_type === PARENT_NODE_TYPE_GROUP) {

            let questionGroupQuestionsByCategory = [];
            questionGroupQuestions.forEach(question => {
                if(question.question_groups.some(questionGroup => questionGroup.question_group_id === node.id)) {
                    questionGroupQuestionsByCategory = [ ...questionGroupQuestionsByCategory , question];
                }
            });

            questionGroupQuestionsByCategory = _.sortBy(questionGroupQuestionsByCategory, `question_order_in_group_${node.id}`);

            if(questionGroupQuestionsByCategory.length > 0) {

                treeTemplate.items['1'].children.push(node.id.toString());
                treeTemplate.items[node.id.toString()] = {
                    id: node.id.toString(),
                    children: questionGroupQuestionsByCategory.filter(item => item.parent_question_id.toString() === '0').map(item => `${item.question_id}_group_${node.id}`),
                    hasChildren: true,
                    isExpanded: false,
                    isChildrenLoading: false,
                    data: {
                        title: node.name,
                        isGroup: true
                    }
                };

                questionGroupQuestionsByCategory.map(question => {

                    let { citations, city, company_id, is_duplicate_from ,licenses, state, ...rest } =question;

                    treeTemplate.items[`${question.question_id}_group_${node.id}`] = {
                        id: `${question.question_id.toString()}_group_${node.id}`,
                        children: [],
                        hasChildren: false,
                        isExpanded: true,
                        isChildrenLoading: false,
                        data: {
                            title: question.explanation,
                            question: rest,
                            isQuestionGroupQuestion: true
                        }
                    }

                });

                questionGroupQuestionsByCategory.map(question => {

                    if(question.parent_question_id.toString() !== '0') {

                        if(treeTemplate.items[`${question.parent_question_id}_group_${node.id}`] &&
                            treeTemplate.items[`${question.parent_question_id}_group_${node.id}`].data.question.selected_answer_id === question.question_answer_id) {

                            treeTemplate.items[`${question.parent_question_id}_group_${node.id}`].children.push(`${question.question_id}_group_${node.id}`);
                            treeTemplate.items[`${question.parent_question_id}_group_${node.id}`].hasChildren = true;
                        }

                    }

                });

            }

        }

    })

    return treeTemplate;
};


export const buildQuestionViewTree = data => {
    const questions = _.sortBy(_.values(data), 'question_order');
    const parentQuestionIds = questions.filter(item => item.parent_question_id.toString() === '0').map(question => question.question_id.toString());
    let treeTemplate = _.cloneDeep(treeTemplateMock);
    treeTemplate.items['1'].children = parentQuestionIds;

    questions.map(question => {

        let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } =question;

        treeTemplate.items[question.question_id] = {
            id: question.question_id.toString(),
            children: [],
            hasChildren: false,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: question.explanation.concat('-').concat(question.question_id),
                question: rest,
                [findQuestionType(question)]: true
            }
        }

    });

    questions.map(question => {
        if(question.parent_question_id.toString() !== '0') {

            if(treeTemplate.items[question.parent_question_id] &&
                treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

                treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
                treeTemplate.items[question.parent_question_id].hasChildren = true;
            }

        }

    });

    return treeTemplate;
};

const findQuestionType = question => {
    if(!question.is_custom && !question.question_groups) {
        return 'isSimplifyaQuestion';
    } else if(question.is_custom && !question.question_groups) {
        return 'isCustomQuestionCategoryQuestion';
    } else if(question.is_custom && question.question_groups) {
        return 'isQuestionGroupQuestion';
    }
}

const addSimplifyaQuestionsToSearch = (treeTemplate, data, simplifyaCategories) => {

    simplifyaCategories.forEach(category => {
        const simplifyaQuestions = _.sortBy(_.values(data).filter(item => item.category_id === category.category_id && !item.is_custom && !item.question_groups ), 'question_order');
        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: simplifyaQuestions.map(item => item.question_id),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id),
                isSimplifyaCategory: true
            }
        };

        simplifyaQuestions.forEach(question => {

            let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;

            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isSimplifyaQuestion: true
                }
            }

        });

    });
}

const addCustomQuestionsToSearch = (treeTemplate, data, customCategories) => {

    customCategories.forEach(category => {
        const customCategoryQuestions = _.sortBy(_.values(data).filter(question => question.is_custom && !question.question_groups && question.category_id === category.category_id), 'question_order');

        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: customCategoryQuestions.map(item => item.question_id),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id).concat('-custom'),
                isCustomQuestionCategory: true
            }
        };

        customCategoryQuestions.forEach(question => {
            let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;
            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isCustomQuestionCategoryQuestion: true
                }
            }
        });


    });
}

const addQuestionGroupQuestionsToSearch = (treeTemplate, data, questionGroups) => {
    const questionGroupQuestions = _.values(data).filter(question => question.is_custom && question.question_groups);
    questionGroups.forEach(group => {
        let questionGroupQuestionsByCategory = [];
        questionGroupQuestions.forEach(question => {
            if(question.question_groups.some(questionGroup => questionGroup.question_group_id === group.question_group_id)) {
                questionGroupQuestionsByCategory = [ ...questionGroupQuestionsByCategory , question];
            }
        });

        questionGroupQuestionsByCategory = _.sortBy(questionGroupQuestionsByCategory, `question_order_in_group_${group.question_group_id}`);

        treeTemplate.items['1'].children.push(group.question_group_id.toString());
        treeTemplate.items[group.question_group_id] = {
            id: group.question_group_id.toString(),
            children: questionGroupQuestionsByCategory.filter(item => item.parent_question_id.toString() === '0').map(item => `${item.question_id}_group_${group.question_group_id}`),
            hasChildren: true,
            isExpanded: false,
            isChildrenLoading: false,
            data: {
                title: group.question_group_name.concat('-').concat(group.question_group_id),
                isQuestionGroup: true
            }
        };

        questionGroupQuestionsByCategory.map(question => {
            let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;

            treeTemplate.items[`${question.question_id}_group_${group.question_group_id}`] = {
                id: `${question.question_id.toString()}_group_${group.question_group_id}`,
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: rest,
                    isQuestionGroupQuestion: true
                }
            }

        });

    });

}

const buildSearchTreeForCategoryView = (audit, data) => {
    let treeTemplate = _.cloneDeep(treeTemplateMock);
    const parentNodes = _.sortBy(audit.parent_question_nodes, 'node_order');
    const questionGroupQuestions = _.values(data).filter(question => question.is_custom && question.question_groups);

    parentNodes.forEach(node => {

        if(node.node_type === PARENT_NODE_TYPE_CATEGORY) {

            const categoryQuestions = _.sortBy(_.values(data).filter(item => item.category_id === node.id && !item.question_groups), 'question_order');

            if(categoryQuestions.length > 0) {
                treeTemplate.items['1'].children.push(node.id.toString());
                treeTemplate.items[node.id.toString()] = {
                    id: node.id.toString(),
                    children: categoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
                    hasChildren: true,
                    isExpanded: false,
                    isChildrenLoading: false,
                    data: {
                        title: node.name,
                        isCategory: true
                    }
                };

                categoryQuestions.map(question => {

                    let { citations, city, company_id, is_duplicate_from ,licenses, state, ...rest } =question;

                    treeTemplate.items[question.question_id] = {
                        id: question.question_id.toString(),
                        children: [],
                        hasChildren: false,
                        isExpanded: true,
                        isChildrenLoading: false,
                        data: {
                            title: question.explanation,
                            question: rest,
                            [findQuestionType(question)]: true
                        }
                    }
                });

            }

        }

        if(node.node_type === PARENT_NODE_TYPE_GROUP) {

            let questionGroupQuestionsByCategory = [];
            questionGroupQuestions.forEach(question => {
                if(question.question_groups.some(questionGroup => questionGroup.question_group_id === node.id)) {
                    questionGroupQuestionsByCategory = [ ...questionGroupQuestionsByCategory , question];
                }
            });

            questionGroupQuestionsByCategory = _.sortBy(questionGroupQuestionsByCategory, `question_order_in_group_${node.id}`);

            if(questionGroupQuestionsByCategory.length > 0) {
                treeTemplate.items['1'].children.push(node.id.toString());
                treeTemplate.items[node.id.toString()] = {
                    id: node.id.toString(),
                    children: questionGroupQuestionsByCategory.filter(item => item.parent_question_id.toString() === '0').map(item => `${item.question_id}_group_${node.id}`),
                    hasChildren: true,
                    isExpanded: false,
                    isChildrenLoading: false,
                    data: {
                        title: node.name,
                        isQuestionGroup: true
                    }
                };

                questionGroupQuestionsByCategory.map(question => {
                    let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;

                    treeTemplate.items[`${question.question_id}_group_${node.id}`] = {
                        id: `${question.question_id.toString()}_group_${node.id}`,
                        children: [],
                        hasChildren: false,
                        isExpanded: true,
                        isChildrenLoading: false,
                        data: {
                            title: question.explanation,
                            question: rest,
                            isQuestionGroupQuestion: true
                        }
                    }

                });
            }
        }

    })

    return treeTemplate;

}

const buildSearchTreeForQuestionView = questions => {
    let treeTemplate = _.cloneDeep(treeTemplateMock);
    treeTemplate.items['1'].children = questions.map(question => question.question_id);

    questions.map(question => {
        let { citations, city, company_id, is_duplicate_from ,licenses, state,  ...rest } = question;
        treeTemplate.items[question.question_id] = {
            id: question.question_id.toString(),
            children: [],
            hasChildren: false,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: question.explanation.concat('-').concat(question.question_id),
                question: rest,
                [findQuestionType(question)]: true
            }
        }
    });

    return treeTemplate;

}
