function find(xpath) {
    var result = $.xpath(xpath);
    if (result.length != 0) {
        $.each(result, function (key, value) {
            $(value).addClass("highlight");
        });
        console.log("Found: " + result.length);
        console.log(result);
    } else {
        console.log("[WARN] No match!");
    }
}

$(function () {
    $("head").append("<style type='text/css'>.highlight { background: rgba(237, 194, 20, .25) !important; border: 1px solid rgb(237, 194, 20) !important;</style>");
});
