const previewFiles = {}; 
const sendFiles = {};

const imageTemplate = (url, editor = false) => {
    const element = document.createElement('div');
    element.className = 'media-img';
    element.style.backgroundImage = `url('${url}')`;
    if(editor)
        element.innerHTML = `
            <button type='button' class="btn btn-close"><i class="fa fa-close fa-lg"></i></button>
        `;  
    return element;
}

const imagePreview = async ($container, files) => {
    console.log($container)
    sendFiles[$container] = files
    const images = parseToArray(files).map(async file => await getUrl(file));
    Promise.all(images).then(result => {
        previewFiles[$container] = result;    
        imageRender($container, result, 'editor')
    });
} 

const imageRender = ($container, images, scenario = 'post') => {
    qs($container).style.display = 'flex';
    qs($container).innerHTML = '';

    const size = (images.length >= 4) ? 4 : images.length; 
    const arr = (images.length > 2) ? images.slice(0, size).chunk(2) : images; 

    arr.forEach(item => {
        if(images.length > 2){
            
            let $column = qs($container);
            
            if(item.length >= 2){
                $column = columnCreate();
                qs($container).append($column)
            }
            
            item.forEach(image => {
                let $element = imageTemplate(image, (scenario == 'editor') ? true : false);
                if(scenario == 'editor')
                    setImageAction($element, image, $container);
                $column.append($element);
            })
        }
        else{
            let $element = imageTemplate(item, (scenario == 'editor') ? true : false);
            if(scenario == 'editor')
                setImageAction($element, item, $container);
            qs($container).append($element);
        }
    })
}

const deleteElement = (image, $container) => {
    const idx = previewFiles[$container].indexOf(image);

    if(idx != -1)
        previewFiles[$container].splice(idx, 1);
    
    imageRender($container, previewFiles[$container], 'editor');
}

const setImageAction = ($element, image, $container) => {
    $element.querySelector('.btn-close').addEventListener('click', () => deleteElement(image, $container));
}

const getUrl = async (file) => {
    if(file){
        const promise = new Promise(resolve => {
            const reader = new FileReader();
            
            reader.readAsDataURL(file);

            reader.onloadend = function () {
                resolve(reader.result);
            }
        })
        return await promise;
    } 
    return 'assets/img/user-default.jpg';
}

const columnCreate = () => {
    const column = document.createElement('div');
    column.className = 'media-img-column';
    return column;
}

const parseToArray = (files) => {
    let array = [];
    for(let i = 0; i < files.length; i++)
        array.push(files[i]);
    return array;
}