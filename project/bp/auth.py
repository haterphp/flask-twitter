import functools
import os

from flask import Blueprint, flash, g, redirect, render_template, request, session, url_for, jsonify, current_app

from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.utils import secure_filename

from project.db import get_db
from project.componets.random_tag import random_string_generator

bp = Blueprint('auth', __name__)

def auth(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))
        return view(**kwargs)
    return wrapped_view

def user_logged(view):
    @functools.wraps(view)
    def wrapped(**kwargs):
        if g.user:
            return redirect(url_for('news.home'))
        return view(**kwargs)
    return wrapped

@bp.route('/', methods=('GET', 'POST'))
@user_logged
def login():
    if request.method == "POST":
        errors = dict()
        db = get_db()
        fillable = ['email', 'password']

        for field in fillable:
            if not request.form[field]:
                errors[field] = 'Поле обязательное'

        user = db.execute(
            'SELECT * FROM users WHERE email = ?', (request.form['email'],)
        ).fetchone()

        if (user is None) or (user and not check_password_hash(user['password'], request.form['password'])):
            errors['email'] = 'Неверные Логин или Пароль'
            errors['password'] = 'Неверные Логин или Пароль'

        flash(errors)

        if len(errors) == 0:
            session.clear()
            session['user'] = user['id']
            return redirect(url_for('news.home'))

    return render_template('auth/login.html')

@bp.route('/register', methods=('GET', 'POST'))
@user_logged
def register():
    if request.method == 'POST':
        errors = dict()
        file = None
        db = get_db()

        fillable = ['username', 'password', 'email', 'phone', 'image', 'password-repeat']

        for field in [item for item in fillable if item != 'image']:
            if not request.form[field]:
                errors[field] = 'Поле Обязательно'

        if db.execute(
            'select id from users where email = ?', (request.form['email'],)
        ).fetchone() is not None:
            errors['email'] = 'Данная почта занята'

        if request.form['password'] != request.form['password-repeat']:
            errors['password-repeat'] = 'Пароли не совпадают'

        flash(errors)

        if len(errors) == 0:
            if request.files['image']:
                file = secure_filename(
                    random_string_generator(10) + os.path.splitext(request.files['image'].filename)[1])
                request.files['image'].save(os.path.join(current_app.name + '/static/upload', file))

            db.execute(
                'insert into users (`username`, `password`, `email`, `phone`, `image`, `tag`) values (?, ?, ?, ?, ?, ?)',
                (request.form['username'], generate_password_hash(request.form['password']), request.form['email'],
                 request.form['phone'], file, random_string_generator(10),)
            )
            db.commit()
            return redirect(url_for('auth.login'))

    return render_template('auth/register.html')

@bp.before_app_request
def load_logged_in_user():
    user = session.get('user')
    if user is None:
        g.user = None
    else:
        g.user = get_db().execute(
            'SELECT * FROM users WHERE id = ?', (user,)
        ).fetchone()


@bp.route('/logout')
@auth
def logout():
    session.clear()
    return redirect(url_for('auth.login'))