(function ($) {
  var mode = {
        useClipboard: true,
        useSaveBtn: false,
        debug: false
      };
  $('#translated').hide().empty();

  // on load event
  $(document).ready(function () {
    $('#api-key').val(localStorage['api-key']);
    localStorage['s-lang'] && $('#src-lang').val(localStorage['s-lang']);
    localStorage['d-lang'] && $('#dst-lang').val(localStorage['d-lang']);

    setTimeout(function () {
      $('#api-key').val().length == 0 ? $('#api-key').focus() : $('textarea').focus();
    }, 50);
  });

  // set events which helps user's operation
  $(document).keydown(function (e) {
    if (e.keyCode == 13) {
      if ($('#btn-save:focus').length > 0) {
        _save();
        e.stopPropagation();
        return false;
      }
      if ($('#btn-exec:focus').length > 0) {
        _translate();
        e.stopPropagation();
        return false;
      }
    }
  });
  $('#api-key').change(function () {
    $(this).css({borderColor: 'silver'}).prop('placeholder', '');
    if (! mode.useSaveBtn) _save();
  });
  if (mode.useClipboard) {
    $('#to-translate').change(function () {
      $('#err-to-translate').css({opacity: ($(this).val().length < 230) ? 0 : 1});
    });
  }

  // save settings
  if (mode.useSaveBtn) {
    $('#btn-save').click(_save);
  } else {
    $('#src-lang, #dst-lang').change(_save);
  }
  function _save() {
    var apikey = $('#api-key').val(),
        source = $('#src-lang').val(),
        target = $('#dst-lang').val();
    if (! apikey) {
      $('#api-key').css({borderColor: 'red'}).prop('placeholder', 'Enter your api key!').focus();
      return;
    }
    localStorage['api-key'] = apikey;
    localStorage['s-lang'] = source;
    localStorage['d-lang'] = target;
    if (mode.useSaveBtn) window.close();
  };

  // translate sample
  $('#btn-exec').click(_translate);
  function _translate() {
    $('#translated').hide().empty();

    // validations
    var apikey = $('#api-key').val();
    if (! apikey) {
      $('#api-key').css({borderColor: 'red'}).prop('placeholder', 'Enter your api key!').focus();
      return;
    }
    var value = $('#to-translate').val();
    if (! value) {
      $('#to-translate').css({borderColor: 'red'}).prop('placeholder', 'No words to translate!').focus();
      return;
    }
    // use external service via script tag
    var source = $('#src-lang').val(),
        target = $('#dst-lang').val(),
        script = document.createElement('script');
    script.type = 'text/javascript';

    // calls google translate api v2
    script.src = 'https://www.googleapis.com/language/translate/v2' +
                 '?key=' + apikey + '&source=' + source + '&target=' + target +
                 '&q=' + value + '&callback=translateCallback';
    $(document.body).append(script);
  }
  // Google apis' callback function
  function _TranslateCallback(res) {
    var text = (res.data ? res.data.translations[0].translatedText :
                   "Could not translate. Please check whether your Google api's key is collect.");
    // switch by the mode
    if (! mode.useClipboard) {
      var texarea = $('#translated').html(text).fadeIn(),
          height = Math.min(texarea.prop('scrollHeight') + 10, 130);
    }
    if (! res.data) {
      $('#api-key').css({borderColor: 'red'}).focus();
    }
    if (mode.useClipboard) {
      _copyToClipboard(text);
      var success = $('#suc-to-translate').css({opacity:1});
      setTimeout(function () {success.animate({opacity:0}, 2000);}, 3000);
    } else {
      if (height > texarea.height()) {
        texarea.animate({height: height}, 300);
      }
    }
  }
  // it is nessesary for 'clipboardWrite' permission to be allowed in the manifest.json.
  function _copyToClipboard(text) {
    var temp = $('<textarea/>').css('opacity',0).html(text).appendTo($(document.body)).select();
    document.execCommand('copy');
    temp.remove();
  }
  // exports function to global context as callback
  window.translateCallback = _TranslateCallback;

})(jQuery);
