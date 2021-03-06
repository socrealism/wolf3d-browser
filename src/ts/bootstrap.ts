(function ($) {

    // these files are preloaded while the title screen is showing
    const files = [
        "js/wolf.js",
        "js/random.js",
        "js/angle.js",
        "js/math.js",
        "js/input.js",
        "js/sound.js",
        "js/menu.js",
        "js/fs.js",
        "js/game.js",
        "js/player.js",
        "js/sprites.js",
        "js/powerups.js",
        "js/ai.js",
        "js/actorai.js",
        "js/actors.js",
        "js/actstat.js",
        "js/weapon.js",
        "js/doors.js",
        "js/pushwall.js",
        "js/areas.js",
        "js/level.js",
        "js/raycaster.js",
        "js/renderer.js",

        "js/episodes.js",
        "js/maps.js",

        "preload!assets/art/menubg_main.png",
        "preload!assets/art/menuitems.png",
        "preload!assets/art/menuselector.png"

    ];

    // these files are preloaded in the background after the menu is displayed.
    // only non-essential files here
    const files2 = [
        "preload!assets/art/menubg_episodes.png",
        "preload!assets/art/menuitems_episodes.png",
        "preload!assets/art/menubg_skill.png",
        "preload!assets/art/menubg_levels.png",
        "preload!assets/art/menuitems_levels.png",
        "preload!assets/art/skillfaces.png",
        "preload!assets/art/getpsyched.png",
        "preload!assets/art/menubg_control.png",
        "preload!assets/art/menulight.png",
        "preload!assets/art/menubg_customize.png",
        "preload!assets/art/control_keys.png",
        "preload!assets/art/confirm_newgame.png",
        "preload!assets/art/paused.png"
    ];

    $(document).ready(function () {

        let progress = $("<div>"),
            n = 0;

        progress.addClass("load-progress").appendTo("#title-screen");
        $("#title-screen").show();


        yepnope.addPrefix("preload", function (resource) {
            resource.noexec = true;
            resource.instead = function (input, callback) {
                const image = new Image();

                image.onload = callback;
                image.onerror = callback;
                image.src = input.substr(input.lastIndexOf("!") + 1);
            };
            return resource;
        });


        Modernizr.load([
            {
                load: files,
                callback: function (file) {
                    progress.width((++n / files.length) * 100 + "%");
                },
                complete: function () {
                    progress.remove();
                    $("#title-screen").fadeOut(1500, function () {
                        Menu.show();
                    });
                    // preload non-essential art
                    Modernizr.load(files2);
                }
            }
        ]);
    });

})(jQuery);