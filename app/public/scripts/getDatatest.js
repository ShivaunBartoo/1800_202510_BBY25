export function listen() {
  document.addEventListener("DOMContentLoaded", function (){


  const el = document.querySelectorAll('.survey-card-container');
  // console.log(el[0]);
  // while (el[0].innerHTML == "") {
  // }
  console.log(el);
  el.forEach((elem) => {
    console.log(elem.children);
  });
});
};
