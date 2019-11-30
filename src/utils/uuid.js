function GenerateUuid() {
    const time = new Date();
    return time.getTime();
}

module.exports = GenerateUuid;
