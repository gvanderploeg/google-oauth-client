var auth = new OAuth({
  context:window,
  scope:"https://www.googleapis.com/auth/calendar",
  clientId:"147381402418.apps.googleusercontent.com",
  redirectUri:"http://www.geertvanderploeg.com/google-oauth-client/",
  authorizationEndpoint:"https://accounts.google.com/o/oauth2/auth"
});


var oauthAjax = function(options) {
  if (options.beforeSend) {
    var originalBeforeSend = options.beforeSend;
  }
  options.beforeSend = function(xhr, settings) {
    originalBeforeSend && originalBeforeSend(xhr, settings);
//    xhr.setRequestHeader('Authorization', "bearer " + options.accessToken);
  };
  return $.ajax(options);
};


var CalendarApi = (function () {

  var accessToken = "";

  return {
    setAccessToken:function (token) {
      accessToken = token;
    },

    getCalendars: function(successHandler, failureHandler) {
      oauthAjax({
        accessToken: accessToken,
        url: "https://www.googleapis.com/calendar/v3/users/me/calendarList?access_token=" + accessToken,
        success: successHandler,
        error: function(xhr, textStatus, errorThrown) {
          failureHandler(xhr.responseText);
        }
      });
    }
  };
})();

var onLogin = function (token) {
  console.log("Obtained an OAuth Access token: " + token);

  CalendarApi.setAccessToken(token);


  CalendarApi.getCalendars(
    function(data) {
      $("#output").html(data);
    },
    function(errorMsg) {
      $("#console").html(errorMsg);
    });
};

$(document).ready(function () {

  $("a#loginBtn").click(function () {
    auth.authorize();
    return false;
  });

  if (auth.isTokenPresent()) {
    var accessToken = auth.extractTokenInfo();
    onLogin(accessToken);
  }

});

/*
  Remarks:
  - geen bearer-token header support
  - registratie via: x
  - Scope: calendar API URL
*/