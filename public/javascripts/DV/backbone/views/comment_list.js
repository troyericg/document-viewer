DV.backbone.view.CommentView = Backbone.View.extend({
  tagName: 'li',
  events: { 'click .DV-comment_permalink': 'navigateTo' },
  initialize: function(options) {
    this.note = options.note;
    this.viewer = options.viewer;
    if (options.canonical) this.id = 'DV-comment_' + options.model.id;
  },
  render: function() { return JST['comment_item']({ comment: this.model }); },
  navigateTo: function() {
    this.viewer.activeAnnotationId = this.note.id;
    this.viewer.open('ViewAnnotation');
    this.viewer.pageSet.showAnnotation({id: this.note.id});
  }
});

DV.backbone.view.CommentList = Backbone.View.extend({
  id: 'DV-commentsList',
  className: 'DV-comments',
  events: { 
    'click .DV-add_comment': 'addComment',
    'click .DV-all_comments': 'openAnnotationList'
  },

  initialize: function(options) {
    this.viewer     = options.viewer;
    this.note       = options.note;
    this.count      = options.count;
    this.collection.bind('add', this.render, this);

    var collection = this.count ? this.collection.top(this.count) : this.collection;
    this.commentViews = collection.map(function(comment){
      return new DV.backbone.view.CommentView({ model: comment, note: this.note, viewer: this.viewer });
    });
  },

  render: function() {
    var commentHTML = this.commentViews.reduce(function(html, view){ return (html += view.render()); }, '');
    DV.jQuery(this.el).html( JST['comment_list']({ comments: commentHTML, commentCount: this.collection.length }));
  },

  addComment: function() {
    var commentText = this.$el.find('.DV-comment_input').val();
    this.$el.find('.DV-comment_input').val('');
    this.collection.create( { commenter: DV.account.name, avatar_url: DV.account.avatar_url, text: commentText } );
    this.openAnnotationList();
  },
  
  openAnnotationList: function() {
    this.viewer.activeAnnotationId = this.note.id;
    this.viewer.open('ViewAnnotation');
    this.viewer.pageSet.showAnnotation({id: this.note.id});
  }
});
