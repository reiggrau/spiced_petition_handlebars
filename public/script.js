(function () {
    console.log("script.js linked!");

    var $headlines = $("#headlines"); // The jQuery div (element)

    var $links;
    var left;

    // Headlines content
    var htmlResults = "";

    $.ajax({
        url: "./headlines.json",
        method: "GET",
        success: function (data) {
            let styleCounter = 0;
            let newspapers = ["The New York Times", "The Wall Street Journal", "The Washington Post", "USA Today"];

            data.forEach(function (item) {
                let num = styleCounter % 4;
                htmlResults += `<a id="style${styleCounter % 4}" class="headline" target="_blank" href=${item.url}>${item.text}<b> - ${newspapers[num]}</b></a>`;
                styleCounter++;
            });

            $headlines.html(htmlResults);

            $links = $(".headline"); // The jQuery links (Array-like)red

            left = $headlines.offset().left; // The value of left at the start

            for (var i = 0; i < $links.length; i++) {
                $links[i].addEventListener("mouseenter", function (e) {
                    cancelAnimationFrame(reqId);
                    $(e.target).css({
                        /*fontWeight: "bold",*/
                        color: "blue",
                        textDecoration: "underline",
                    });
                });
                $links[i].addEventListener("mouseleave", function (e) {
                    moveHeadlines();
                    $(e.target).css({
                        fontWeight: "",
                        color: "",
                        textDecoration: "",
                    });
                });
            }

            setTimeout(moveHeadlines(), 100); // 1. This starts the process
        },
    });

    // function
    function moveHeadlines() {
        left = left - 1;

        if (left <= -$links[0].offsetWidth) {
            left = left + $links[0].offsetWidth;
            $headlines.append($links[0]);
            $links = $(".headline"); // Updates $links
        }

        $headlines.css({ left: left + "px" });
        reqId = requestAnimationFrame(moveHeadlines); // 2. This keeps it going
    }
})();
