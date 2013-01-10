
App.VoteEditModal = Backbone.View.extend({
	tagName: 'div',
	clossName: 'row',
	template: _.template($('#vote-list-template').html()),

	render: function() {
		this.$el.html(this.template());
		this.$('.list').append('test');
	}
});

App.VoteEditModal = Backbone.View.extend({
	tag: 'div',
	className: 'modal hide',
	template: _.template($('#vote-edit-template').html()),

	events: {
		"submit form": "doSubmit",
		"click .btn-save": "doSubmit",
		"click .btn-cancel": "doCancel",
		"click .btn-danger": "removeVote"
	},

	initialize: function(vote, idea) {
		this.model = vote;
		this.idea = idea;
		this.model.on('change', this.render, this);
		this.render();

	},

	render: function() {
		var dict = this.model.toJSON();
		dict.idea = this.idea.toJSON();
		this.$el.html(this.template(dict));
		this.$('.btn-danger').toggle(!this.model.isNew());
	},

	show: function() {
		this.$el.modal({
			keyboard: true,
			show: true
		}).css({
			width: 'auto',
			'margin-left': function() {
				return -($(this).width / 2);
			}
		});
	},

	close: function()   {
		this.$el.modal('hide');
		this.remove();
		return false;
	},

	doCancel: function() {
		if (this.model.isNew()) this.model.destroy();
		this.close();
	},

	doSubmit: function() {
		var self = this;
		var dict = this.parseForm();
		this.model.save(dict, {
			success: function() {
				self.close();
				self.idea.fetch();
			}
		});
		return false;
	},

	parseForm: function() {
		var dict = {};
		var fields = this.$('form').serializeArray();
		_(fields).each(function(elem) {
			dict[elem['name']] = elem['value'];
		});
		return dict;
	},

	removeVote: function() {
		var self = this;
		this.model.destroy({
			success: function() {
				self.idea.fetch();
				self.close();
			}
		});
	}

});
