
const { clearInterval } = require("timers");
const { axios } = require("./utils/axios");

const lib = require('./utils/lib')

const fnLib = require('./utils/fnLib')
const db = require('./utils/db')
const cfg = require('./utils/config')

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

    const taskRunning = () => {
        db.addLog({ taskId: key, title: '开始执行', detail: '' })
        db.setTaskStatus({ taskId: key, status: cfg.TASK_STATUS.RUNNING });
    }
    const taskFn = async ({ removeTask = false, isComplete = false }) => {
        // 数据触发任务,触发后执行回调
        let data = await axios(taskItem.api).then(res => res.data.map(apiCallback).filter(e => e)).catch(e => {
            db.addLog({ taskId: key, title: '任务出错', detail: JSON.stringify(e) })
        })

        console.log(data)

        // 执行完后是否移除该任务
        if (removeTask) {
            // timeout 执行成功后，移除该属性
            // 移除key
            Reflect.deleteProperty(timeFns, key)
        }

        if (isComplete) {
            db.addLog({ taskId: key, title: '执行完毕', detail: '' })
            db.setTaskStatus({ taskId: key, status: cfg.TASK_STATUS.COMPLETE });
        }

    }

    switch (taskItem.time_type) {
        // 定时执行任务
        case 'interval':
            // 先执行一次任务
            taskFn({ removeTask: false, isComplete: false })
            taskRunning()
            // 几分钟后触发定时任务执行一次
            timeFns[key] = setInterval(() => {
                taskFn({ removeTask: false, isComplete: false })
            }, time);
            console.log(`${taskItem.title}:每隔${time / 1000}秒执行一次：${timeFns[key]}`)
            break;

        // 一定时间后立即执行一次
        case 'timeout':
            taskRunning()
            timeFns[key] = setTimeout(() => {
                taskFn({ removeTask: true, isComplete: true });
            }, time);
            console.log(`${taskItem.title}:${time / 1000}秒后执行一次：${timeFns[key]}`)
            break;

        // 立即执行一次
        case 'once':
            taskFn({ removeTask: true, isComplete: true });
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

const initTask = async () => {
    // step1.关闭运行中的任务
    let runningTask = await db.closeAllTask()
    runningTask.map(closeTask)

    // step2.获取任务列表
    return db.getTaskList()
}

const main = async () => {

    let task = await initTask()

    // 并发执行所有任务
    let taskIds = task.map(taskHandler)

    // 11秒后关闭某个指定的任务
    setTimeout(() => {
        console.log(timeFns)
        closeTask(taskIds[0])
        console.log(timeFns)
    }, 11 * 1000);
}

main()
