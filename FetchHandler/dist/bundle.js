'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var fetchResponseHandlerInstance = function fetchResponseHandler(request) {
  var refreshToken = function refreshToken() {
    return new Promise(function (resolve, reject) {
      fetchResponseHandler.defaults.AuthManagerBridge.refreshToken().then(function (response) {
        //refresh-token-interval-number5
        //we refresh request so it get new auth value if refreshed token
        request.refresh(); //resend request to get response

        fetch(request.request).then(function (response) {
          //refresh-token-interval-number6
          resolve(response);
        }).catch(function (e) {
          reject(e);
        });
      }).catch(function (e) {
        fetchResponseHandlerInstance.defaults.AuthManagerBridge.logout();
      });
    });
  };

  var handleExpiredToken = function handleExpiredToken(response) {
    return new Promise(function (resolve, reject) {
      //refresh-token-interval-number2
      if (response.status == 401) {
        //if we had a expierd token
        //we refresh the request token 
        //resend the request to server
        //return response
        console.log('token is refreshed in' + new Date());
        refreshToken().then(function (responseOfRefreshedTokenRequest) {
          //refresh-token-interval-number7
          response = responseOfRefreshedTokenRequest;
          resolve(response);
        }).catch(function (e) {
          reject(e);
        });
      } else {
        resolve(response);
      }
    });
  };

  return function (response) {
    return new Promise(function (mainResolve, mainReject) {
      //refresh-token-interval-number1
      var isExpiredTokenHandeled = handleExpiredToken(response);
      Promise.all([isExpiredTokenHandeled]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1),
            response = _ref2[0];

        //refresh-token-interval-number3
        if (response.ok) {
          var contentType = response.headers.get('content-type');

          if (contentType && contentType.indexOf('application/json') !== -1) {
            //refresh-token-interval-number4
            mainResolve(response.json());
          } else {
            //if response is not json and mostly empty
            if (contentType && contentType.indexOf("image/") !== -1) {
              //if response is image file
              //we retuarn image base64 data
              response.arrayBuffer().then(function (data) {
                var base64 = btoa(new Uint8Array(data).reduce(function (data, byte) {
                  return data + String.fromCharCode(byte);
                }, ''));
                mainResolve("data:".concat(contentType, ";base64,") + base64);
              }); // mainResolve( response.arrayBuffer());
            } else {
              mainResolve({});
            }
          }
        } else {
          if (response.status == 502) {
            return mainReject({
              errorMessage: 'خطای 502  ، سرور یا در حال به روز رسانی است یا دچار اشکال شده است'
            });
          }

          return response.json().then(function (e) {
            mainReject(e);
          });
        }
      });
    });
  };
};

fetchResponseHandlerInstance.defaults = {
  AuthManagerBridge: undefined
};

function fetchErrorHandler(data) {
  var showMessage = window.showMessage ? window.showMessage : null;

  if (!showMessage) {
    //if we are not in react panel and show message is invalid (show message is defined in bidopin panel master class)
    var showMessage = function showMessage(message) {
      //TODO: use exception handler here
      alert(message);
    };
  }

  if (data.errorMessage) {
    showMessage(data.errorMessage, 'error', data);

    if (data.errors) {
      for (var i in data.errors) {
        showMessage(data.errors[i]);
      }
    }
  } else {
    if (data.message) {
      showMessage(data.message, 'error', data);
    }
  }
}

exports.fetchResponseHandler = fetchResponseHandlerInstance;
exports.fetchErrorHandler = fetchErrorHandler;