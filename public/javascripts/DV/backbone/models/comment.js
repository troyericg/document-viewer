DV.backbone.model.Comment    = Backbone.Model.extend({
  className: 'comment'
});
DV.backbone.model.CommentSet = Backbone.Collection.extend({
  model: DV.backbone.model.Comment
});