/* 构造响应体 */

function HttpResponseText(status, message) {
    this.status = status;
    this.message = message;
}

// const httpResponseText = () => {
//     return {
//         status: 'SUCCESS',
//         message: ''
//     }
// }

module.exports = HttpResponseText;