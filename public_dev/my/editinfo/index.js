define({
	onRender: function () {
		var divMsg = this.$el.find('[name=divMsg]'),
			hash0 = this.name.split('/')[0],
			msg = '';
		if (hash0 == 'gohome') {
			msg = '完善以下信息后才会拥有自己的主页';
		} else if (hash0 == 'blog') {
			msg = '完善以下信息后才可发表博客文章';
		} else if (hash0 == 'course') { 
			msg = '完善以下信息后才可发表课程';
		}
		divMsg.html(msg);

		var imgAvatar = this.$el.find('[name=imgAvatar]'),
			txtNName = this.$el.find('[name=txtNName]'),
            txtSiteName = this.$el.find('[name=txtSiteName]'),
            txtSiteTit = this.$el.find('[name=txtSiteTit]'),
			btnSubmit = this.$el.find('[name=btnSubmit]');
		
		$.get('/api/user/get', function (result) {
			if (result.err == 0) {
				var user = result.data;
				imgAvatar.attr('src', user.avatar);
				txtNName.val(user.nname);
				txtSiteName.val(user.sitename);
				txtSiteTit.val(user.sitetit);
				if (!user.nname) { 
					txtNName.removeAttr('disabled');
				}
				if (!user.sitename) { 
					txtSiteName.removeAttr('disabled');
				}
				btnSubmit.removeAttr('disabled');
			} else { 
				alert('获取用户数据失败！\r\n' + JSON.stringify(result));
			}
		});

        btnSubmit.click(function () {
            var nname = txtNName.val(),
				sitename = txtSiteName.val(),
				sitetit = txtSiteTit.val(),
				avatar = imgAvatar.attr('src');
			if (nname) {
				// TODO: 验证昵称合法性
				if (sitename) { 
					// TODO: 验证主页名字合法性
					if (txtSiteTit.length < 30) {
						$.post('/api/user/edit', {
							nname: nname,
							avatar: avatar,
							sitename: sitename,
							sitetit: sitetit
						}, function (re) {
							if (re.err) {
								alert('发生错误了！请稍后重试。');
							} else {
								$O.Form.back();
								$('#aMyHome').attr('href', 'http://' + sitename + "." + document.domain);
								$('#aBlog').attr('href', '#blog');
								$('#aCourse').attr('href', '#course');
								$O.Form.first().displayInfo(avatar, nname, sitename, sitetit);
							}
						});
					} else { 
						// 非法操作，不做处理
					}
				} else {
					alert('请填写个人主页的名字');
					txtSiteTit.focus();
				}
			} else {
				alert('请填写昵称！');
				txtNName.focus();
			}
        });
        
	}
});