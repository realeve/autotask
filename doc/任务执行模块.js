const state = {
  progress: "xxx",
};

function init(ctx) {
  const taskId = ctx.task_id;

  consumer(taskId)
    .catch((e) => {
      db.addLog(";;;;;");
    })
    .then((res) => {
      db.addTaskCompleteStatus("ddd");
    });

  return {
    status: 200,
    time: new Date(),
  };
}

const consumer = async (taskId) => {
  // 获取数据
  // 处理
  // 推消息
};
