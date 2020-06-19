/* 构造响应体 */

function HttpResponseText(status, message, data) {
    this.status = status;
    this.message = message;
    this.data = data;
}

// const httpResponseText = () => {
//     return {
//         status: 'SUCCESS',
//         message: ''
//     }
// }

module.exports = HttpResponseText;