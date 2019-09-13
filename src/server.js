const http = require('http');
const net = require('net');
const url = require('url');
const User = require('./database/schema');
const querystring = require('querystring');
const HttpResponseText = require('./utils/response');

// 创建一个HTTP服务器R
http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    // res.setHeader("Access-Control-Allow-Credentials", "true");
    // res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // 获取请求路径  不同接口
    const reqUrl = req.url;
    if (reqUrl === '/query') {
        // 查询数据
        User.find({}, (err, result) => {
            if (err) {
                res.write(err);
            }
            else {
                let responseEntity;
                if (!result || (result && !result.length)) {
                    responseEntity = new HttpResponseText('ERROR', '获取数据失败');
                } else {
                    responseEntity = new HttpResponseText('SUCCESS', '获取数据成功');
                }
                res.write(JSON.stringify(responseEntity));
            }
            res.end();
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
        let postData = '';
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.addListener("end", function () {
            console.log(postData);
            User.deleteMany({ id: postData }, (err) => {
                if (err) {
                    res.end('删除失败')
                } else {
                    // res.write(JSON.stringify(result));
                    res.end();
                }
            })
        });
        // 删除数据
        // User.deleteOne({ name: 'huyuyang' }, (err, docs) => {

        // });
    } else if (reqUrl === '/deleteMany') {
        let postData = '';
        // 注册监听, 接收数据块
        req.addListener("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.addListener("end", function () {
            res.writeHead(200, { "Content-Type": "text/plain" });
            const arr = querystring.parse(postData);
            const ids = arr.ids.reduce((sum, next) => {
                sum.push({ id: next })
                return sum;
            }, []);
            User.deleteMany({ id: { $in: arr.ids } }, (err) => {
                if (err) {
                    res.end('删除失败')
                } else {
                    res.end();
                }
            })
        });
        // 删除数据
        // User.deleteOne({ name: 'huyuyang' }, (err, docs) => {

        // });
    } else {

    }
}).listen(8080);



