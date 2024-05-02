const state = {
    0: { v: 0, t: '进件' },
    1: { v: 1, t: '提交初审' },
    2: { v: 2, t: '初审通过' },
    3: { v: 3, t: '初审拒绝' },
    4: { v: 4, t: '提交终审' },
    5: { v: 5, t: '终审通过' },
    6: { v: 6, t: '终审拒绝' },
    7: { v: 7, t: '生成合同' }
}

state[0].pass = state[1];
state[2].pass = state[4];
state[3].pass = state[1];

// 标的管理
state[5].pass = state[7]; // 生成合同

// 初审的通过和拒绝
state[1].pass = state[2];
state[1].reject = state[3];

// 终审的通过和拒绝
state[4].pass = state[5];
state[4].reject = state[6];

exports.statusFlow = state;

exports.waitingStatus = [1,4]
exports.nonCommit = [5,7];



