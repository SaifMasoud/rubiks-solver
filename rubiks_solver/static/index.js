

rubi_index_to_rgb = {
    0: "rgb(255, 165, 0)", // Orange
    3: "rgb(255, 165, 0)",
    6: "rgb(255, 165, 0)",
    9: "rgb(255, 165, 0)",
    5: "rgb(0, 0, 255)", // Blue
    10: "rgb(0, 0, 255)",
    16: "rgb(0, 0, 255)",
    23: "rgb(0, 0, 255)",
    1: "rgb(0, 255, 0)", // Green
    8: "rgb(0, 255, 0)",
    14: "rgb(0, 255, 0)",
    19: "rgb(0, 255, 0)",
    7: "rgb(255, 255, 255)", // White
    11: "rgb(255, 255, 255)",
    20: "rgb(255, 255, 255)",
    22: "rgb(255, 255, 255)",
    2: "rgb(255, 255, 0)", // Yellow
    4: "rgb(255, 255, 0)",
    13: "rgb(255, 255, 0)",
    17: "rgb(255, 255, 0)",
    12: "rgb(255, 0, 0)", // Red
    15: "rgb(255, 0, 0)",
    18: "rgb(255, 0, 0)",
    21: "rgb(255, 0, 0)",

}

// State/Globals
const IDENTITY_PERM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
let parsed_data = {}
let selectedColor = "";
let rubik_config = [];
let rubik_config_cur = 0;

function main() {

    // TODO:
    // Render given permutations(just a list of colors) & step back & forth.
    let solveBtn = document.getElementById("solve_btn")
    solveBtn.addEventListener("click", on_solve_btn, false)

    let colorPicker = document.getElementById("color_picker")
    colorPicker.addEventListener("click", on_color_picker, true)

    let rubiks_cubelets = document.getElementsByClassName("rubiks-cubelet")
    for (var i = 0; i < rubiks_cubelets.length; i++)
        rubiks_cubelets[i].addEventListener("click", on_cubelet_click, true)

    document.getElementById("prev_btn").addEventListener("click", draw_prev, false)
    document.getElementById("next_btn").addEventListener("click", draw_next, false)
    document.getElementById("reset_btn").addEventListener("click", on_reset_btn, false)
}

function set_perm(perm) {
    // draws perm and updates state
    rubik_config_cur = 0
    rubik_config = perm
    draw_perm(rubik_config)
}

function on_reset_btn() {
    set_perm(IDENTITY_PERM)
}

function draw_prev() {
    if (rubik_config_cur > 0) {
        rubik_config_cur -= 1
        draw_perm(rubik_config[rubik_config_cur])
    }
}

function draw_next() {
    if (rubik_config_cur < rubik_config.length - 1) {
        rubik_config_cur += 1
        draw_perm(rubik_config[rubik_config_cur])
    }
}

function on_cubelet_click(event) {
    let clickedElem = event.path[0]
    // The last cubie, formed by cubelets 21,22,23 is the anchor. We dont change that
    if (selectedColor != "" && !(['21', '22', '23'].includes(clickedElem.id)))
        clickedElem.style.backgroundColor = selectedColor;
}

function on_color_picker(event) {
    let clickedElem = event.path[0];
    selectedColor = getComputedStyle(clickedElem).backgroundColor
}


function draw_perm(perm) {
    for (var i = 0; i < perm.length; i++) {
        let elem = document.getElementById(String(i))
        elem.style.backgroundColor = rubi_index_to_rgb[perm[i]];
    }
}
function on_solve_btn() {
    console.log("Pressed Solve.")
    let colors_list = [];
    for (var i = 0; i < 24; i++) {
        colors_list.push(getComputedStyle(document.getElementById(String(i))).backgroundColor)
    }
    console.log(colors_list)
    postAjax("/", { colors_list: JSON.stringify(colors_list) }, function (data) {
        parsed_data = JSON.parse(data)
        rubik_config = parsed_data["rubik_configs"];
        document.getElementById("twists_list").innerHTML = String(parsed_data["twists"])
    })
    //    on_solve_btn() // For some reason it must be "pressed" twice to work (otherwise parsed_data doesnt fill)
}

function postAjax(url, data, success) {
    var params = typeof data == 'string' ? data : Object.keys(data).map(
        function (k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }
    ).join('&');

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
    xhr.open('POST', url);
    xhr.onreadystatechange = function () {
        if (xhr.readyState > 3 && xhr.status == 200) { success(xhr.responseText); }
    };
    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(params);
    return xhr;
}

main()
