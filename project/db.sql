DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS post_media;
DROP TABLE IF EXISTS surveys;
DROP TABLE IF EXISTS replies;
DROP TABLE IF EXISTS post_survey;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS survey_answers;
DROP TABLE IF EXISTS survey_questions;

-- --------------------------------------------------------

--
-- Структура таблицы comments
--

CREATE TABLE comments (
  id integer primary key autoincrement,
  comment text NOT NULL,
  user_id integer NOT NULL,
  post_id integer NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы likes
--

CREATE TABLE likes (
  id integer primary key autoincrement,
  user_id integer NOT NULL,
  post_id integer NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы posts
--

CREATE TABLE posts (
  id integer primary key autoincrement,
  content text NOT NULL,
  user_id integer NOT NULL,
  created timestamp NOT NULL default current_timestamp,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы post_media
--

CREATE TABLE post_media (
  id integer primary key autoincrement,
  post_id integer NOT NULL,
  url varchar(255) NOT NULL,
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы post_survey
--

CREATE TABLE post_survey (
  id integer primary key autoincrement,
  post_id integer NOT NULL,
  survey_id integer NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys (id),
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы replies
--

CREATE TABLE replies (
  id integer primary key autoincrement,
  user_id integer NOT NULL,
  post_id integer NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id),
  FOREIGN KEY (post_id) REFERENCES posts (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы surveys
--

CREATE TABLE surveys (
  id integer primary key autoincrement,
  title varchar(255) NOT NULL,
  user_id integer NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы survey_answers
--

CREATE TABLE survey_answers (
  id integer primary key autoincrement,
  survey_id integer not null,
  question_id integer NOT NULL,
  user_id integer NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys (id),
  FOREIGN KEY (question_id) REFERENCES survey_questions (id),
  FOREIGN KEY (user_id) REFERENCES users (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы survey_questions
--

CREATE TABLE survey_questions (
  id integer primary key autoincrement,
  question varchar(255) NOT NULL,
  survey_id integer NOT NULL,
  FOREIGN KEY (survey_id) REFERENCES surveys (id)
);

-- --------------------------------------------------------

--
-- Структура таблицы users
--

CREATE TABLE users (
  id integer primary key autoincrement,
  email varchar(255) unique NOT NULL,
  password varchar(255) NOT NULL,
  tag varchar(255) NOT NULL,
  username varchar(255) not null,
  phone varchar(255) NOT NULL,
  image varchar(255) NULL
);
