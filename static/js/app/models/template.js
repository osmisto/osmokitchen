
App.Template = Backbone.Model.extend({
    urlRoot: '/templates',

    defaults: function() {
        return {
            id: undefined,
            author_nick: App.me.get('nick'),
            author_key: App.me.get('id'),
            created_at: new Date().toString(),
            updated_at: new Date().toString(),
            category: '',
            name: '',
            description: '',
            subject: '',
            body: '',
            short: '',
            tags: [],
            changelog: []
        };
    },

    initialize: function(options) {
        options = options || {};
        if (options.type)
            this.set('type', options.type);
    }

});

App.Templates = Backbone.Collection.extend({
    model: App.Template,
    type: undefined,

    url: function() {
        if (this.type)
            return this.type + 's/templates';
        else
            return '/templates';
    },

    initialize: function(options) {
        options = options || {};
        this.type = options.type;
    },

    byCategory: function() {
        return this.groupBy(function(item) {
            return item.get('category');
        });
    }
});
