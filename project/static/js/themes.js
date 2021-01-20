let theme = getStorage('theme') || 'light';
const colors = [...qsa('.color')].map(color => color.classList[1]);


const changeTheme = (color) => {
    qsa('.color').forEach(item => {
        item.classList.remove('active');
        if(item.classList.contains(color))
            item.classList.add('active');
    });
    
    theme = color;
    setStorage('theme', theme);

    colors.forEach(color => qs('body').classList.remove(color));
    qs('body').classList.add(theme);
}

const renderTheme = () => {
    changeTheme(theme);
    setThemeRender();
}

const setThemeRender = () => {
    qsa('.color').forEach(color => {
        color.addEventListener('click', (ev) => changeTheme(ev.target.classList[1]))
    })
}

renderTheme();