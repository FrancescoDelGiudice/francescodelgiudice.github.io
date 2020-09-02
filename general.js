const header = $('header')
$(window).scroll(function () {
  const scroll = $(window).scrollTop()
  if (scroll >= 10) {
    header.removeClass('top-page').addClass('scrolled')
  } else {
    header.removeClass('scrolled').addClass('top-page')
  }
})

$(document).ready(function () {
  $('a.anchor').bind('click', function (e) {
    e.preventDefault() // prevent hard jump, the default behavior

    var target = $(this).attr('href') // Set the target as variable

    // perform animated scrolling by getting top-position of target-element and set it as scroll target
    $('html, body').stop().animate({
      scrollTop: $(target).offset().top
    }, 600, function () {
      location.hash = target // attach the hash (#jumptarget) to the pageurl
    })

    return false
  })
})

$(window).scroll(function () {
  var scrollDistance = $(window).scrollTop()

  // Assign active class to nav links while scolling
  $('.page-section').each(function (i) {
    if ($(this).position().top <= scrollDistance) {
      $('a.anchor.active').removeClass('active')
      $('a.anchor').eq(i).addClass('active')
    }
  })
}).scroll()

$(document).scroll(function (e) {
  $.each($('section'), function (index, section) {
    if ($(this).scrollTop() >= section.getBoundingClientRect().top && $(this).scrollTop() <= section.getBoundingClientRect().bottom) {
      if ($(section).hasClass('light-bg')) {
        $('header').removeClass('light')
        $('header').addClass('dark')
      } else {
        $('header').removeClass('dark')
        $('header').addClass('light')
      }
    }
  })
})

AOS.init()
