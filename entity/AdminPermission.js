var AdminPermission = function (params) {
    for (var k in params) {
        this[k] = params[k];
	}

	return this;
};

module.exports = AdminPermission;