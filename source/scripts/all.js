//= require jquery
//= require tether
//= require bootstrap/util
//= require bootstrap/tooltip
//= require_tree .

/*globals jQuery, document */
(function ($) {
    "use strict";
    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });
}(jQuery));
