DV.backbone.view.CommentList = Backbone.View.extend({
  id: 'DV-commentsList',
  className: 'DV-comments',
  events: {'click .DV-add_comment': 'addComment'},

  constructor: function(options) {
    this.collection = options.collection;
  },

  render: function() {
    DV.jQuery(this.el).append( JST['comment_list']({
      commentItems: this.collection.reduce(function(html, comment){ return html += JST['comment_item']({comment:comment}); }, '')
    }));
  },

  addComment: function() {
    console.log("clicked");
  }
});