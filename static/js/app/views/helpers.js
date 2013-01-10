
App.UnderConstruction = Backbone.View.extend({
	tagName: 'div',
	className: 'under-construction',
	template: _.template($('#under-constriction-template').html()),

	initialize: function(options) {
		options = options || {};
		this.title = options.title;
		$('#content').append(this.el);
		this.render();
	},

	render: function() {
		this.$el.html(this.template({title: this.title || ''}));
	}
});
