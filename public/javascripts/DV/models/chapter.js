// The Chapters view keep track of a document's
// sections/chapters and on which page each
// chapter begins.
DV.model.Chapters = function(viewer) {
  this.viewer = viewer;
  this.loadChapters();
};

DV.model.Chapters.prototype = {

  // Load (or reload) the chapter model from the schema's defined sections.
  loadChapters : function() {
    var sections = this.viewer.schema.data.sections;
    var chapters = this.chapters = this.viewer.schema.data.chapters = [];

    if (sections.length < 1) return; // short circuit if there are no sections

    // ensure each section has a unique id we can reference.
    _.each(sections, function(sec){ sec.id || (sec.id = _.uniqueId()); });

    // Run through each page.
    var sectionIndex = 0;
    for (var i = 0; i < this.viewer.schema.data.totalPages; i++) {
      
      // N.B. section ids start with 1, not 0.
      // thus the first section will be undefined.

      // get the current and next sections.
      var section = sections[sectionIndex];
      var nextSection = sections[sectionIndex + 1];
      
      // Check whether the next section's page index
      // is greater than or equal to the current page.
      if (nextSection && (i >= (nextSection.page - 1))) {
        // when that is the case, increment the section index
        // and move the next section to the current section.
        sectionIndex += 1;
        section = nextSection;
      }

      // assign the chapter for page i to the current section
      // if the section's page is less than or equal to the current
      // page.
      if (section && (section.page <= i + 1)) chapters[i] = section.id;
    }
  },

  getChapterId: function(index){
    return this.chapters[index];
  },

  getChapterPosition: function(chapterId){
    for(var i = 0,len=this.chapters.length; i < len; i++){
      if(this.chapters[i] === chapterId){
        return i;
      }
    }
  }
};
