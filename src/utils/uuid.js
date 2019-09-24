function GenerateUuid() {
    const time = new Date();
    return time.toTimeString();
}

module.exports = GenerateUuid;
