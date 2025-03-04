document.addEventListener("DOMContentLoaded", function (){
  const el = document.querySelectorAll('[data-value = "1"]');
  el.addEventListener("click", function () {
    console.log("hello");
  });
});
