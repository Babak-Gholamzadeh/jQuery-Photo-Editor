$(document).ready(function() {
  $('.select-img').change(function() {
    photoEditor($(this), 500, 300, function(outputImg) {
      $('.show-img').attr('src', outputImg)
    });
  });
});
