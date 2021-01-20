import os
import json


from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app

from project.db import get_db, dict_factory
from project.bp.auth import auth

bp = Blueprint('survey', __name__, url_prefix='/survey')

@bp.route('/update', methods=['POST'])
@auth
def update():
    db = get_db()
    db.row_factory=dict_factory
    cur = db.cursor()

    if cur.execute(
        'select id from survey_answers where survey_id = ? and user_id = ?',
            (request.json.get('survey_id'), g.user['id'],)
    ).fetchone() is not None:
        return jsonify({'code': 422, 'message': 'Опрос уже был пройден'})

    cur.execute(
        'insert into survey_answers (`question_id`, `user_id`, `survey_id`) values(?,?,?)',
        (request.json.get('question_id'), g.user['id'], request.json.get('survey_id'),)
    )
    db.commit()

    answer_results = dict()
    questions = cur.execute(
        'select id from survey_questions where survey_id = ?',
        (request.json.get('survey_id'),)
    ).fetchall()

    for question in questions:
        question = question['id']
        answers = cur.execute(
            'select id from survey_answers where question_id = ?',
            (question,)
        )
        answer_results[question] = len(answers.fetchall())

    return jsonify({'code': 200, 'message': 'Опрос пройден', 'answers': answer_results})
