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
        _.values(data).map(question => {return {category_id: question.category_id, category_name: question.category_name}}),
        'category_id'
    );
}
;

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
    const uniqueCategories = getUniqueCategories(data);

    uniqueCategories.map(category => {

        const categoryQuestions = _.values(data).filter(item => item.category_id === category.category_id);
        treeTemplate.items['1'].children.push(category.category_id.toString());
        treeTemplate.items[category.category_id] = {
            id: category.category_id.toString(),
            children: categoryQuestions.filter(item => item.parent_question_id.toString() === '0').map(item => item.question_id),
            hasChildren: true,
            isExpanded: true,
            isChildrenLoading: false,
            data: {
                title: category.category_name.concat('-').concat(category.category_id)
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
                    question: {...question}
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

    return treeTemplate;
};
