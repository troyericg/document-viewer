DV.Schema.events.ViewAnnotation = {
  next: function(e){
    var activeAnnotationId = this.viewer.activeAnnotationId;
    var notes              = this.viewer.model.notes;
    var nextAnnotation     = (activeAnnotationId === null) ?
        notes.getFirstAnnotation() : notes.getNextAnnotation(activeAnnotationId);

    if ( !nextAnnotation ) { return false; }

    this.viewer.pages.showAnnotation(nextAnnotation);
    this.viewer.helpers.setAnnotationPosition(nextAnnotation.position);
  },

  previous: function(e){
    var activeAnnotationId = this.viewer.activeAnnotationId;
    var notes              = this.viewer.model.notes;

    var previousAnnotation = (!activeAnnotationId) ?
    notes.getFirstAnnotation() : notes.getPreviousAnnotation(activeAnnotationId);
    if ( !previousAnnotation ){ return false; }

    this.viewer.pages.showAnnotation(previousAnnotation);
    this.viewer.helpers.setAnnotationPosition(previousAnnotation.position);
  },

  search: function(e){
    e.preventDefault();
    this.viewer.open('ViewSearch');
    return false;
  }
};
