

const { axios, mock } = require("./axios");


const pushRTXInfo = params => axios({
    url: '/319/b804147c6e.json',
    params: {
        ...params,
        delaytime: 0,
    },
});

module.exports.rtxMsg = async ({ url = false, msg, receiver = '10654' }) => pushRTXInfo({
    title: "消息自动处理平台",
    msg: msg + (url ? `，请([点击此处|${url}])查看详情）。` : '。'),
    receiver
})

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
    item_callback: {
        type: 'fn',
        callback: ''
    },
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
    api_data_callback: `return data.value>3 && data.value<10 ? {
        value4:data.value*4,
        ...data
    }:false
    `,
    item_callback: {
        type: 'fn',
        callback: ''
    },
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
        axios('/66/18342475c8.json').then(res=>{console.log('回调',res.data);
        rtxMsg({msg:'消息推送回调测试',url:'http://10.8.1.35:100/monitor/'})
    })
        return data.value
    }
    return false
    `,
    item_callback: {
        type: 'api',
        callback: '/test/234.json'
    },
    valid: true,
}]

/** 获取任务列表 */
module.exports.getTaskList = async () => mock(task, 600)

module.exports.addLog = ({ taskId, title, detail }) => {

    console.log(`添加${taskId}日志：${title}`)
}

module.exports.setTaskStatus = async ({ taskId, status }) => {
    console.log(`设置${taskId}状态为${status}`)
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


