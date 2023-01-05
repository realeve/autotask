let http = require("axios");
let qs = require("qs");
let fs = require("fs");

// let dev = true;
let dev = false;

let host = dev ? "http://127.0.0.1:90/api/" : "http://api.cbpc.ltd/";

const mock = (data, time = Math.random() * 2000) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(data), time);
    });

// 程序主目录
let getMainContent = () => {
    let str = process.cwd();
    return str.replace(/\\/g, "/");
};


// 判断数据类型，对于FormData使用 typeof 方法会得到 object;
let getType = (data) =>
    Object.prototype.toString
        .call(data)
        .match(/\S+/g)[1]
        .replace("]", "")
        .toLowerCase();

const handleUrl = (option) => {
    if (typeof option === 'string') {
        return { url: option }
    }
    if (option.url && (option.url[0] === '.' || option.url.slice(0, 6) === '/mock/')) {
        option.url = window.location.origin + option.url.slice(option.url[0] === '.' ? 1 : 0);
    }
    return option;
};


// 自动处理token更新，data 序列化等
let axios = async (_option) => {
    let option = handleUrl(_option)
    option = Object.assign(option, {
        method: option.method || "get",
    });
    return await http
        .create({
            baseURL: host,
            timeout: 10000,
            transformRequest: [
                function (data) {
                    let dataType = getType(data);
                    switch (dataType) {
                        case "object":
                        case "array":
                            data = qs.stringify(data);
                            break;
                        default:
                            break;
                    }
                    return data;
                },
            ],
        })(option)
        .then(res => res.data)
        .catch((e) => {
            console.log(e);
            return Promise.reject(e);
        });
};

module.exports = {
    axios,
    dev,
    getMainContent,
    mock,
    DEV: dev,
    _commonData: {
        rows: 1,
        data: [{ affected_rows: 1, id: Math.ceil(Math.random() * 100) }],
        time: 20,
        ip: "127.0.0.1",
        title: "数据更新/插入/删除返回值",
    },
};
