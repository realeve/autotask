

const { axios, mock } = require("./axios");

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

/** 获取任务列表 */
module.exports.getTaskList = mock(task, 600)

module.exports.addLog = ({ taskId, title, detail }) => {

}

module.exports.setTaskStatus = async ({ taskId, status }) => {

}

module.exports.closeAllTask = async () => {
    this.addLog({
        taskId: 0,
        title: '程序启动',
        detail: '关闭所有执行中的任务执行状态为未执行'
    })

    console.log('程序启动，关闭所有执行中的任务执行状态为未执行,此处添加数据库逻辑');
    let runningTask = []
    return runningTask;
}


