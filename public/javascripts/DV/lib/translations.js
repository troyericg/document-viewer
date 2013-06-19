// A tiny object to perform string substitution for translation
// No pluralization or anything fancier

// The simplest thing that could possibly work

// Initialize with an object containing
// language codes for keys and key->string for value
// i.e.
// {
//   'en': {
//     doc: 'Document',
//     annot: 'Annotation'
//   },{
//     'zh': {
//       doc:'文件'
//       annot: '註解'
//     }
//   }
//  }

(function(root,undefined) {

  var _ = root._;

  root.DV.t = _.t;

  Translations = function( options ){

    this.aliases      = options.aliases || [];
    this.viewer       = options.viewer;
    this.locale       = 'eng';

    _.i18n.configure( root.DC_LANGUAGE_CODES ? root.DC_LANGUAGE_CODES : { default: 'eng', fallback: 'eng' });

    if ( true === options.autoDetect )
      this.detectLocale();

    if ( this.viewer.schema.document.language ){
      this.setLocale( this.viewer.schema.document.language );
    }

  };



  // Aliases
  // we get strings like zh-cn and en-GB back from various browsers
  // We need to normalize that to a language set (where appropriate)
  //
  // since case differs between IE and chrome/firefox, the language
  // is converted to lowercase before the alias is evaluated
  //
  // an alias can be either a regex, string, or function
  // Examples:
  // { 'zh': 'zh-sg' }  // will use the zh language set for detected 'zh-sg'
  // { 'zh': ['zh-sg', 'zh-cn'] }  // use zh for both Singapore and PRC
  // { 'zh': new Regex('zh-\w{2}') }  // match anything that starts with zh- 
  // { 'zh' function(lang){ return lang=='zh-cn' } } // same as the first example

  // accepts an array of aliases
  Translations.prototype.setAliases = function( aliases ){
    this.aliases = aliases || [];
    return this;
  };

  var evalAlias=function( alias, detected ){
    return ( ( _.isString(alias) && alias === detected ) ||
             ( _.isArray(alias) && -1 != alias.indexOf(detected) ) ||
             ( _.isRegExp(alias) && detected.match(alias) ) ||
             ( _.isFunction(alias) && true == alias.call( detected ) )
           );
  };

  // Sniffs the browser's navigator.language || navigator.userLanguage
  // converts it to lowercase and runs through each of the aliases
  // Sets the locale to the first matching alias
  Translations.prototype.detectLocale = function(){
    var lang = ( navigator.language || navigator.userLanguage || '' ).toLowerCase();
    for (var i = 0, l = this.aliases.length; i < l; i++) {
      var alias = this.aliases[i];
      for (var key in alias) {
        if ( alias.hasOwnProperty(key) && true === evalAlias( alias[key], lang ) ){
          lang = key;
          break;
        }
      }
    }

    if ( _.i18n.packForCode( lang ) )
      this.setLocale( lang );

    return this.locale;
  };


  Translations.prototype.setLocale = function( code ){

    if ( _.i18n.packForCode( code ) ){
      this.renderWithLocale( code );
    } else {

      var me  = this,
          url = this.viewer.schema.data.translationsURL.
            replace(/\{language\}/, code ).
            replace(/\{realm\}/, 'viewer' ) + '.json';

      root.DV.jQuery.ajax( {
        url: url,
        dataType: 'jsonp',
        success: function( translation ){
          _.i18n.load( translation );
          me.renderWithLocale( code );
        }
      } );
    }
    return this;
  };

  Translations.prototype.renderWithLocale = function( code ){
    if ( this.locale != code ){
      this.locale = code;
      _.i18n.set('default', code );
      this.viewer.open('InitialLoad');
    }
  };



})(this);
