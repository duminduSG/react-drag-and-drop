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

    let location = useLocation();
    const [tree, setTree] = useState({});
    const [searchValue, setSearchValue] = useState(null);
    const [isQuestionView, setIsQuestionView] = useState(false);
    const [questionList, setQuestionList] = useState({});

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

    useEffect(() => {
        if(searchValue) {
            setTree(initialTree(filterRawData(questionList)));
        }

    }, [searchValue]);

    const filterRawData = data => {
        if(searchValue) {
            return searchTree(searchValue, data);
        }
        return data;
    };

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
                <QuestionViewTree/> :
                <CategoryViewTree questionList={questionList}/>}
        </Container>
    );
}

export default App;
