module.exports.guid = () => 'xxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 1e2) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
})