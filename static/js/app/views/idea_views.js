App.IdeasListItem = Backbone.View.extend({
	tagName: 'div',
	className: 'row list-item',
	template: _.template($('#idea-template').html()),

	events: {
		"click .new-vote-link": "addVote",
		"click .edit-vote-link": "editVote"
	},

	initialize: function(model) {
		this.model = model;
		this.model.on('change', this.render, this);
		this.render();
	},

	render: function() {
		var dict = this.model.toJSON();
		dict.tag_labels = _.map(dict.tags, function(tag) {
			return '<span class="tag">' + tag + '</span>';
		});
		this.$el.html(this.template(dict));
		this.$('.tag').each(function(idx, el) {
			App.tags.formatTag(el);
		});
		return this;
	},

	addVote: function() {
		var vote = new App.Vote();
		vote.set('idea_key', this.model.id);
		App.currentUserVotes.add(vote);
		new App.VoteEditModal(vote, this.model).show();
		return false;
	},

	editVote: function() {
		new App.VoteEditModal(this.model.cuVote, this.model).show();
		return false;
	}
});

App.IdeasList = Backbone.View.extend({
	tag: 'div',
	className: 'container',
	template: _.template($('#ideas-list-template').html()),

	initialize: function() {
		App.currentUser.on('change', this.render, this);
		this.collection.on('reset', this.render, this);
		this.collection.fetch();
		$('#content').html(this.el);
		this.filter = new App.IdeasFilter(this.collection);
		this.tagFilter = new App.TagFilter(this.collection);
		this.$el.html(App.loadingTemplate());
	},

	render: function() {
		this.$el.html(this.template);

		this.$('.filter').append(this.filter.$el);
		this.filter.render();
		this.filter.delegateEvents();

		this.$('.sidebar').append(this.tagFilter.$el);
		this.tagFilter.render();
		this.tagFilter.delegateEvents();

		var listEl = $('.list', this.$el);
		this.collection.each(function(idea) {
			view = new App.IdeasListItem(idea);
			listEl.append(view.el);
		});

		return this;
	}
});

App.InlineEditor = Backbone.View.extend({
	tagName: 'div',

	events: {
		'dblclick .view': 'edit',
		'click .action-edit': 'edit',
		'click .action-cancel': 'cancel',
		'click .action-preview': 'preview',
		'click .action-save': 'save',
		'keyup': 'handleHotkey'
	},

	initialize: function(options) {
		this.template = options.template;
		this.property = options.property;
		if (options.update) this.update = options.update;
	},

	setModel: function(model) {
		this.model = model;
		this.model.on('change:' + this.property, this.render, this);
		App.currentUser.on('switch', this.render, this);
	},

	render: function() {
		this.$el.html(this.template(this.model.toJSON()));
		this.$el.removeClass('editing');
		this.delegateEvents();
	},

	handleHotkey: function(e) {
		if (e.ctrlKey && e.keyCode == 13) {
			this.save();
		}
		if (e.keyCode == 27) {
			this.cancel();
			e.preventDefault();
		}
	},

	edit: function() {
		this.$el.addClass('editing');
		this.$('.input').focus();
		return false;
	},

	cancel: function() {
		this.$el.removeClass('editing');
		return false;
	},

	preview: function() {
		return false;
	},

	update: function() {
		this.model.set(this.property, this.$('.input').val());
	},

	save: function() {
		var self = this;
		this.update();
		this.model.save({}, {
			success: function() {
				self.$el.removeClass('editing');
			}
		});
		return false;
	}
});

