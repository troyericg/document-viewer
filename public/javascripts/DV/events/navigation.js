_.extend(DV.Schema.events, {
  // handleNavigation can/should be rewritten as a click event listeners on several Backbone.Views.
  handleNavigation: function(e){
    var el          = this.viewer.$(e.target);            // The click target. A child of DV-chaptersContainer
    var triggerEl   = el.closest('.DV-trigger');          // Search for the nearest link!
    var noteEl      = el.closest('.DV-annotationMarker'); // Search for the nearest note link
    var chapterEl   = el.closest('.DV-chapter');          // Search for the nearest chapter link
    if (!triggerEl.length) return;                        // If you didn't click on anything we care about, bail.

    if (el.hasClass('DV-expander')) {                                       // if the click target is a section collapsing arrow
      return chapterEl.toggleClass('DV-collapsed');                         // collapse the section
    } else if (noteEl.length) {                                             // otherwise if there is a note link nearby
      var aid         = noteEl[0].id.replace('DV-annotationMarker-','');    // find the note's id
      var annotation  = this.viewer.models.annotations.getAnnotation(aid);  // get the note model
      var pageNumber  = parseInt(annotation.index,10)+1;                    

      if(this.viewer.state === 'ViewText'){                 // If we're vewing the text, load the text for this note's page.
        this.loadText(annotation.index);

        // this.viewer.history.save('text/p'+pageNumber);
      }else{                                                // Otherwise show the note.
        if (this.viewer.state === 'ViewThumbnails') {       // If we're looking at the page thumbnails
          this.viewer.open('ViewDocument');                 // Open the document view first.
        }
        this.viewer.pageSet.showAnnotation(annotation);     // open!
      }

    } else if (chapterEl.length) {                                                            // If we have a chapter header
      // its a header, take it to the page
      chapterEl.removeClass('DV-collapsed');                                                  // Expand the section if necessary
      var cid           = parseInt(chapterEl[0].id.replace('DV-chapter-',''), 10);            // chapter id
      var chapterIndex  = parseInt(this.viewer.models.chapters.getChapterPosition(cid),10);   // Figure out the page index
      var pageNumber    = parseInt(chapterIndex,10)+1;                                        // and page number

      if(this.viewer.state === 'ViewText'){                     // If we're viewing the text
        this.loadText(chapterIndex);                            // load the appropriate page text
        // this.viewer.history.save('text/p'+pageNumber);
      }else if(this.viewer.state === 'ViewDocument' ||          // Otherwise if we're vewing the document
               this.viewer.state === 'ViewThumbnails'){         // or thumbnails
        this.helpers.jump(chapterIndex);                        // Jump to the appropriate page
        // this.viewer.history.save('document/p'+pageNumber);
        if (this.viewer.state === 'ViewThumbnails') {           // If we're viewing the thumbnails
          this.viewer.open('ViewDocument');                     // we should open the document view
        }
      }else{                                                    // Otherwise (say in the note view)
        return false;                                           // dunno lol.
      }

    }else{
      return false; // How did you even end up here!??
    }
  }
});