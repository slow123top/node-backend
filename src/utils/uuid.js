function GenerateUuid() {
    const time = new Date();
    return time.getTime().toString();
}

module.exports = GenerateUuid;
