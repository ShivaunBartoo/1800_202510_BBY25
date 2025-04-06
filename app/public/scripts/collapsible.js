/**
 * This script enables collapsible functionality for elements with the "collapsible" class.
 * When a collapsible element is clicked, it toggles between showing and hiding its associated content.
 *
 * This script is used on account.html
 *
 * Source: https://www.w3schools.com/howto/howto_js_collapsible.asp
 */

var coll = document.getElementsByClassName("collapsible");
var i;
// When the user clicks on the button, toggle between hiding and showing the active panel
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function () {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.maxHeight) {
            content.style.maxHeight = null;
        } else {
            //this is how it was like before, just in case having it be adaptive breaks something
            // content.style.maxHeight = content.scrollHeight + "px";
            content.style.maxHeight = "100%";
        }
    });
}
