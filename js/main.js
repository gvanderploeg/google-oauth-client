/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Configuration of our OAuth library.
var auth = new OAuth({
  context:window,
  scope:"https://www.googleapis.com/auth/calendar",
  clientId:"147381402418.apps.googleusercontent.com",
  redirectUri:"http://www.geertvanderploeg.com/google-oauth-client/",
  authorizationEndpoint:"https://accounts.google.com/o/oauth2/auth"
});

// Overriding a jQuery default beforeSend, to append an access token header
var oauthAjax = function(options) {
  if (options.beforeSend) {
    var originalBeforeSend = options.beforeSend;
  }
  options.beforeSend = function(xhr, settings) {
    originalBeforeSend && originalBeforeSend(xhr, settings);
    xhr.setRequestHeader('Authorization', "Bearer " + options.accessToken);
  };
  return $.ajax(options);
};

// Very simple Calendar api.
var CalendarApi = (function () {

  var accessToken = "";

  return {
    setAccessToken:function (token) {
      accessToken = token;
    },

    getCalendars: function(successHandler, failureHandler) {
      oauthAjax({
        accessToken: accessToken,
        url: "https://www.googleapis.com/calendar/v3/users/me/calendarList",
        dataType: "json",
        success: successHandler,
        error: function(xhr, textStatus, errorThrown) {
          failureHandler(xhr.responseText);
        }
      });
    }
  };
})();

// Event handler after having retrieved an access token
var onLogin = function (token) {

  console.log("Obtained an OAuth Access token: " + token);

  CalendarApi.setAccessToken(token);

  // Get a list of calendars and create a table with information on them.
  CalendarApi.getCalendars(
    function(data) {
      var table = $("<table class='table' />")
        .append($("<thead />")
        .append("<th>ID</th>")
        .append("<th>Summary</th>")
        .append("<th>Description</th>")
        .append("<th>Color</th>")
      );

      for (var i = 0; i< data['items'].length; i++) {
        var item = data['items'][i];
        table
          .append(
            $("<tr />")
            .append($("<td />").append(item.id))
            .append($("<td />").append(item.summary))
            .append($("<td />").append(item.description))
            .append($("<td style='color: " + item.backgroundColor + "'>" + item.backgroundColor + "</td>"))
        );
      }
      // Put it in the #output div.
      $("div#output").html(table);
    },
    function(errorMsg) {
      // in case something went wrong, display the error.
      $("#console").html(errorMsg);
    });
};

$(document).ready(function () {
  if (auth.isTokenPresent()) {
    // apparently we got back control after authentication
    var accessToken = auth.extractTokenInfo();
    onLogin(accessToken); // fire event
  }

  // Attach click handler
  $("a#loginBtn").click(function () {
    auth.authorize(); // Start the OAuth-flow. This will lose control
    return false; // prevent default.
  });
});
