
const { clearInterval } = require("timers");
const { axios } = require("./utils/axios");

const lib = require('./utils/lib')

// 任务配置
let task = [{
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
}]


const getFn = str => eval(`data=>{
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
    let key = lib.guid()
    timeFns[key] = 0;

    if (taskItem.time_type === 'interval') {
        // 定时时间
        let time = getIntervalTime(taskItem)

        // 数据获取后对每条数据处理的回调
        let apiCallback = getFn(taskItem.api_data_callback)


        const taskFn = async () => {
            // 数据触发任务,触发后执行回调
            let data = await axios(taskItem.api).then(res => res.data.map(apiCallback))
            console.log(data)
            console.log(Date.now())
        }

        // 执行一次任务
        taskFn()

        // 几分钟后触发定时任务执行一次

        timeFns[key] = setInterval(taskFn, time);
    }



    return key;
}

/**
 * 关闭任务
 * @param {*} key 任务key
 */
const closeTask = key => {
    let timeId = timeFns[key]
    console.log(key, timeId)
    let closeFn = timeId._repeat == null ? clearTimeout : clearInterval
    closeFn(timeId)
}

const handler = async () => {
    let taskIds = task.map(taskHandler)

    setTimeout(() => {
        closeTask(taskIds[0])
    }, 11 * 1000);
}

handler()