App.IdeaCheckList = Backbone.View.extend({
	tagName: 'div',
	template: _.template($('#idea-checklist-template').html()),

	status: {
		'.draft': {
			active: function() { return this.model.get('status') === 'draft'; },
			done: function() { return this.model.get('status') !== 'draft'; }
		},
		'[data-step="draft-subject"]': {
			done: function() { return this.model.get('subject').indexOf('TODO!') === -1; },
			click: function(e) { return e.data.self.parent.inlineEditors['subject'].edit(); }
		},
		'[data-step="draft-body"]': {
			done: function() { return this.model.get('body').indexOf('TODO!') === -1; },
			click: function(e) { return e.data.self.parent.inlineEditors['body'].edit(); }
		},
		'[data-step="draft-tags"]': {
			done: function() { return this.model.get('tags').length > 0; },
			click: function(e) { return e.data.self.parent.inlineEditors['tags'].edit(); }
		},
		'[data-step="draft-short"]': {
			done: function() { return this.model.get('short').indexOf('TODO!') === -1; },
			click: function(e) { return e.data.self.parent.inlineEditors['short'].edit(); }
		},
		'[data-step="draft-goal"]': {
			done: function() { return this.model.get('goal') > 0; },
			click: function(e) { return e.data.self.parent.inlineEditors['goal'].edit(); }
		},
		'[data-step="draft-settings"]': {
			done: false
		},
		'[data-step="draft-vote"]': {
			done: function() { return this.model.get('votes') > 0; }
		},
		'.published': {
			active: function() {
				return this.model.get('status') === 'published' &&
						this.model.get('dist') !== 'finish';
			},
			done: function() { return this.model.get('dist') === 'finish'; }
		},
		'[data-step="published-got25"]': {
			done: function() { return this.model.get('readiness') >= 25; }
		},
		'[data-step="published-got50"]': {
			done: function() { return this.model.get('readiness') >= 50; }
		},
		'[data-step="published-got75"]': {
			done: function() { return this.model.get('readiness') >= 75; }
		},
		'[data-step="published-got90"]': {
			done: function() { return this.model.get('readiness') >= 90; }
		},
		'[data-step="published-got100"]': {
			done: function() { return this.model.get('dist') === 'finish'; }
		},
		'.ready': {
			active: function() {
				return this.model.get('status') === 'published' &&
						this.model.get('dist') === 'finish';
			},
			done: function() {
				return this.model.get('status') === 'closed' &&
						this.model.get('dist') === 'finish';
			}
		},
		'.closed': {
			active: function() { return this.model.get('status') === 'closed'; }
		},
		'.removed': {
			active: function() { return this.model.get('status') === 'removed'; }
		}
	},

	events: {
		'click [data-sublist=1]': 'toggleStatusSublist',
		'click [data-action="publish"]': 'publish',
		'click [data-action="close"]': 'close',
		'click [data-action="open"]': 'open',
		'click [data-action="remove"]': 'remove',
		'click [data-action="recover"]': 'recover'
	},

	initialize: function(options) {
		this.model = options.model;
		this.parent = options.parent;
		this.model.on('change', this.render, this);
	},

	render: function() {
		if (typeof this.model.get('subject') === 'undefined') return;

		this.$el.html(this.template(this.model.toJSON()));

		var status = this.calcStatus();
		for (var selector in status) {
			var $el = this.$(selector);
			if (status[selector].active)
				$el.addClass('active');

			if ($el.attr('data-sublist'))
				$el.next('ul').toggle(status[selector].active);

			if (status[selector].done)
				$el.addClass('done');

			if ($el.attr('title')) {
				$el.tooltip({
					placement: 'left'
				});
			}

			if (status[selector].click) {
				$el.on('click', {self: this}, status[selector].click);
			}
		}
		this.delegateEvents();
	},

	calcStatus: function() {
		var res = {};
		for (var idx in this.status) {
			res[idx] = {};
			for (var key in this.status[idx]) {
				if (key !== 'click' && typeof this.status[idx][key] === 'function') {
					res[idx][key] = this.status[idx][key].apply(this);
				} else {
					res[idx][key] = this.status[idx][key];
				}
			}
		}
		return res;
	},

	toggleStatusSublist: function(e) {
		$(e.currentTarget).nextAll('ul:first').toggle();
	},

	publish: function() {
		var self = this;
		bootbox.dialog($('#confirm-publish-template').html(), [{
			label: "Опубликовать",
			"class": "btn-success",
			callback: function(result) {
				self.model.save({status: 'published'});
			}
		}, {
			label: "Нет ещё",
			"class": 'btn'
		}]);
		return false;
	},

	close: function() {
		var self = this;
		bootbox.dialog($('#confirm-close-template').html(), [{
			label: "Закрыть",
			"class": "btn-warning",
			callback: function(result) {
				self.model.save({status: 'closed'});
			}
		}, {
			label: "Нет ещё",
			"class": 'btn'
		}]);
		return false;
	},

	open: function() {
		this.model.save({status: 'published'});
		return false;
	},

	remove: function() {
		var self = this;
		var isDraft = this.model.get('status' ) === 'draft';
		var type = isDraft ? 'purge' : 'remove';
		bootbox.dialog($('#confirm-' + type + '-template').html(), [{
			label: "Удалить",
			"class": "btn-danger",
			callback: function(result) {
				if (isDraft)
					self.model.destroy();
				else
					self.model.save({status: 'removed'});
			}
		}, {
			label: "Нет ещё",
			"class": 'btn'
		}]);
		return false;
	},

	recover: function() {
		this.model.save({status: 'published'});
		return false;
	}


});

