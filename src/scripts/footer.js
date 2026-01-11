$(`.navlink[href='${window.location.pathname}']`)?.addClass('navlink-current')

$(".row").hover(function () {
    $(this).children(`.navlink-hover`).css("opacity", 1)
}, function () {
    $(this).children(`.navlink-hover`).css("opacity", 0)
});