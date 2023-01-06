let moment = require('moment');

const now = () => moment().format('YYYY-MM-DD HH:mm:ss');
const ymd = () => moment().format('YYYYMMDD');
module.exports.now = now;
module.exports.ymd = ymd;


module.exports.guid = () => 'xxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 1e2) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
})

module.exports.getIntervalTime = taskItem => {
    let time = taskItem.time;
    let unit = 1
    switch (taskItem.unit.toLowerCase()) {
        case 'day':
        case 'd':
            unit = 3600 * 24;
            break;
        case 'hour':
        case 'h':
            unit = 3600;
            break;
        case 'min':
        case 'm':
        case 'minute':
            unit = 60;
            break;
        case 's':
        case 'second':
        default:
            unit = 1
            break;

    }
    return time * unit * 1000
}
