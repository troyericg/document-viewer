DV.DateUtils = {

  RFC_EXTRACTOR: /(\d{4})-(\d{1,2})-(\d{1,2})(?:T(\d{1,2}):(\d{2}):(\d{2})(?:\.\d+)?(Z|[+-](\d{2}):?(\d{2}))?)?/i,

  MONTHS: ['January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'],

  SHORT_MONTHS: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
    'Oct', 'Nov', 'Dec'],

  DAYS: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],

  SHORT_DAYS: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],

  AMPM: ['AM', 'PM', 'am', 'pm', 'a', 'p'],

  HOUR_SELECT: ['12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM',
    '8 AM', '9 AM', '10 AM', '11 AM', '12 PM', '1 PM', '2 PM', '3 PM', '4 PM',
    '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'],

  // Map of syntax tokens (as regexs) to code snippet that does value replacement.
  FORMATS: [
    [(/%A/g), 'DV.DateUtils.DAYS[d.getDay()]'],
    [(/%a/g), 'DV.DateUtils.SHORT_DAYS[d.getDay()]'],
    [(/%B/g), 'DV.DateUtils.MONTHS[d.getMonth()]'],
    [(/%b/g), 'DV.DateUtils.SHORT_MONTHS[d.getMonth()]'],
    [(/%d/g), 'DV.DateUtils.pad(d.getDate(), 2)'],
    [(/%e/g), 'd.getDate()'],
    [(/%H/g), 'DV.DateUtils.pad(d.getHours(), 2)'],
    [(/%I/g), 'DV.DateUtils.pad((d.getHours() % 12) || 12, 2)'],
    [(/%k/g), 'd.getHours()'],
    [(/%l/g), '(d.getHours() % 12) || 12'],
    [(/%M/g), 'DV.DateUtils.pad(d.getMinutes(), 2)'],
    [(/%m/g), 'DV.DateUtils.pad(d.getMonth()+1, 2)'],
    [(/%n/g), 'd.getMonth()+1'],
    [(/%P/g), 'd.getHours() < 12 ? DV.DateUtils.AMPM[0] : DV.DateUtils.AMPM[1]'],
    [(/%p/g), 'd.getHours() < 12 ? DV.DateUtils.AMPM[2] : DV.DateUtils.AMPM[3]'],
    [(/%q/g), 'd.getHours() < 12 ? DV.DateUtils.AMPM[4] : DV.DateUtils.AMPM[5]'],
    [(/%S/g), 'DV.DateUtils.pad(d.getSeconds(), 2)'],
    [(/%y/g), 'DV.DateUtils.pad(d.getFullYear() % 100, 2)'],
    [(/%Y/g), 'd.getFullYear()']
  ],

  // Create a zero-padded string of the given length.
  pad: function(number, length, radix) {
    var str = number.toString(radix || 10);
    while (str.length < length) str = '0' + str;
    return str;
  },

  // Create an (efficient) function for generating formatted date strings.
  // The following tokens are replaced in the format string:
  //
  //   %A - full weekday name (Sunday..Saturday)
  //   %a - abbreviated weekday name (Sun..Sat)
  //   %B - full month name (January..December)
  //   %b - abbreviated month name (Jan..Dec)
  //   %d - zero-padded day of month (01..31)
  //   %e - day of month (1..31)
  //   %H - zero-padded military hour (00..23)
  //   %I - zero-padded hour (01..12)
  //   %k - military hour ( 0..23)
  //   %l - hour ( 1..12)
  //   %M - minute (00..59)
  //   %m - zero-padded month (01..12)
  //   %n - month (1..12)
  //   %P - 'AM' or 'PM'
  //   %p - 'am' or 'pm'
  //   %q - 'a' or 'p'
  //   %S - second (00..59)
  //   %y - last two digits of year (00..99)
  //   %Y - year (1901...)
  //
  // For example:
  //
  //     var formatter = DV.DateUtils.create('%a, %b %e, %Y');
  //     var date = formatter(new Date());
  //
  create: function(f) {
    f = f.replace(/\n/g, '\\n').replace(/"/g, '\\"');
    f = 'return "' + f.replace(/"/g, '\\"') + '"';
    _.each(this.FORMATS, function(o) {
      f = f.replace(o[0], '"\n+ (' + o[1] + ') +\n"');
    });
    return new Function('d', f);
  },

  // Parse an RFC3339 date string, in any of these formats:
  //
  //  * YYYY-MM-DDThh:mm:ss-hh:mm   date, time, offset
  //  * YYYY-MM-DDThh:mm:ss         date, time  (implicit local offset)
  // *  YYYY-MM-DD                  date        (implicit midnight, local time)
  parseRfc: function(dateString) {
    var d = this.RFC_EXTRACTOR.exec(dateString);
    if (!d) throw new Error('Invalid RFC3339 Date: "' + dateString + '"');
    var h = d[4] || 0, m = d[5] || 0, s = d[6] || 0;

    // Default to local timezone, if none is specified.
    if (!d[7]) return new Date(d[1], d[2]-1, d[3], h, m, s);

    // Compensate for specified timezone.
    // Adjust for timezone
    var tzh = (d[8] || 0) * 1, tzm = (d[9] || 0) * 1;
    if (d[7].indexOf('-') >= 0) {
      tzh = -tzh;
      tzm = -tzm;
    }
    h = h * 1 - tzh;
    m = m * 1 - tzm;

    return new Date(Date.UTC(d[1], d[2]-1, d[3], h, m, s));
  },
  
  timeSince: function(date) {
    var duration = new Date() - new Date(date);
    var minute = 1000 * 60;
    var hour   = minute * 60;
    var day    = hour * 24;
    var time;

    if (!_.isFinite(duration))  { time = ""; } 
    else if ( duration < 1 )    { time = "less than a minute ago"; } 
    else if ( duration < hour ) { time = "" + Math.round(duration / minute) + " minutes ago"; }
    else if ( duration < day )  { time = "" + Math.round(duration / hour) + " days ago"; }
    else                        { time = "" + Math.round(duration / day) + " days ago"; }
    return time;
  }

};
