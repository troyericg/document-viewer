DV.backbone.view.CommentList = Backbone.View.extend({
  id: 'DV-commentsList',
  className: 'DV-comments',
  events: { 
    'click .DV-add_comment': 'addComment',
    'click .DV-all_comments': 'openAnnotationList'
  },

  constructor: function(options) {
    this.viewer     = options.viewer;
    this.note       = options.note;
    console.log(this.note.id);
    this.collection = options.collection;
    this.collection.bind('add', this.render, this);
  },

  render: function() {
    DV.jQuery(this.el).html( JST['comment_list']({
      commentItems: this.collection.reduce(function(html, comment){ return html += JST['comment_item']({comment:comment}); }, '')
    }));
  },

  addComment: function() {
    var commentText = DV.jQuery(this.el).find('.DV-comment_input').val();
    DV.jQuery(this.el).find('.DV-comment_input').val('');
    this.collection.create( { commenter: DV.account.name, avatarUrl: DV.account.avatarUrl, text: commentText } );
  },
  
  openAnnotationList: function() {
    this.viewer.activeAnnotationId = this.note.id;
    console.log("Opening Annotation list to: " + this.note.id)
    console.log("Viewer activeAnnotationId: "+this.viewer.activeAnnotationId);
    this.viewer.open('ViewAnnotation');
  }
});
