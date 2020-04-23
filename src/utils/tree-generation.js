import * as _ from 'lodash';
import question from "@atlaskit/icon/glyph/question";

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
            .filter(question => question.is_custom).map(question => {return {category_id: question.category_id, category_name: question.category_name}}),
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

const addCustomCategoryQuestionsToTree = (treeTemplate, data, customCategories) => {
    customCategories.forEach(category => {
        const customCategoryQuestions = _.values(data).filter(question => question.is_custom && !question.question_groups && question.category_id === category.category_id);

        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: customCategoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id).concat('-custom'),
                isCustomQuestionCategory: true
            }
        };

        customCategoryQuestions.map(question => {


            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: {...question},
                    isCustomQuestionCategoryQuestion: true
                }
            }


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


        treeTemplate.items['1'].children.push(group.question_group_id.toString());
        treeTemplate.items[group.question_group_id] = {
            id: group.question_group_id.toString(),
            children: questionGroupQuestionsByCategory.filter(item => item.parent_question_id.toString() === '0').map(item => `${item.question_id}_group_${group.question_group_id}`),
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: group.question_group_name.concat('-').concat(group.question_group_id),
                isQuestionGroup: true
            }
        };

        questionGroupQuestionsByCategory.map(question => {


            treeTemplate.items[`${question.question_id}_group_${group.question_group_id}`] = {
                id: `${question.question_id.toString()}_group_${group.question_group_id}`,
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: {...question},
                    isQuestionGroupQuestion: true
                }
            }


            if(question.parent_question_id.toString() !== '0') {

                if(treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`] &&
                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].data.question.selected_answer_id === question.question_answer_id) {

                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].children.push(`${question.question_id}_group_${group.question_group_id}`);
                    treeTemplate.items[`${question.parent_question_id}_group_${group.question_group_id}`].hasChildren = true;
                }

            }

        });

        //console.log(questionGroupQuestionsByCategory)
    });

}

export const searchTree = (searchValue, data) => {
    const selectedAllQuestions = _.values(data).filter(
        question =>
            (question.question.toLowerCase().includes(searchValue.toLowerCase()) ||
                question.explanation.toLowerCase().includes(searchValue.toLowerCase()))
    );

    const selectedParentQuestions = selectedAllQuestions.filter(question => question.parent_question_id.toString() === '0');
    const selectedChildQuestions = selectedAllQuestions.filter(question => question.parent_question_id.toString() !== '0');

    const selectedParentQuestionsIds = selectedParentQuestions.map(question => question.question_id);
    const selectedChildQuestionsParentIds = selectedChildQuestions.map(question => question.parent_question_id);

    let childQuestionsOfParentQuestions = [];
    let parentQuestionsOfChildQuestions = [];

    _.values(data).forEach(question => {
        if(question.parent_question_id.toString() !== '0' && selectedParentQuestionsIds.includes(question.parent_question_id)){
            childQuestionsOfParentQuestions.push(question)
        }

        if(question.parent_question_id.toString() === '0' && selectedChildQuestionsParentIds.includes(question.question_id)){
            parentQuestionsOfChildQuestions.push(question)
        }
    });

    const uniqQuestions = _.uniqBy([...selectedAllQuestions, ...childQuestionsOfParentQuestions, ...parentQuestionsOfChildQuestions], 'question_id');

    return  _.sortBy(uniqQuestions, ['question_id']);


};

export const initialTree = data => {
    let treeTemplate = _.cloneDeep(treeTemplateMock);
    const uniqueCategories = _.sortBy(getUniqueCategories(data), 'category_order');
    const customCategories = getCustomCategories(data);
    const questionGroups = getQuestionGroups(data);

    uniqueCategories.map(category => {

        const categoryQuestions = _.sortBy(_.values(data).filter(item => item.category_id === category.category_id && !question.is_custom && !question.question_groups ), 'question_order');
        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: categoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id),
                isSimplifyaCategory: true
            }
        };

        categoryQuestions.map(question => {


            treeTemplate.items[question.question_id] = {
                id: question.question_id.toString(),
                children: [],
                hasChildren: false,
                isExpanded: true,
                isChildrenLoading: false,
                data: {
                    title: question.explanation.concat('-').concat(question.question_id),
                    question: {...question},
                    isSimplifyaQuestion: true
                }
            }


            if(question.parent_question_id.toString() !== '0') {

                if(treeTemplate.items[question.parent_question_id] &&
                    treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

                    treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
                    treeTemplate.items[question.parent_question_id].hasChildren = true;
                }

            }

        });

    });

    if(customCategories.length > 0) {
        addCustomCategoryQuestionsToTree(treeTemplate, data, customCategories);
    }

    if(questionGroups.length > 0) {
        addQuestionGroupQuestionsToTree(treeTemplate, data, questionGroups);
    }



    return treeTemplate;
};