App.IdeaView = Backbone.View.extend({
	tagName: 'div',
	className: 'container',
	template: _.template($('#idea-view-template').html()),

	inlineEditors: {
		'subject': new App.InlineEditor({
			template: _.template($('#idea-inline-subject-template').html()),
			property: 'subject'
		}),
		'short': new App.InlineEditor({
			template: _.template($('#idea-inline-short-template').html()),
			property: 'short'
		}),
		'body': new App.InlineEditor({
			template: _.template($('#idea-inline-body-template').html()),
			property: 'body'
		}),
		'tags': new App.InlineEditor({
			template: _.template($('#idea-inline-tags-template').html()),
			property: 'tags',

			update: function() {
				this.model.set(this.property, this.$('.input').val().split(/ *, */));
			}

		}),
		'goal': new App.InlineEditor({
			template: _.template($('#idea-inline-goal-template').html()),
			property: 'goal'
		})
	},


	initialize: function(options) {
		var self = this;
		this.model = options.model;
		this.checklist = new App.IdeaCheckList({
			model: this.model,
			parent: this
		});
		for (var idx in this.inlineEditors) {
			this.inlineEditors[idx].setModel(this.model);
		}

		App.currentUser.on('switch', this.render, this);
		$('#content').html(this.el);
		this.model.fetch({
			success: function() {
				self.render();
			}
		});
	},

	render: function() {
		var attachmentsTemplate = _.template($('#idea-view-attachments-template').html());
		var relatedTemplate = _.template($('#idea-view-related-template').html());

		this.$el.html(this.template(this.model.toJSON()));
		// this.$('.row-comments').before(relatedTemplate());
		// this.$('.row-comments').before(attachmentsTemplate());
		for (var idx in this.inlineEditors) {
			this.$('.row-' + idx).append(this.inlineEditors[idx].$el);
			this.inlineEditors[idx].setModel(this.model);
		}
		this.$('.sidebar').append(this.checklist.$el);

		this.delegateEvents();
		return this;
	}
});

App.IdeaWizard = Backbone.View.extend({
	tagName: 'div',
	className: 'container',

	template: _.template($('#idea-wizard-template').html()),
	tabTemplate: _.template($('#idea-wizard-categorytab-template').html()),
	pageTemplate: _.template($('#idea-wizard-categorypage-template').html()),
	itemTemplate: _.template($('#idea-wizard-templateitem-template').html()),

	events: {
		'click .btn-cancel': 'cancel',
		'click .btn-create': 'create',
		'click [data-template]': 'useTemplate'
	},

	initialize: function() {
		this.templates = new App.Templates({type: 'idea'});
		this.templates.fetch();
		this.listenTo(this.templates, 'reset', this.render, this);
		$('#content').html(this.el);
		this.$el.html(App.loadingTemplate());
	},

	render: function() {
		var self = this;
		this.$el.html(this.template());
		var $tabs = this.$('ul.nav-tabs');
		var $pages = this.$('.tab-content');

		var pageId = 1;
		var byCategory = this.templates.byCategory();
		_(byCategory).each(function(list, category) {
			var categoryDict = {
				active: pageId === 1,
				pageId: pageId ++,
				name: category
			};
			$tabs.append(self.tabTemplate(categoryDict));

			var $page = $(self.pageTemplate(categoryDict));
			$pages.append($page);

			_.chain(list).sortBy(function(item) {
				return item.get('name');
			}).each(function(template) {
				$page.find('.template-wizard-list').append(self.itemTemplate(template.toJSON()));
			});
		});
		this.delegateEvents();
	},

	genericCreate: function(template) {
		var newIdea = new App.Idea();
		newIdea.save({template: template}, {
			success: function(idea) {
				App.infobox.showSuccess("New idea <strong>draft</strong> has been successfully created. Edit it and publish when you are ready.");
				App.router.navigate("ideas/" + idea.get('id') + "/edit", {trigger: true});
			}
		});
	},


	cancel: function() {
		Backbone.history.navigate('#ideas', {trigger: true});
		return false;
	},

	useTemplate: function(e) {
		this.genericCreate($(e.currentTarget).attr('data-template'));
		return false;
	},

	create: function() {
		this.genericCreate();
		return false;
	}
});
