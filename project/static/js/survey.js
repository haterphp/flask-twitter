const surveys = {};

const createSurvey = ($container) => {
    qs($container).innerHTML = '';
    qs($container).style.display = 'block';

    const survey = {
        'title': '',
        'questions': [
            {
                'content': ''
            },
            {
                'content': ''
            }
        ]
        
    };

    survey['element'] = getSurveyTemplate();;
    surveys[$container] = survey;

    setSurveyActions(survey, $container);
    questionsRender(survey, $container);
    qs($container).append(survey['element']);
}

const questionsRender = (survey, $container) => {
    survey.element.querySelector('.questions-container').innerHTML = '';
    survey.questions.forEach((question, index) => {
        question['element'] = getQuestionTemplate(question, index);
        setQuestionActions(question, $container);
        survey.element.querySelector('.questions-container').append(question['element']);
    });
}

const getSurveyTemplate = () => {
    const element = document.createElement('div');
    element.className = 'survey';
    element.innerHTML = `
        <div class="form-group">
            <input type="text" class="form-control form-main title" placeholder="Заголовок Опроса" name="survey-name">
            <small class="invalid-feedback"></small>
        </div>
        <div class="form-group questions">
            <h3 style="margin-bottom: 10px;">Вопросы:</h3>
            <div class="form-group">
                <button class="btn btn-dark add-question" style="font-size: 14px;" type="button">Добавить вопрос</button>
            </div>
            <div class="questions-container">
            </div>
        </div>
        <button type="button" class="btn btn-danger btn-block survey-remove">Удалить опрос</button>
    `;
    return element;
}

const getQuestionTemplate = (question, number) => {
    const element = document.createElement('div')
    element.className = 'form-group';
    element.innerHTML = `
        <div class="w-100" style="margin-right: 15px">
            <input type="text" class="form-control form-main question" placeholder="Вопрос" value="${question.content}" name="questions[${number}]">
            <small class="invalid-feedback"></small>
        </div>
        <button type="button" class="btn btn-danger question-remove">Удалить</button>
    `;
    return element;
}

const createQuestion = (survey, $container) => {
    survey.questions.push({'content' : ''});
    questionsRender(survey, $container);
}

const deleteSurvey = (survey, $container) => {
    delete surveys[$container];
    survey.element.remove();
}

const deleteQuestion = (question, $container) => {
    console.log($container)
    const idx = surveys[$container].questions.indexOf(question);
    if(idx != -1)
        surveys[$container].questions.splice(idx, 1);
    questionsRender(surveys[$container], $container);
}

const setSurveyActions = (survey, $container) =>{
    survey.element.querySelector('.title').addEventListener('input', input.bind(null, survey, 'title', null));
    survey.element.querySelector('.add-question').addEventListener('click', createQuestion.bind(null, survey, $container));
    survey.element.querySelector('.survey-remove').addEventListener('click', deleteSurvey.bind(null, survey, $container));
} 

const setQuestionActions = (question, $container) => {
    question.element.querySelector('.question').addEventListener('input', input.bind(null, question, 'content', null));
    question.element.querySelector('.question-remove').addEventListener('click', deleteQuestion.bind(null, question, $container));
}

const appendSurvey = ($container, survey) => {
    const template = (survey) => {
        const element = document.createElement('div')
        element.className = 'survey-main';
        element.innerHTML = `
            <div class="survey-title">
                <h2>${survey.title}</h2>
            </div>
            <div class="survey-answers">
            </div>
        `;
        return element;
    }

    const questionTemplate = (question) => {
        const element = document.createElement('button');
        element.className = `btn btn-block btn-outline-light answer answer-${question.id}`
        element.innerHTML = `
            ${question.question} <span class="much_peoples">0</span>
        `;
        return element
    }

    const closeSurvey = (id) => {
        survey['answer'] = id
        $element.querySelectorAll('.answer').forEach(item => item.disabled = true);
        $element.querySelector(`.answer-${id}`).classList.add('active');
        $element.querySelector('.survey-answers').classList.add('results');
        console.log(survey)
    }

    const $element = template(survey);
    survey.questions.forEach(question => {
        const $question = questionTemplate(question);
        $question.addEventListener('click', async (event) => {
            if(!survey.answer){
                const body = {
                    'survey_id': survey['id'],
                    'question_id' : +event.target.classList[event.target.classList.length - 1].replace(/answer-/gi, '')
                }
                let result = await fetch('/survey/update', {method: 'POST', headers:{'Content-Type': 'application/json'}, body: JSON.stringify(body)}).then(res => res.json())

                if (result.code == 422){
                    alertCreate('danger', result.message)
                }

                if(result.code == 200){
                    $element.querySelectorAll('.answer').forEach(answer => {
                        const id = answer.classList[answer.classList.length - 1].replace(/answer-/gi, '');
                        answer.querySelector('.much_peoples').innerHTML = result.answers[id]
                    })
                    closeSurvey(body['question_id'])
                    alertCreate('success', result.message)
                }
            }
        })
        $element.querySelector('.survey-answers').append($question)
    })
    if(survey.answer){
        $element.querySelectorAll('.answer').forEach(answer => {
            const id = answer.classList[answer.classList.length - 1].replace(/answer-/gi, '');
            answer.querySelector('.much_peoples').innerHTML = survey.answers[id]
        })
        closeSurvey(survey.answer)
    }
    $container.append($element);
}