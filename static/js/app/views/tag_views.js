
App.TagFilter = Backbone.View.extend({
	tagName: 'div',
	className: 'row',
	template:    _.template( $('#tags-filter-template').html() ),
	tagTemplate: _.template( $('#tags-filter-item-template').html() ),

	events: {
		'click a': 'selectTag'
	},

	initialize: function(target) {
		this.target = target;
		this.collection = target.tagsCollection;
		this.collection.on('reset change', this.render, this);
	},

	render: function() {
		var self = this;
		self.$el.html(self.template());

		var $ul = self.$('ul');
		this.collection.each(function(tag) {
			$ul.append(self.tagTemplate(tag.toJSON()));
		});

		this.target.filterTags.each(function(tag) {
			var $tag = $('[data-tag="' + tag + '"]').parent();
			if ($tag.length === 0) {
				$tag = $(self.tagTemplate({id: tag, count: '0'}));
				$ul.append($tag);
			}
			$tag.addClass('active');
		});

		this.$('.tag').each(function(idx, el) {
			App.tags.formatTag(el);
		});
	},

	selectTag: function(e) {
		var id = $(e.currentTarget).attr('data-tag');
		this.target.filterTags.toggle(id);
		this.target.fetch();
		return false;
	}
});