const mongoose = require('mongoose');

/* 连接数据库 */
const url = 'mongodb://localhost:27017/nodedb';
mongoose.connect(url);

mongoose.connection.on('connected', () => {
    console.log('连接成功');
});

mongoose.connection.on('error', (err) => {
    console.log('连接失败：' + err);
});

mongoose.connection.on('disconnected', () => {
    console.log('连接断开');
});

module.exports = mongoose;
