DV.backbone.model.Note = Backbone.Model.extend({
  className  : 'note',

  initialize : function(attributes, options) {}
});

DV.backbone.model.NoteSet = Backbone.Collection.extend({
  model : DV.backbone.model.Note
});