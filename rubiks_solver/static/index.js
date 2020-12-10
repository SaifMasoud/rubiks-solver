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
    clear_arrows()
    let twists = parsed_data["twists"]
    let next_twist = twists[rubik_config_cur]

    if (next_twist == "Li") {
        document.getElementById("lefti_arrow").style.backgroundImage = "url(/static/up_arrow.png)"
        document.getElementById("lefti_arrow").style.visibility = 'visible'
    }
    else if (next_twist == 'L') {
        document.getElementById("left_arrow").style.backgroundImage = "url(/static/down_arrow.png)"
        document.getElementById("left_arrow").style.visibility = 'visible'
    }
    else {
        var elems = document.getElementsByClassName(next_twist + "_arrow")
        for (let elem of elems) {
            elem.style.backgroundImage = "url(/static/" + next_twist + "_arrow.png)"
            elem.style.visibility = 'visible'
        }
    }
}

function clear_arrows() {
    let arrow_elems = document.getElementsByClassName("arrow_cubelet") // Note, they are not all classed as cubelets (doesn't matter)
    for (var i = 0; i < arrow_elems.length; i++) {
        arrow_elems[i].style.visibility = 'hidden'
    }
}

function on_demo_btn() {
    set_perm([2, 0, 1, 16, 17, 15, 7, 8, 6, 20, 18, 19, 12, 13, 14, 3, 4, 5, 9, 10, 11, 21, 22, 23])
    on_solve_btn()
}

function set_perm(perm) {
    // draws perm and updates state
    rubik_config_cur = 0
    rubik_config = perm
    draw_perm(rubik_config)
}

function on_reset_btn() {
    set_perm(IDENTITY_PERM)
    parsed_data = {}
    clear_arrows()
}

function draw_prev() {
    if (rubik_config_cur > 0) {
        rubik_config_cur -= 1
        draw_perm(rubik_config[rubik_config_cur])
    }
    arrows()
}

function draw_next() {
    if (rubik_config_cur < rubik_config.length - 1) {
        rubik_config_cur += 1
        draw_perm(rubik_config[rubik_config_cur])
    }
    arrows()
}

function on_cubelet_click(event) {
    let path = event.path || (event.composedPath && event.composedPath());
    let clickedElem = path[0]
    // The last cubie, formed by cubelets 21,22,23 is the anchor. We dont allow changing that
    if (selectedColor != "" && !(['21', '22', '23'].includes(clickedElem.id)))
        clickedElem.style.backgroundColor = selectedColor;
}

function on_color_picker(event) {
    let path = event.path || (event.composedPath && event.composedPath());
    let clickedElem = path[0];
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
        arrows()
    })
    // If parsed_data doesn't have a solution, invalid input
    if (!'twists' in parsed_data) {
        document.getElementById("status").innerHTML = "Status: Invalid Input"
    }
}

function write_twists() {
    let twists = parsed_data['twists']
    let t_str = ""
    for (let t of twists) {
        t_str += String(t) + ' '
    }
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