const simplifya = (treeTemplate, question) => {
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
}

const simplifyaParent = (treeTemplate, question) => {

    if(question.parent_question_id.toString() !== '0') {

        if(treeTemplate.items[question.parent_question_id] &&
            treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

            treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
            treeTemplate.items[question.parent_question_id].hasChildren = true;
        }

    }
}

/*let iterations = simplifyaQuestions.length % 8;
        let i = simplifyaQuestions.length -1;
        while(iterations){
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            iterations--;
        }
        iterations = Math.floor(simplifyaQuestions.length / 8);
        while(iterations){
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            simplifya(treeTemplate, simplifyaQuestions[i--]);
            iterations--;
        }

        let iterationsParent = simplifyaQuestions.length % 8;
        let j = simplifyaQuestions.length -1;
        while(iterationsParent){
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            iterationsParent--;
        }
        iterationsParent = Math.floor(simplifyaQuestions.length / 8);
        while(iterationsParent){
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            simplifya(treeTemplate, simplifyaQuestions[j--]);
            iterationsParent--;
        }*/

const custom = (treeTemplate, question) => {
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
            isCustomQuestionCategoryQuestion: true
        }
    }
}

const customParent = (treeTemplate, question) => {

    if(question.parent_question_id.toString() !== '0') {

        if(treeTemplate.items[question.parent_question_id] &&
            treeTemplate.items[question.parent_question_id].data.question.selected_answer_id === question.question_answer_id) {

            treeTemplate.items[question.parent_question_id].children.push(question.question_id.toString());
            treeTemplate.items[question.parent_question_id].hasChildren = true;
        }

    }
}


/*let iterations = customCategoryQuestions.length % 8;
        let i = customCategoryQuestions.length -1;
        while(iterations){
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            iterations--;
        }
        iterations = Math.floor(customCategoryQuestions.length / 8);
        while(iterations){
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            simplifya(treeTemplate, customCategoryQuestions[i--]);
            iterations--;
        }

        let iterationsParent = customCategoryQuestions.length % 8;
        let j = customCategoryQuestions.length -1;
        while(iterationsParent){
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            iterationsParent--;
        }
        iterationsParent = Math.floor(customCategoryQuestions.length / 8);
        while(iterationsParent){
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            simplifya(treeTemplate, customCategoryQuestions[j--]);
            iterationsParent--;
        }*/
