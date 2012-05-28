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
  },

  render: function() {
    var collection = this.count ? this.collection.top(this.count) : this.collection;
    var commentText = collection.reduce(function(html, comment){ return (html += JST['comment_item']({comment:comment})); }, '');
    DV.jQuery(this.el).html( JST['comment_list']({ comments: commentText, commentCount: this.collection.length }));
  },

  addComment: function() {
    var commentText = this.$el.find('.DV-comment_input').val();
    this.$el.find('.DV-comment_input').val('');
    this.collection.create( { commenter: DV.account.name, avatar_url: DV.account.avatar_url, text: commentText } );
  },
  
  openAnnotationList: function() {
    this.viewer.activeAnnotationId = this.note.id;
    this.viewer.open('ViewAnnotation');
  }
});
