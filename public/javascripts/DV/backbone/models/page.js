DV.backbone.model.Page = Backbone.Model.extend({
  className: 'page'
});
DV.backbone.model.PageSet = Backbone.Collection.extend({
  model : DV.backbone.model.Page
});