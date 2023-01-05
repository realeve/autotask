
const { clearInterval } = require("timers");
const { axios } = require("./utils/axios");

const lib = require('./utils/lib')

// 任务配置
let task = [{
    id: 1,
    title: '自动同步数据',
    author: 'develop',
    time_type: 'interval',
    time: '10',
    unit: 's',
    /** 触发API */
    api: '/1614/686828a245.json',
    api_data_callback: `return {
        value2:data.value*2,
        ...data
    }
    `,
    item_handler: "",
    valid: true,
}, {
    id: 2,
    title: '获取品种列表',
    author: 'develop',
    time_type: 'timeout',
    time: '6',
    unit: 's',
    /** 触发API */
    api: '/1517/7452525046.json',
    api_data_callback: `return {
        value4:data.value*4,
        ...data
    }
    `,
    item_handler: "",
    valid: true,
}]




const getFn = (str = 'return data') => eval(`data=>{
    ${str}
}
`)

const getIntervalTime = taskItem => {
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



const timeFns = {}

/**
 * 执行一条任务
 * @param {*} taskItem 任务信息
 * @returns timeId
 */
const taskHandler = taskItem => {

    // 记录 Interval Id
    let key = taskItem.id
    timeFns[key] = 0;

    // 定时时间
    let time = getIntervalTime(taskItem)

    // 数据获取后对每条数据处理的回调
    let apiCallback = getFn(taskItem.api_data_callback)

    const taskFn = async () => {
        // 数据触发任务,触发后执行回调
        let data = await axios(taskItem.api).then(res => res.data.map(apiCallback))
        console.log(data)
    }

    switch (taskItem.time_type) {
        case 'interval':
            // 执行一次任务
            taskFn()
            // 几分钟后触发定时任务执行一次
            timeFns[key] = setInterval(taskFn, time);
            console.log(`${taskItem.title}:每隔${time / 1000}秒执行一次：${timeFns[key]}`)
            break;
        case 'timeout':
            timeFns[key] = setTimeout(() => {
                taskFn();

                // timeout 执行成功后，移除该属性
                // 移除key
                Reflect.deleteProperty(timeFns, key)
            }, time);
            console.log(`${taskItem.title}:${time / 1000}秒后执行一次：${timeFns[key]}`)
            break;
    }

    return key;
}

/**
 * 关闭任务
 * @param {*} key 任务key
 */
const closeTask = key => {
    console.log(`关闭任务${key}`)
    let timeId = timeFns[key]
    let closeFn = timeId._repeat == null ? clearTimeout : clearInterval
    closeFn(timeId)

    // 移除key
    Reflect.deleteProperty(timeFns, key)
}

const handler = async () => {
    // 并发执行所有任务
    let taskIds = task.map(taskHandler)
    // 11秒后关闭某个指定的任务
    setTimeout(() => {
        console.log(timeFns)
        closeTask(taskIds[0])
        console.log(timeFns)
    }, 11 * 1000);
}

handler()
