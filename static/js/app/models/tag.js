
App.Tag = Backbone.Model.extend({
	urlBase: '/tags'
});

App.Tags = Backbone.Collection.extend({
	url: '/tags',
	model: App.Tag,

	formatTag: function(el) {
		var self = this;
		$(el).prepend('<i class="icon-tag text-info"/>');
	}
});
