const http = require('http');
const net = require('net');
const url = require('url');
const User = require('./database/schema');

// 创建一个HTTP服务器R
http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    // 获取请求路径  不同接口
    const reqUrl = req.url;
    if (reqUrl === '/query') {
        // 查询数据
        User.find({ name: 'huyuyang', password: 'aaaaaa' }, {}, (err, result) => {
            if (err) {
                res.write(err);
            }
            else {
                let data = {
                    "id": result[0].id,
                    "name": result[0].name
                }
                console.log(data);
                res.end(JSON.stringify(data));
            }
        });

    } else if (reqUrl === '/insert') {
        // 插入数据
        const newData = [{ name: '张三', password: 'AAAA' }];
        User.insertMany(newData, (error, docs) => {
            if (error) {
                console.log(error);
            } else {
                console.log(docs);
            }
        })
    } else if (reqUrl === '/update') {
        User.update({ name: 'huyuyang' }, { password: '密码修改' }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        })
        // 更新数据
    } else if (reqUrl === '/delete') {
        // 删除数据
        User.deleteOne({ name: 'huyuyang' }, (err, docs) => {
            if (err) {
                console.log(err);
            } else {
                console.log(docs);
            }
        });
    } else {

    }
}).listen(8080);
