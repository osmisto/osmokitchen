App.VoteList = Backbone.View.extend({
	tagName: 'div',
	className: 'votes-list',
	template: _.template($('#vote-list-template').html()),

	initialize: function(options) {
		this.collection = options.collection;
		this.idea = options.idea;

		this.listenTo(this.collection, 'sync', this.render, this);
		this.listenTo(App.myVotes, 'sync remove add', this.render, this);
		this.$el.html(App.loadingTemplate());
	},

	render: function(options) {
		var self = this,
			myVote = App.myVotes.getVote(this.idea);
		self.$el.html(self.template());

		// My vote
		if (myVote) {
			self.$el.append(new App.VoteItem({model: myVote, parent: this}).el);
		} else {
			self.$el.append(new App.VoteNew({parent: this }).el);
		}

		// Render all other items
		_.chain(self.collection.models).sortBy(function(item) {
			return item.get('cache') * -1;
		}).each(function(item) {
			if (item.get('author_key') === App.me.get('id')) return;
			self.$el.append(new App.VoteItem({model: item, parent: this}).el);
		});
		self.delegateEvents();
	}
});

App.VoteNew = Backbone.View.extend({
	template: _.template($('#vote-new-link-template').html()),

	events: {
		'click .action-create': 'create'
	},

	initialize: function(options) {
		this.parent = options.parent;
		this.render();
	},

	render: function() {
		if (!App.me.can('member')) return;
		this.$el.html(this.template());
		this.delegateEvents();
	},

	create: function() {
		var vote = new App.Vote(),
			editView = new App.VoteEdit({model: vote});
		vote.set('idea_key', this.parent.idea.get('id'));
		this.listenTo(editView, 'save', this.afterSave, this);
		this.$('.edit-form').html(editView.el);
		this.$el.addClass('editing');
		return false;
	},

	afterSave: function(model) {
		App.myVotes.add(model);
		this.parent.collection.fetch();
	}
});

App.VoteItem = Backbone.View.extend({
	template: _.template($('#vote-list-item-template').html()),
	editTemplate: _.template($('#vote-edit-template').html()),

	events: {
		'click .action-destroy': 'destroy',
		'click .action-edit': 'edit'
	},

	initialize: function(options) {
		this.model = options.model;
		this.parent = options.parent;
		this.render();
	},

	render: function() {
		var data = this.model.toJSON();
		_.extend(data, App.viewHelpers);
		this.$el.html(this.template(data));
		this.delegateEvents();
	},

	destroy: function() {
		var self = this;
		App.tools.confirmPopover(this.$('.action-destroy'), {
			icon: 'trash',
			type: 'danger',
			success: function() {
				self.model.destroy();
			}
		});
		return false;
	},

	edit: function() {
		var editView = new App.VoteEdit({model: this.model});
		this.listenTo(editView, 'save', this.afterSave, this);
		this.$('.edit-form').html(editView.el);
		this.$el.addClass('editing');
		return false;
	},

	afterSave: function() {
		this.parent.collection.fetch();
	}
});

App.VoteEdit = Backbone.View.extend({
	template: _.template($('#vote-edit-template').html()),

	events: {
		'submit form': 'save',
		'click .btn-cancel': 'cancel',
		'keyup': 'handleHotkey'
	},

	initialize: function(options) {
		this.model = options.model;
		this.render();
	},

	render: function() {
		var data = this.model.toJSON();
		data._isNew = this.model.isNew();
		this.$el.html(this.template(data));
		this.delegateEvents();
	},

	save: function() {
		var self = this;
		var dict = this.parseForm();
		this.model.save(dict, {
			success: function() {
				self.trigger('save', self.model);
			}
		});
		return false;
	},

	cancel: function() {
		this.$el.parents('.editing').removeClass('editing');
		this.trigger('cancel', this.model);
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

	handleHotkey: function(e) {
		if (e.ctrlKey && e.keyCode == 13) {
			this.save();
		}
		if (e.keyCode == 27) {
			this.cancel();
			e.preventDefault();
		}
	}

});


App.VoteEditModal = Backbone.View.extend({
	tag: 'div',
	className: 'modal hide',
	template: _.template($('#vote-edit-dialog-template').html()),

	events: {
		'click .btn-primary': 'save',
		'click .btn-danger': 'destroy',
		'click .btn-cancel': 'cancel'
	},

	initialize: function(vote, idea) {
		this.model = vote;
		this.idea = idea;
		this.editForm = new App.VoteEdit({model: this.model});
		this.listenTo(this.editForm, 'save', this.updateIdea, this);
		this.listenTo(this.editForm, 'save cancel', this.close, this);
		this.render();
	},

	render: function() {
		var dict = this.model.toJSON();
		dict.idea = this.idea.toJSON();
		dict._isNew = this.model.isNew();
		this.$el.html(this.template(dict));
		this.$('.modal-body').html(this.editForm.el);
		this.editForm.$('.buttons').remove();
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

	cancel: function() {
		if (this.model.isNew()) this.model.destroy();
		this.close();
		return false;
	},

	save: function() {
		this.editForm.save();
		return false;
	},

	updateIdea: function() {
		this.idea.fetch();
	},

	destroy: function() {
		var self = this;
		this.model.destroy({
			success: function() {
				self.updateIdea();
				self.close();
			}
		});
	}
});
