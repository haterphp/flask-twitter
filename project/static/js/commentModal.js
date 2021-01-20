const modalBody = {
    'comment': ''
};

let init = true;

const setModalData = (news, $container, $element) => {
    const $modal = qs($container);
    const {id, content, user, created} = news;
    modalBody['comment'] = '';

    $modal.querySelector('.profile-img').style.backgroundImage = `url('${(user.image) ? `/static/upload/${user.image}` : '/static/img/user-default.jpg'}')`;
    $modal.querySelector('.profile-name').innerHTML = user.username;
    $modal.querySelector('.profile-tag').innerHTML = `@${user.tag}`;
    $modal.querySelector('.time').innerHTML = created;
    $modal.querySelector('.news-body p').innerHTML = content;
    $modal.querySelector('.comment').addEventListener('input', input.bind(null, modalBody, 'comment', null))
    console.log(id)
    if(init){
        $modal.querySelector('.send').addEventListener('click', sendModalRequest.bind(null, id, qs('#commentModal')));
        init = false;
    }

};

const sendModalRequest = async (id, $modal) => {
    event.preventDefault()
    $modal.querySelector('.comment').classList.remove('is-invalid')
    const result = await fetch(`/news/${id}/comment`, {method: 'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(modalBody)}).then(res => res.json())

    if(result.code == 422){
        $modal.querySelector('.comment').classList.add('is-invalid')
        $modal.querySelector('.comment + .invalid-feedback').innerHTML = result.errors['comment']
    }

    if(result.code == 200){
        await getNews();
        $modal.querySelector('.comment').classList.remove('is-invalid');
        $modal.querySelector('.comment').value = '';
        $(`#${$modal.id}`).modal('hide');
        alertCreate('success', result.message)
    }
    qs('#message_send').removeEventListener('click', sendModalRequest.bind(null, id, $modal))
};