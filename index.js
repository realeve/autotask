const { axios } = require("./utils/axios");

// 任务配置
let task = [{
    title: '自动同步数据',
    author: 'develop',
    time_type: 'interval',
    time: '5',
    unit: 'min',
    /** 触发API */
    api: '/441/521d5bd898.json',
    api_data_callback: `return {
        ...data,
        users:data.users*2
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

const taskHandler = async taskItem => {
    if (taskItem.time_type === 'interval') {
        // 定时时间
        let time = getIntervalTime(taskItem)

        // 数据获取后对每条数据处理的回调
        let apiCallback = getFn(taskItem.api_data_callback)


        const taskFn = () => {
            // 数据触发任务,触发后执行回调
            axios(taskItem.api).then(res => res.data.map(apiCallback)).then(data => {
                console.log(data)
            })
        }

        // 执行一次任务
        taskFn()

        // 几分钟后触发定时任务执行一次
        setInterval(taskFn, time);

    }
}

const handler = async () => {
    task.forEach(taskHandler)
}

handler()