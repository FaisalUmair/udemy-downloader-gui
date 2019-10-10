const remote = window.require("electron").remote;
const nedb = remote.getGlobal('nedb');
const userData = remote.getGlobal('userData');
const settings = new nedb({ filename: userData+'/settings.db',autoload: true});

export {settings};