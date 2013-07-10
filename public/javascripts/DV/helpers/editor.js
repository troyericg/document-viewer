_.extend(DV.Schema.helpers,{
  showAnnotationEdit : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var area   = this.viewer.$('.DV-annotationTextArea', annoEl);
    annoEl.addClass('DV-editing');
    area.focus();
  },
  cancelAnnotationEdit : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    this.viewer.$('.DV-annotationTitleInput', annoEl).val(anno.title);
    this.viewer.$('.DV-annotationTextArea', annoEl).val(anno.text);
    if (anno.unsaved) {
      this.viewer.model.notes.removeAnnotation(anno);
    } else {
      annoEl.removeClass('DV-editing');
    }
  },
  saveAnnotation : function(e, option) {
    var target = this.viewer.$(e.target);
    var annoEl = target.closest(this.annotationClassName);
    var note   = this.getAnnotationModel(annoEl);
    if (!note) return;
    note.set('title', annoEl.find('.DV-annotationTitleInput').val());
    note.set('content', annoEl.find('.DV-annotationTextArea').val());
    note.set('owns_note', (note.unsaved ? true : note.owns_note));
    if (note.owns_note) {
      note.set('author', (note.author || dc.account.name));
      note.set('author_organization', (anno.author_organization || (dc.account.isReal && dc.account.organization.name)));
    }
    if (target.hasClass('DV-saveAnnotationDraft'))  note.set('access', 'exclusive');
    else if (annoEl.hasClass('DV-accessExclusive')) note.set('access', 'public');
    if (option == 'onlyIfText' &&
        (!note.get('title') || anno.get('title') == 'Untitled Note') &&
        !note.get('text') &&
        !note.id) {
      return this.viewer.model.notes.removeAnnotation(anno);
    }
    annoEl.removeClass('DV-editing');
    // needs to be turned into an event trigger.
    //this.viewer.model.notes.fireSaveCallbacks(anno);
    note.save();
    this.viewer.api.redraw(true);
    if (this.viewer.activeAnnotation) this.viewer.pages.showAnnotation(note);
  },
  deleteAnnotation : function(e) {
    var annoEl = this.viewer.$(e.target).closest(this.annotationClassName);
    var anno   = this.getAnnotationModel(annoEl);
    this.viewer.model.notes.removeAnnotation(anno);
    this.viewer.model.notes.fireDeleteCallbacks(anno);
  }
});