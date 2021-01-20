import os
import json
from datetime import datetime

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app

from werkzeug.utils import secure_filename
from project.componets.random_tag import random_string_generator

from project.db import get_db, dict_factory
from project.bp.auth import auth

bp = Blueprint('news', __name__, url_prefix='/news')

@bp.route('/home', methods=['GET'])
@auth
def home():
    return render_template('blog/home.html')

@bp.route('/create', methods=['POST'])
@auth
def create():
    errors = dict()
    db = get_db().cursor()

    if not request.form.get('content'):
        errors['content'] = 'Поле обязательное'

    if request.form.get('survey'):
        survey = json.loads(request.form['survey'])
        errors['survey'] = dict()

        if not survey.get('title'):
            errors['survey']['title'] = 'Поле обязательное'

        if survey['questions']:
            errors['survey']['questions'] = dict()
            for idx, question in enumerate(survey.get('questions')):
                if not question['content']:
                    errors['survey']['questions'][idx] = 'Поле Обязательное'
            if len(errors['survey']['questions']) == 0:
                errors['survey'].pop('questions')
        else:
            errors['survey']['questions_much'] = 'В опросе должен быть как минимум один вопрос'

        if len(errors['survey']) == 0:
            errors.pop('survey')

    if len(errors) > 0:
        return jsonify({'code': 422, 'errors': errors})

    db.execute(
        'insert into posts (`content`, `user_id`, `created`) values(?,?,?)',
        (request.form.get('content'), g.user['id'], datetime.now(),)
    )

    post_id = db.lastrowid

    if len(request.files) > 0:
        for file in request.files:
            filename = secure_filename(
                random_string_generator(10) + os.path.splitext(request.files[file].filename)[1])
            request.files[file].save(os.path.join(current_app.name + '/static/upload/post_images', filename))
            db.execute(
                'insert into post_media (`post_id`, `url`) values(?,?)',
                (post_id, filename,)
            )

    if request.form.get('survey'):
        survey = json.loads(request.form['survey'])

        db.execute(
            'insert into surveys (`title`, `user_id`) values(?,?)',
            (survey['title'], g.user['id'],)
        )

        survey_id = db.lastrowid

        for question in survey['questions']:
            db.execute(
                'insert into survey_questions (`question`, `survey_id`) values(?,?)',
                (question['content'], survey_id,)
            )
        db.execute(
            'insert into post_survey (`post_id`, `survey_id`) values(?,?)',
            (post_id, survey_id,)
        )

    get_db().commit()

    return jsonify({'code': 200, 'message': 'Пост успешно создан'})

def post_likes(id):
    db = get_db()
    db.row_factory = dict_factory
    cur = db.cursor()

    likes = cur.execute(
        'select id from likes where post_id = ?',
        (id,)
    ).fetchall()
    return len(likes)

def post_like(id):
    db = get_db()
    db.row_factory=dict_factory
    cur = db.cursor()

    like = None

    if cur.execute(
        'select id from likes where user_id = ? and post_id = ?',
        (g.user['id'], id)
    ).fetchone() is None:
        like = False
    else:
        like = True

    return like

@bp.route('/posts/index', methods=['GET'])
@auth
def index():

    db = get_db()
    db.row_factory=dict_factory
    cur = db.cursor()
    result = []
    fillable = ['id', 'content', 'created', 'user', 'survey', 'post_media', 'like', 'likes', 'comments']

    posts = cur.execute(
        'select *'
        'from posts order by created DESC'
    ).fetchall()

    for post in posts:
        p = dict()
        for field in fillable:
            value = post.get(field)
            if field == 'created':
                format = '%Y-%m-%d %H:%M:%S'
                value = value.strftime(format)
            if field == 'user':
                value = cur.execute(
                    'select * from users where id = ?',
                    (post['user_id'],)
                ).fetchone()
            if field == 'post_media':
                value = cur.execute(
                    'select * from post_media where post_id = ?',
                    (post['id'],)
                ).fetchall()
            if field == 'survey':
                value = dict()
                survey_id = cur.execute(
                    'select survey_id from post_survey where post_id = ?',
                    (post['id'], )
                ).fetchone()
                if survey_id:
                    survey_id = survey_id['survey_id']
                    value['id'] = survey_id
                    value['answer'] = None
                    find_answer = cur.execute(
                        'select question_id from survey_answers where user_id = ? and survey_id = ?',
                        (g.user['id'], survey_id,)
                    ).fetchone()
                    if find_answer:
                        value['answer'] = find_answer['question_id']
                    value['title'] = cur.execute(
                        'select title from surveys where id = ?',
                        (survey_id,)
                    ).fetchone()['title']
                    value['questions'] = cur.execute(
                        'select id, question from survey_questions where survey_id = ?',
                        (survey_id,)
                    ).fetchall()
                    value['answers'] = dict()
                    for question in value['questions']:
                        value['answers'][question['id']] = len(cur.execute(
                            'select id from survey_answers where question_id = ?',
                            (question['id'],)
                        ).fetchall())
                else:
                    value = None
            if field == 'like':
                value = post_like(post['id'])
            if field == 'likes':
                value = post_likes(post['id'])
            if field == 'comments':
                value = get_comments(post['id'])
            p[field] = value
        result.append(p)

    return jsonify({'code': 200, 'posts': json.dumps(result)})

@bp.route('/like/<int:id>/toggle', methods=['POST'])
@auth
def like_toggle(id):
    db = get_db()
    db.row_factory=dict_factory
    cur = db.cursor()

    like = post_like(id)

    if not like:
        cur.execute(
            'insert into likes (`user_id`,`post_id`) values(?,?)',
            (g.user['id'], id,)
        )
        like = True
    else:
        cur.execute(
            'DELETE FROM likes WHERE post_id = ? and user_id = ?',
            (id, g.user['id'],)
        )
        like = False

    db.commit()

    return jsonify({'code': 200, 'like': like, 'likes': post_likes(id)})

def get_comments(id):
    db = get_db()
    db.row_factory = dict_factory
    cur = db.cursor()
    result = []
    fillable = ['id', 'comment', 'user']

    comments = cur.execute(
        'select id, comment, user_id from comments'
    ).fetchall()

    print(comments)

    for comment in comments:
        p = dict()
        for field in fillable:
            value = comment.get(field)
            if field == 'user':
                value = db.execute(
                    'select * from users where id = ?',
                    (comment.get('user_id'), )
                ).fetchone()
            p[field] = value
        result.append(p)

    return result
@bp.route('/<int:id>/comment', methods=['POST'])
@auth
def set_comment(id):
    db = get_db()
    db.row_factory=dict_factory
    cur = db.cursor()
    errors = dict()

    if not request.json.get('comment'):
        errors['comment'] = 'Поле обязательное'

    if len(errors) > 0:
        return jsonify({'code': 422, 'errors': errors})

    cur.execute(
        'insert into comments (`user_id`, `post_id`, `comment`) values(?,?,?)',
        (g.user['id'], id, request.json.get('comment'),)
    )
    db.commit()

    return jsonify({'code': 200, 'message': 'Комментарий оставлен'})