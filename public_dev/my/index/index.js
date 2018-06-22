define({
	onRender: function () {
		var imgAvatar = this.$el.find('[name=imgAvatar]'),
			spanNName = this.$el.find('[name=spanNName]'),
			spanSiteName = this.$el.find('[name=spanSiteName]'),
			spanSiteTit = this.$el.find('[name=spanSiteTit]');

		this.displayInfo = function (avatar, nname, sitename, sitetit) {
			imgAvatar.attr('src', avatar); // TODO: 如果没有图像，显示默认图像
			spanNName.html(nname);
			spanSiteName.html(sitename);
			spanSiteTit.html(sitetit);
		};
		
		var _this = this;

		$.get('/api/user/get', function (result) {
			if (result.data) { 
				var user = result.data;
				_this.displayInfo(user.avatar, user.nname, user.sitename, user.sitetit);
			}
		});
	}
});