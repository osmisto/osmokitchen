
App.DocView = Backbone.View.extend({
	topic: 'about',
	el: $('#content'),
	template: _.template($('#doc-template').html()),

	show: function(topic) {
		this.topic = topic;
		this.render();
	},

	render: function() {
		var dict = {
			text: this.topic
		};
		this.$el.html(this.template(dict));

		var topics = [
			{id: "test", text: "First topic"},
			{id: "test2", text: "Second topic"}
		];

		var $navlist = $('.nav-list', this.$el);
		topics.forEach(function(el) {
			$navlist.append('<li><a href="#/doc/about#' + el.id + '">' + el.text + '</a></li>');
		});
	}
});
