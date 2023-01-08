let http = require("axios");
let qs = require("qs");
let fs = require("fs");

// let dev = true;
let dev = false;

let host = dev ? "http://127.0.0.1:90/api/" : "http://10.8.1.25:100/api/";

const mock = (data, time = Math.random() * 2000) =>
    new Promise((resolve) => {
        setTimeout(() => resolve(data), time);
    });

// 程序主目录
let getMainContent = () => {
    let str = process.cwd();
    return str.replace(/\\/g, "/");
};
const codeMessage = {
    200: '服务器成功返回请求的数据。',
    201: '新建或修改数据成功。',
    202: '一个请求已经进入后台排队（异步任务）。',
    204: '删除数据成功。',
    400: '发出的请求有错误，服务器没有进行新建或修改数据的操作。',
    401: '用户没有权限（令牌、用户名、密码错误）。',
    403: '用户得到授权，但是访问是被禁止的。',
    404: '发出的请求针对的是不存在的记录，服务器没有进行操作。',
    406: '请求的格式不可得。',
    410: '请求的资源被永久删除，且不会再得到的。',
    422: '当创建一个对象时，发生一个验证错误。',
    500: '服务器发生错误，请检查服务器。',
    502: '网关错误。',
    503: '服务不可用，服务器暂时过载或维护。',
    504: '网关超时。',
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
const handleError = (
    error,
    option,
) => {
    const config = error.config || option || {};
    const str = config.params || config.data || {};
    const { id, nonce, ...params } = typeof str === 'string' ? qs.parse(str) : str;
    Reflect.deleteProperty(params, 'tstart2');
    Reflect.deleteProperty(params, 'tend2');
    Reflect.deleteProperty(params, 'tstart3');
    Reflect.deleteProperty(params, 'tend3');

    if (typeof error.message === 'undefined') {
        // 路由取消
        return null;
    }

    config.url += `${id ? `${id}/${nonce}` : ''}${params ? `?${qs.stringify(params)}` : ''}`;
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const { data, status } = error.response;
        // if (status === 401) {
        //   history.push('/unlogin');
        // }

        const errortext = (codeMessage[status] || '') + (data.msg || '');

        return {
            status,
            message: `请求错误: ${config.url}`,
            description: `${errortext || ''}`,
            url: error.config.url || '',
            params,
        };
    }
    if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        // console.log(error.request);
    }
    return {
        message: '请求错误',
        description: error.message || '',
        url: (config && config.url) || '',
        params,
    };
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
            return Promise.reject(handleError(e, option));
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
