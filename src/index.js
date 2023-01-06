
const { clearInterval } = require("timers");
const { axios } = require("./utils/axios");

const lib = require('./utils/lib')

const fnLib = require('./utils/fnLib')

// 任务配置
/*
此部分由前台管理，此处为模拟数据，支持以下模式：

setInterval （数据搬运的场景、间隔多长时间执行一次监测任务）
setTimeout
立即执行
定时执行（如每天几点开始执行一次、每月几号几点执行）
指定在未来的某个时间执行一次、多次

*/
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
}, {
    id: 3,
    title: '只执行一次的任务',
    author: 'develop',
    time_type: 'once',
    time: '0',
    unit: 's',
    /** 触发API */
    api: '/1517/7452525046.json',
    api_data_callback: `
    console.log(data.value)
    if(data.value>10)
    {

        console.log(lib.now(),R.uniq([1,2,2,3,3,4,4,4,5]))
        axios('/66/18342475c8.json').then(res=>{console.log('回调',res.data)})
        return data.value
    }
    `,
    item_handler: "",
    valid: true,
}]




// 以taskId为key记录每个定时任务的执行状态

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
    let time = lib.getIntervalTime(taskItem)

    // 数据获取后对每条数据处理的回调
    let apiCallback = fnLib.getFn(taskItem.api_data_callback)

    const taskFn = async (removeTask = false) => {
        // 数据触发任务,触发后执行回调
        let data = await axios(taskItem.api).then(res => res.data.map(apiCallback))
        console.log(data)

        // 执行完后是否移除该任务
        if (removeTask) {
            // timeout 执行成功后，移除该属性
            // 移除key
            Reflect.deleteProperty(timeFns, key)
        }
    }

    switch (taskItem.time_type) {
        // 定时执行任务
        case 'interval':
            // 先执行一次任务
            taskFn()
            // 几分钟后触发定时任务执行一次
            timeFns[key] = setInterval(taskFn, time);
            console.log(`${taskItem.title}:每隔${time / 1000}秒执行一次：${timeFns[key]}`)
            break;

        // 一定时间后立即执行一次
        case 'timeout':
            timeFns[key] = setTimeout(() => {
                taskFn(true);

            }, time);
            console.log(`${taskItem.title}:${time / 1000}秒后执行一次：${timeFns[key]}`)
            break;

        // 立即执行一次
        case 'once':
            taskFn(true);
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
