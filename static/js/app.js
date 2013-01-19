window.App = {};

App.viewHelpers = {
    humanTime: function(time_str) {
        var date = new Date(time_str);
        var now = new Date();
        var diff = this.getTimeDifference(date, now);
        var short = '?';

        if (diff.days > 4) {
            if (date.getFullYear() !== now.getFullYear()) {
                short = this.formatTime('dd mm yyyy', date);
            } else {
                short = this.formatTime('dd mm', date);
            }
        } else if (diff.days > 1) {
            short = diff.days + ' дня назад';
        } else if (diff.days == 1) {
            short = 'вчера';
        } else if (diff.hours > 0) {
            short = diff.hours + ' ч. назад';
        } else if (diff.minutes > 0) {
            short = diff.minutes + ' м. назад';
        } else if (diff.seconds > 5) {
            short = diff.seconds + ' с. назад';
        } else {
            short = 'только что';
        }
        return '<abbr title="' + date.toLocaleString() + '">' + short + '</abbr>';
    },

    getTimeDifference: function(earlierDate,laterDate) {
       var nTotalDiff = laterDate.getTime() - earlierDate.getTime();
       var oDiff = {};
       oDiff.days = Math.floor(nTotalDiff/1000/60/60/24);

       nTotalDiff -= oDiff.days*1000*60*60*24;
       oDiff.hours = Math.floor(nTotalDiff/1000/60/60);

       nTotalDiff -= oDiff.hours*1000*60*60;
       oDiff.minutes = Math.floor(nTotalDiff/1000/60);

       nTotalDiff -= oDiff.minutes*1000*60;
       oDiff.seconds = Math.floor(nTotalDiff/1000);
       return oDiff;
    },

    formatTime: function(format, date) {
        var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return format.replace('dd', date.getDate())
                .replace('mm', months[date.getMonth()])
                .replace('yyyy', date.getFullYear());
    },

    howMuch: function(cache) {
        if (cache === 0) return 'zero';
        if (cache < 100) return 'ok';
        if (cache < 1000) return 'good';
        return 'big';
    }

};

App.loadingTemplate = _.template('<div class="muted text-center">Loading...</div>');

App.eventsHub = _.extend({}, Backbone.Events);

App.eventsHub.on('domchange:title', function(title) {
    $(document).attr('title', title + ' - OsmoKitchen');
}, this);

App.tools = {};
App.tools.confirmPopover = function($el, options) {
    var $tempover = $('<div/>'),
        template = _.template($('#basic-confirm-template').html());

    // Default options
    options = _.extend({
        placement: 'right',
        icon: 'ok',
        type: 'primary'
    }, options);

    // position tempover ontop of $el
    $el.after($tempover);
    $tempover.css({position: 'absolute', zIndex: 5000});
    $tempover.offset($el.offset());
    $tempover.width($el.width());
    $tempover.height($el.height());

    // Init clickover object
    $tempover.clickover({
        placement: options.placement,
        'class': 'clickover-confirm',
        content: template(options),
        html: true,
        onHidden: function() {
            console.log('hidding ... ');
            $tempover.remove();
        }
    });
    $tempover.click();
    $tempover.data('clickover').tip().find('.btn-ok').click(function() {
        if (options.success) options.success();
    });
};


$(function() {
    App.router = new App.Router();
    App.me = App.currentUser = new App.CurrentUser(App.currrentUserDefaults);
    App.myVotes = App.currentUserVotes = new App.CurrentUserVotes();
    App.currentUserVotes.fetch();

    App.navbar = new App.NavBar();
    App.infobox = new App.Infobox();

    App.tags = new App.Tags();
    App.tags.fetch();

    // Analytics
    App.analytics = new App.Analytics({
        trace: true
    });

    if (piwikTracker) {
        App.piwik = new App.PiwikAnalytics({
            tracker: piwikTracker,
            goals: {
                newUser: 1,
                newIdea: 2,
                vote: 3,
                publishIdea: 4
            }
        });
    }

    Backbone.history.start();
});
