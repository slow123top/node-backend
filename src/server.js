const http = require('http');
const net = require('net');
const url = require('url');
const User = require('./database/schema');
const querystring = require('querystring');
const HttpResponseText = require('./utils/response');

const mongoose = require('mongoose');
const GenerateUuid = require('./utils/uuid');

// 创建一个HTTP服务器R
http.createServer((req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // 获取请求路径  不同接口
    const reqUrl = req.url;
    if (reqUrl === '/query') {
        mongoose.connect('mongodb://localhost:27017/nodedb').then(
           async (mongoose)=>{
            let Schema = mongoose.Schema;
             const user =  mongoose.model('User',new Schema({
                id: { type: String },
                name: { type: String },
                password: { type: String },
            }));
            await user.find({});
           }).then((err, result) => {
            if (err) {
                res.write(err);
            }
            else {
                let responseEntity;
                if (!result) {
                    responseEntity = new HttpResponseText('ERROR', '数据返回异常，问一下数据库管理员吧', '');
                } else {
                    responseEntity = new HttpResponseText('SUCCESS', '获取数据成功', result || []);
                }
                res.write(JSON.stringify(responseEntity));
            }
            res.end();
        });
        // 查询数据
        // User.find({}, (err, result) => {
        //     if (err) {
        //         res.write(err);
        //     }
        //     else {
        //         let responseEntity;
        //         if (!result) {
        //             responseEntity = new HttpResponseText('ERROR', '数据返回异常，问一下数据库管理员吧', '');
        //         } else {
        //             responseEntity = new HttpResponseText('SUCCESS', '获取数据成功', result || []);
        //         }
        //         res.write(JSON.stringify(responseEntity));
        //     }
        //     res.end();
        // });
    } else if (reqUrl === '/insert') {
        // 插入数据
        let putData = '';
        let responeseEntity;

        insertData().then();
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            putData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            const arr = querystring.parse(putData);
            arr.id = GenerateUuid();
            console.log(arr);
            User.insertMany([arr], (error, docs) => {
                if (error) {
                    responeseEntity = new HttpResponseText('ERROR', '插入数据失败', '');
                } else {
                    responeseEntity = new HttpResponseText('SUCCESS', '插入数据成功');
                }
                res.write(JSON.stringify(responeseEntity));
                res.end();
            });
        });
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
            User.deleteMany({ id: postData }, (err) => {
                if (err) {
                    res.end('删除失败')
                } else {
                    // res.write(JSON.stringify(result));
                    console.log(`删除${postData}成功`);
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
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            const arr = querystring.parse(postData);
            let ids = arr.ids;
            if (Object.prototype.toString.call(arr.ids) === '[object Array]') {
                ids = arr.ids.reduce((sum, next) => {
                    sum.push({ id: next })
                    return sum;
                }, []);
            } else {
                ids = [arr.ids];
            }
            console.log(arr.ids);
            let len = ids.length;
            // ids.forEach((ele, index) => {
            User.deleteMany({ id: { $in: arr.ids } }, (err) => {
                if (err) {
                    res.write(JSON.stringify(new HttpResponseText('ERROR', err)));
                    res.end();
                } else {
                    res.write(JSON.stringify(new HttpResponseText('SUCCESS', '删除成功')));
                    res.end();
                }
            })
        });
    } else {

    }
}).listen(8080);



async function insertData(){
    await onData();
    await endData();
    return `完成插入数据`;
}


function onData(){
    return new Promise();
}

function endData(){
    return new Promise();
}


