const http = require('http');
const Path = require('path');
const net = require('net');
const url = require('url');
const User = require('./database/schema');
const querystring = require('querystring');
const HttpResponseText = require('./utils/response');
const GenerateUuid = require('./utils/uuid');
const MongoClient = require('mongodb').MongoClient;
// const multer = require('multer')
const fs = require('fs')
const dbUrl = 'mongodb://localhost:27017';

/* GET users listing. */
// let upload = multer({
//     dest: './upload/'
// })
/*
*查询数据 
 */
async function query() {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => { console.log(err, '查询数据操作，连接数据库出错！'); });
    if (!client) {
        return;
    }

    try {

        const db = client.db("nodedb");
        let collection = db.collection('users');
        // 返回promise
        const result = await collection.find({}).toArray();
        return result;
    } catch (err) {

        console.log(err, '查询数据出错');
    } finally {

        client.close();
    }
}


/*
*插入数据 
 */
async function insert(putData) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => { console.log(err, '插入数据操作，连接数据库出错！'); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("nodedb");
        let collection = db.collection('users');
        const arr = querystring.parse(putData);
        arr.id = GenerateUuid();
        // 返回promise
        const result = await collection.insertMany([arr]);
        return result;
    } catch (err) {
        console.log(err, '插入数据出错！');
    } finally {
        client.close();
    }
}

/*
*插入文件数据 
 */
async function insertFile(putData) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => { console.log(err, '插入文件操作，连接数据库出错！'); });

    if (!client) {
        return;
    }

    try {
        const db = client.db("nodedb");
        let collection = db.collection('files');
        const arr = querystring.parse(putData);
        if (arr.content) {
            let formatData;
            if (arr.type === 'image/png') {
                formatData = arr.content.replace(/^data:image\/png;base64,/, "");
            } else if (arr.type === 'application/pdf') {
                formatData = arr.content.replace(/^data:application\/pdf;base64,/, "");
            }
            fs.writeFileSync(`F:/javascript/basic-javascript/${arr.name}`, Buffer.from(formatData, 'base64'))
            console.log(formatData.substring(0, 10));
            const result = await collection.insertMany([{ id: arr.id, path: `http://10.25.12.50:8081/${arr.name}` }]);
            return result;
        }
        // 返回promise
    } catch (err) {
        console.log(err, '插入文件出错！');
    } finally {
        client.close();
    }
}


/*
*获取文件数据 
 */
async function previewFile(putData) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => { console.log(err, '获取文件操作，连接数据库出错！'); });

    if (!client) {
        return;
    }

    try {

        const db = client.db("nodedb");
        let collection = db.collection('files');
        const arr = querystring.parse(putData);
        console.log(arr);
        // 返回promise
        const result = await collection.find({ id: arr.id }).toArray();
        return result;
    } catch (err) {
        console.log(err, '预览文件出错');
    } finally {
        client.close();
    }

}

/* 删除数据 */
async function deleteData(postData) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => console.log(err, '删除数据操作，连接数据库出错！'));
    if (!client) {
        return;
    }
    try {
        const db = client.db("nodedb");
        let collection = db.collection('users');
        const arr = querystring.parse(postData);
        console.log(arr);
        let ids = arr.ids;
        if (Object.prototype.toString.call(arr.ids) !== '[object Array]') {
            ids = [arr.ids]
        }
        const result = await collection.deleteMany({ id: { $in: ids } });
        return result;
    } catch (err) {
        console.log(err, '删除数据出现错误');
    } finally {
        client.close();
    }
}

/* 更新数据 */
async function updateData(postData) {
    const client = await MongoClient.connect(dbUrl, { useNewUrlParser: true })
        .catch(err => console.log(err, '更新数据操作，连接数据库出错！'));
    if (!client) {
        return;
    }
    try {
        const db = client.db("nodedb");
        let collection = db.collection('users');
        const data = querystring.parse(postData);
        console.log(data);
        // arr;

        const result = await collection.update(
            { id: data.id },
            {
                $set: {
                    name: data.username,
                    password: data.password
                }
            },
        );
        return result;
    } catch (err) {
        console.log(err, '更新数据出现错误');
    } finally {
        client.close();
    }
}

