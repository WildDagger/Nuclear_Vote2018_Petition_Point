var boolMapInit = false
var currentPosition, markerDefault

function initMap() {
  boolMapInit = true

  getCurrentPosition().then(function (defaultPosition) {
    currentPosition = defaultPosition

    var map = new google.maps.Map(document.getElementById('map'), {
      center: defaultPosition,
      zoom: 15
    })

    markerDefault = new google.maps.Marker({
      map: map,
      position: defaultPosition,
      title: '您的位置'
    })

    if (jQuery) {
      jQueryMain(currentPosition, map, jQuery)
    }
  })
}

function getCurrentPosition() {
  return new Promise(function (resolve, reject) {
    getCurrentPositionPromise(resolve, reject)
  })
}

function getCurrentPositionPromise(resolve, reject) {
  navigator.geolocation.getCurrentPosition(function(position) {
    var pos = {
      lat: parseFloat(position.coords.latitude),
      lng: parseFloat(position.coords.longitude)
    }

    // console.log(pos)
    resolve(pos)
  }, function (err) {
    var errMsg, pos, $alert, $errMsg
    if (err.code == err.TIMEOUT) {
      errMsg = '發生逾時，將採用預設位置'
    } else if (err.code == err.PERMISSION_DENIED) {
      errMsg = '未取得授權，將採用預設位置'
    } else if (err.code == err.POSITION_UNAVAILABLE) {
      errMsg = '無法取得位置，將採用預設位置'
    } else {
      errMsg = err.message
    }

    if (jQuery) {
      (function($) {
        $errMsg = $('#errMsg')
        $alert = $('#alert')
      })(jQuery)
    }

    // 顯示錯誤通知
    if ($errMsg) {
      $errMsg.text(errMsg)
      $alert.show()
    }
    
    console.log(errMsg)

    // 將pos設定為預設位置 (台北車站)
    pos = { lat: 25.048734, lng: 121.514231 }
    resolve (pos)
  }, {
    enableHighAccuracy: true,
    maximumAge: 0
  })
}

function jQueryMain(currentPosition, map, $) {
  var $pointTitle = $('#pointTitle')
  var $pointAddress = $('#pointAddress')
  var $pointTel = $('#pointTel')
  var $pointOpenTime = $('#pointOpenTime')
  var $btnGetPointRoute = $('#getPointRoute')
  //var $btnGetNearestPoint = $('#getNearestPoint')
  var markerPoints = []

  $.each(petition_location, function(index, item) {
    var marker = new google.maps.Marker({
      map: map,
      position: item.position,
      title: item.title,
      icon: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png'
    })

    marker.addListener('click', function() {
      $pointTitle.text(item.title)
      $pointAddress.text(item.address)
      $pointTel.html('<a href="tel:' + item.tel + '">' + item.tel + "</a>")
      $pointOpenTime.text(item.openTime)
      $btnGetPointRoute.attr('href', generateDirectionUrl(currentPosition, item.position)).removeClass('disabled')

      map.setZoom(15)
      map.setCenter(marker.getPosition())
    })

    //markerPoint.push(marker)
    var markerPoint = {
      marker: marker,
      distance: CalculateGeoDistance(currentPosition.lat, currentPosition.lng, item.position.lat, item.position.lng, 'K'),
      base: item
    }

    // 判斷是否為有效點(如時間尚未過期等)，有效則加入列表等待排序
    markerPoints.push(markerPoint)
  })

  markerPoints.sort(function(a, b) {
    return a.distance - b.distance
  })

  $pointTitle.text(markerPoints[0].base.title)
  $pointAddress.text(markerPoints[0].base.address)
  $pointTel.html('<a href="tel:' + markerPoints[0].tel + '">' + markerPoints[0].base.tel + "</a>")
  $pointOpenTime.text(markerPoints[0].base.openTime)
  $btnGetPointRoute.attr('href', generateDirectionUrl(currentPosition, markerPoints[0].base.position)).removeClass('disabled')

  var linkPath = new google.maps.Polyline({
    path: [
      currentPosition,
      markerPoints[0].base.position
    ],
    geodesic: true,
    strokeColor: '#ff0000',
    strokeOpacity: 1.0,
    strokeWeight: 2
  })

  linkPath.setMap(map)

  // console.log(markerPoint)

  /*
  $btnGetNearestPoint.on('click', function(e) {
    e.preventDefault()
    alert('本功能尚未實裝')
  })
  */

  function searchNearestPoint(currentPosition) {
    //
  }

  function generateDirectionUrl(oriPos, desPos) {
    var urlDirection = 'https://www.google.com/maps/dir/?api=1&origin={ori_lat},{ori_lng}&destination={des_lat},{des_lng}'

    return urlDirection.replace('{ori_lat}', oriPos.lat)
                       .replace('{ori_lng}', oriPos.lng)
                       .replace('{des_lat}', desPos.lat)
                       .replace('{des_lng}', desPos.lng)
  }
}