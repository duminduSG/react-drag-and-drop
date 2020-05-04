import React, {useState, useEffect} from 'react';
import styled from 'styled-components';
import firebase from './firebase';
import axios from 'axios';
import {initialTree, searchTree} from './utils/tree-generation';
import { useLocation } from 'react-router-dom'
import QuestionViewTree from './QuestionViewTree';
import CategoryViewTree from './CategoryViewTree';
import BitbucketBranchesIcon from '@atlaskit/icon/glyph/bitbucket/branches';
import EditorBulletListIcon from '@atlaskit/icon/glyph/editor/bullet-list';

const Container = styled.div`
  display: flex;
`;

function App() {

    const [searchValue, setSearchValue] = useState('');
    const [isQuestionView, setIsQuestionView] = useState(false);
    const [questionList, setQuestionList] = useState({});
    const [audit, setAudit] = useState({});

    useEffect(() => {

        axios.get(process.env.REACT_APP_BACKEND_URL, {
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
                            .ref(`audits/2085/5ea7f3c1d56721001b64f4ce`)
                            .on('value', snapshot => {
                                console.log(snapshot.val());
                                setAudit(snapshot.val());
                            });

                        firebase
                            .database()
                            .ref(`audit_questions/2085/5ea7f3c1d56721001b64f4ce`)
                            .on('value', snapshot => {
                                //console.log(snapshot.val())
                                setQuestionList(snapshot.val());
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

    return (
        <Container>
            <div><input
                placeholder="Search Questions"
                onChange={e => setSearchValue(e.target.value)}
            />
            </div>
            {isQuestionView ?
                (<span onClick={() => setIsQuestionView(!isQuestionView)}><EditorBulletListIcon/></span>) :
                (<span onClick={() => setIsQuestionView(!isQuestionView)}><BitbucketBranchesIcon/></span>)}
            {isQuestionView ?
                <QuestionViewTree questionList={questionList} searchValue={searchValue}/> :
                <CategoryViewTree audit={audit} questionList={questionList} searchValue={searchValue}/>}
        </Container>
    );
}

export default App;
