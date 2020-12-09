import { rubi_index_to_rgb } from "./helpers.js";



// State/Globals
const IDENTITY_PERM = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
let parsed_data = {}
let selectedColor = "";
let rubik_config = [];
let rubik_config_cur = 0;

function main() {

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
    document.getElementById("demo_btn").addEventListener("click", on_demo_btn, false)
}

function arrows() {
    document.getElementById("downleft_arrow").style.backgroundImage = 'url(/static/60555.svg)'
    // document.getElementById("downleft_arrow").style.backgroundSize = '100% 100%'
    document.getElementById("downleft_arrow").style.visibility = 'visible'

}

function on_demo_btn() {
    set_perm([2, 0, 1, 16, 17, 15, 9, 10, 11, 3, 4, 5, 7, 8, 6, 14, 12, 13, 18, 19, 20, 21, 22, 23]); on_solve_btn()
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
    // The last cubie, formed by cubelets 21,22,23 is the anchor. We dont allow changing that
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
    let colors_list = read_colors()
    postAjax("/", { colors_list: JSON.stringify(colors_list) }, function (data) {
        parsed_data = JSON.parse(data)
        rubik_config = parsed_data["rubik_configs"];
        rubik_config_cur = 0;
        write_twists()
    })
}

function write_twists() {
    let twists = parsed_data['twists']
    let t_str = ""
    for (let t of twists) {
        t_str += String(t) + ' '
    }
    document.getElementById("twists_list").innerHTML = String(parsed_data["twists"])
}

function read_colors() {
    let colors_list = [];
    for (var i = 0; i < 24; i++) {
        colors_list.push(getComputedStyle(document.getElementById(String(i))).backgroundColor)
    }
    return colors_list
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
