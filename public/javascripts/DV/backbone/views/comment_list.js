DV.backbone.view.CommentList = Backbone.View.extend({
  id: 'DV-commentsList',
  className: 'DV-comments',
  events: {'click .DV-add_comment': 'addComment'},

  constructor: function(options) {
    this.collection = options.collection;
  },

  render: function() {
    DV.jQuery(this.el).html( JST['comment_list']({
      commentItems: this.collection.reduce(function(html, comment){ return html += JST['comment_item']({comment:comment}); }, '')
    }));
  },

  addComment: function() {
    var commentText = DV.jQuery(this.el).find('.DV-comment_input').val();
    DV.jQuery(this.el).find('.DV-comment_input').val('');
    console.log("clicked and value was: "+commentText);
    this.collection.create( { commenter: DV.account.name, avatarUrl: DV.account.avatarUrl, text: commentText } );
    this.render();
  }
});