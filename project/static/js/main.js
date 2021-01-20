Array.prototype.chunk = function(groupsize){
    var sets = [], chunks, i = 0;
    chunks = Math.ceil(this.length / groupsize);

    while(i < chunks){
        sets[i] = this.splice(0, groupsize);
	    i++;
    }
    return sets;
};

const qs  = (selector) => document.querySelector(selector)
const qsa  = (selector) => document.querySelectorAll(selector)

const getStorage = (name) => JSON.parse(localStorage.getItem(name))
const setStorage = (name, value) => localStorage.setItem(name, JSON.stringify(value))

const input = (obj, attr, callback = null) => {
    obj[attr] = event.target.value;
    if(callback)
        callback();
}