const newsRender = (newses, $container) => {
    console.log(newses);
    qs($container).innerHTML = '';
    newses.forEach(news => {
        const $element = newsTemplate(news);
        $element.querySelector('.like').addEventListener('click', newsLike.bind(null, news, $element))
        $element.querySelector('.comment').addEventListener('click', toggleCommentModal.bind(null, news, '#commentModal'))
        qs($container).append($element)
        if(news.survey)
            appendSurvey($element.querySelector('.survey-content'), news.survey)
        if(news.post_media.length)
            imageRender(`#media-content-${news.id}`, news.post_media.map(item => `/static/upload/post_images/${item.url}`))
    })
}

const newsTemplate = (news) => {
    const {id, content, user, post_media, survey, created, like, likes, comments} = news
    const element = document.createElement('div');
    element.className = 'news';
    element.innerHTML = `
            <div class="profile-img" style="background-image: url('${(user.image) ? `/static/upload/${user.image}` : '/static/img/user-default.jpg'}')">
            </div>
            <div class="content">
                <div class="news-header">
                    <div>
                        <p class="profile-name">${user.username}</p>
                        <a class="profile-tag" href="#">@${user.tag}</a>
                    </div>
                    <p class="time">${created}</p>
                </div>
                <div class="news-body">
                    <p>${content}</p>
                    <div class="media-content" id="media-content-${id}">
                    </div>
                    <div class="survey-content">
                    </div>
                </div>
                <div class="news-footer">
                    <div class="footer-item">
                        <a class="like ${like ? 'active' : ''}"><i class="fa fa-heart-o fa-lg"></i></a>
                        <p>${likes}</p>
                    </div>
                    <div class="footer-item">
                        <a class="comment"><i class="fa fa-comment-o fa-lg"></i></a>
                        <p>${comments.length}</p>
                    </div>
                    <div class="footer-item d-none">
                        <a class="retweet"><i class="fa fa-retweet fa-lg"></i></a>
                        <p>0</p>
                    </div>
                </div>
            </div>
    `;
    return element;
}

const newsLike = async (news, $element) => {
    const result = await fetch(`/news/like/${news.id}/toggle`, {method:"POST", headers:{}}).then(res=>res.json())
    if(result.code == 200){
        if(result.like)
            $element.querySelector('.like').classList.add('active')
        else
            $element.querySelector('.like').classList.remove('active')
        $element.querySelector('.like + p').innerHTML = result.likes
    }
}

const toggleCommentModal = (news, $modal) => {
    setModalData(news, $modal);
    $($modal).modal('show');

}