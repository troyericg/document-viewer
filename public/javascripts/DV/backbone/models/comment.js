DV.backbone.model.Comment    = Backbone.Model.extend({
  sync: function(method, model, options) {
    options.dataType = "jsonp";
    return Backbone.sync(method, model, options);
  },
  className: 'comment',
  initialize: function(attributes, options){
    this.author = new DV.backbone.model.Account(this.get('author') || {});
  }
});

DV.backbone.model.CommentSet = Backbone.Collection.extend({
  model: DV.backbone.model.Comment,
  url: function() { return '/documents/' + this.document_id + '/annotations/' + this.note_id + '/comments'; },
  initialize: function(models, options){
    this.document_id = options.document_id;
    this.note_id     = options.note_id;
  },
  // Return the top n comments
  top: function(n) { return this.models.slice(0,n); }
});
