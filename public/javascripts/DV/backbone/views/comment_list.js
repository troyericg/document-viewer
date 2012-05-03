DV.backbone.view.CommentList = Backbone.View.extend({
  id: 'DV-commentsList',
  tagName: 'ul',
  constructor: function(options) {
    this.comments = options.comments;
  },
  render: function(){
    var output = '<ul class="DV-commentsList">';
    _.each( this.comments, function(comment){ 
      output += JST['comment_item']({avatarUrl: comment.avatarUrl, commenter: comment.commenter, text: comment.text});
    });
    //DV.jQuery(this.$el).append(output);
    this.$el = output + '</ul>';
  }
});