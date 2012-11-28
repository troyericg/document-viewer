_.extend(DV.Schema.events, {
  // handleNavigation can/should be rewritten as a click event listeners on several Backbone.Views.
  handleNavigation: function(e){
    var el          = this.viewer.$(e.target);            // The click target. A child of DV-chaptersContainer
    var triggerEl   = el.closest('.DV-trigger');          // Search for the nearest link!
    var noteEl      = el.closest('.DV-annotationMarker'); // Search for the nearest note link
    var chapterEl   = el.closest('.DV-chapter');          // Search for the nearest chapter link
    if (!triggerEl.length) return;                        // If you didn't click on anything we care about, bail.

    if (noteEl.length) {                                                    // If there is a note link nearby
      var aid         = noteEl[0].id.replace('DV-annotationMarker-','');    // find the note's id
      var annotation  = this.viewer.models.annotations.getAnnotation(aid);  // get the note model

      // If we're vewing the text, load the text for this note's page.
      if ( this.viewer.state === 'ViewText' ){ 
        this.loadText(annotation.index); 
      } else {
        if (this.viewer.state === 'ViewThumbnails') { this.viewer.open('ViewDocument'); }
        this.viewer.pageSet.showAnnotation(annotation); // Otherwise show the note.
      }

    } else if (chapterEl.length) {                                                            // If we have a chapter header
      if (el.hasClass('DV-expander')) {                                                       // if the click target is a section collapsing arrow
        return chapterEl.toggleClass('DV-collapsed');                                         // collapse the section and bail.
      } else {
        // its a header, take it to the page
        chapterEl.removeClass('DV-collapsed');                                                  // Expand the section if necessary
        var cid           = parseInt(chapterEl[0].id.replace('DV-chapter-',''), 10);            // chapter id
        var chapterIndex  = parseInt(this.viewer.models.chapters.getChapterPosition(cid),10);   // Figure out the page index

        if(this.viewer.state === 'ViewText'){                     // If we're viewing the text
          this.loadText(chapterIndex);                            // load the appropriate page text
        } else if (this.viewer.state === 'ViewDocument' ||        // Otherwise if we're vewing the document
                   this.viewer.state === 'ViewThumbnails'){       // or thumbnails
          this.helpers.jump(chapterIndex);                        // Jump to the appropriate page
          if (this.viewer.state === 'ViewThumbnails') { this.viewer.open('ViewDocument'); }
        }else{                                                    // Otherwise (say in the note view)
          return false;                                           // dunno lol.
        }
      }

    }else{
      return false; // How did you even end up here!??
    }
  }
});