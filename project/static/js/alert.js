const alerts = [];

const $alert_container = document.querySelector('.alerts');

const alertCreate = (status, text) => {

    const obj = {
        status,
        text
    }

    const element = alertTemplate(obj);
    obj['element'] = element;
    alerts.push(obj);

    setTimeout(() => {
        setAlertActions(obj);
        $alert_container.append(element);
    }, alerts.length * 600);
} 

const setAlertActions = (obj) => {
    obj.element.querySelector('.close-alert').addEventListener('click', () => removeAlert(obj));
    setTimeout(() => removeAlert(obj), 5000);
}

const removeAlert = (obj) => {
    let idx = alerts.indexOf(obj);
    if(idx != -1){
        alerts.splice(idx, 1);
        
        const animation = [
            {opacity: 1, transform: 'translateX(0)'},
            {opacity: 0, transform: 'translateX(50px)'},
        ];
        const duration = 200;

        obj.element.animate(animation, {duration, fill: 'forwards'});
        setTimeout(() => obj.element.remove(), duration + 10);
    }
}

const alertTemplate = (obj) => {
    const {status, text} = obj;
    const element = document.createElement('div');
    element.className = `alert alert-${status} alert-dismissible fade show`;
    element.setAttribute('role', 'alert');
    element.innerHTML = `
        <p>${text}</p>
        <button type="button" class="close close-alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    `;
    return element;
}
