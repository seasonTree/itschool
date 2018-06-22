var AdminUser = function (params) {
    for (var k in params) {
        this[k] = params[k];
	}

	return this;
};

module.exports = AdminUser;