// 创建一个HTTP服务器
http.createServer((req, res) => {

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "*");

    // 获取请求路径  不同接口
    const reqUrl = req.url;
    if (reqUrl === '/query') {
        query().then(result => {
            let responseEntity;
            if (!result) {
                responseEntity = new HttpResponseText('ERROR', '数据返回异常，问一下数据库管理员吧', '');
            } else {
                responseEntity = new HttpResponseText('SUCCESS', '获取数据成功', result || []);
            }
            res.write(JSON.stringify(responseEntity));
            res.end();
        });
    } else if (reqUrl === '/insert') {
        // 插入数据
        let putData = '';
        let responeseEntity;
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            putData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            insert(putData).then((result) => {
                if (!result) {
                    responeseEntity = new HttpResponseText('ERROR', '插入数据失败', '');
                } else {
                    responeseEntity = new HttpResponseText('SUCCESS', '插入数据成功');
                }
                res.write(JSON.stringify(responeseEntity));
                res.end();
            });
        });
    } else if (reqUrl === '/update') {
        let postData = '';
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            updateData(postData).then(result => {
                if (!result) {
                    res.write(JSON.stringify(new HttpResponseText('ERROR', '更新错误')));
                    res.end();
                } else {
                    console.log('更新数据成功');
                    res.write(JSON.stringify(new HttpResponseText('SUCCESS', '更新成功')));
                    res.end();
                }
            })
        });
    } else if (reqUrl === '/deleteMany') {
        let postData = '';
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            deleteData(postData).then(result => {
                if (!result) {
                    res.write(JSON.stringify(new HttpResponseText('ERROR', '删除多个错误')));
                    res.end();
                } else {
                    console.log('删除数据成功');
                    res.write(JSON.stringify(new HttpResponseText('SUCCESS', '删除成功')));
                    res.end();
                }
            })
        });
    } else if (reqUrl === '/upload') {
        let postData = '';
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            insertFile(postData).then(result => {
                if (!result) {
                    res.write(JSON.stringify(new HttpResponseText('ERROR', '上传文件失败')));
                    res.end();
                } else {
                    res.write(JSON.stringify(new HttpResponseText('SUCCESS', '上传文件成功')));
                    res.end();
                }
            })
        });
    } else if (reqUrl === '/preview') {
        let postData = '';
        // 注册监听, 接收数据块
        req.on("data", function (postDataChunk) {
            postData += postDataChunk;
        });
        // 数据接收完毕, 执行回调函数
        req.on("end", function () {
            previewFile(postData).then(result => {
                if (!result || !result.length) {
                    res.write(JSON.stringify(new HttpResponseText('ERROR', '请先上传文件再预览')));
                    res.end();
                } else {
                    res.write(JSON.stringify(new HttpResponseText('SUCCESS', '预览文件成功', result)));
                    res.end();
                }
            })
        });
    }
    // const fileName = Path.resolve(__dirname, "." + req.url);
    // const extName = Path.extname(fileName).substr(1);

    // if (fs.existsSync(fileName)) { //判断本地文件是否存在
    //     var mineTypeMap = {
    //         html: 'text/html;charset=utf-8',
    //         htm: 'text/html;charset=utf-8',
    //         xml: "text/xml;charset=utf-8",
    //         png: "image/png",
    //         jpg: "image/jpeg",
    //         jpeg: "image/jpeg",
    //         gif: "image/gif",
    //         css: "text/css;charset=utf-8",
    //         txt: "text/plain;charset=utf-8",
    //         mp3: "audio/mpeg",
    //         mp4: "video/mp4",
    //         ico: "image/x-icon",
    //         tif: "image/tiff",
    //         svg: "image/svg+xml",
    //         zip: "application/zip",
    //         ttf: "font/ttf",
    //         woff: "font/woff",
    //         woff2: "font/woff2",
    //     }
    //     if (mineTypeMap[extName]) {
    //         res.setHeader('Content-Type', mineTypeMap[extName]);
    //     }
    //     var stream = fs.createReadStream(fileName);
    //     stream.pipe(res);
    // }
}).listen(3000);



