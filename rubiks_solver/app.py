from flask import Flask, render_template, request, jsonify, app
import json
import rubik
from rubik import rgb_to_one_char_color, three_color_to_index
from bidirectinoal_bfs import bidirectional_bfs_search, rubik_list_states

app = Flask(__name__)


@app.route("/", methods=["GET", "POST"])
def index():
    if request.method == "POST":
        colors = json.loads(request.form.get("colors_list"))
        perm = rgb_arr_to_rubik_perm(colors)
        twists = [
            rubik.quarter_twists_names[t]
            for t in bidirectional_bfs_search(perm)
        ]
        rubik_configs = rubik_list_states(perm)
        print(twists)
        return {"rubik_configs": rubik_configs, "twists": twists}
    return render_template("index.html")


def rgb_arr_to_rubik_perm(rgb_arr):
    perm = []
    if len(rgb_arr) != 24:
        raise ValueError(
            "Input must be 24-color rgb array ['rgb(255, 255, 0), ...']")
    for i in range(0, 24, 3):
        col_string = ""  # For example: 'rgw'
        for j in range(i, i + 3):
            col_string += rgb_to_one_char_color[rgb_arr[j]]

        perm.extend([
            three_color_to_index[col_string],
            three_color_to_index[col_string[1:] + col_string[0]],
            three_color_to_index[col_string[2] + col_string[:2]],
        ])
    return tuple(perm)


if __name__ == "__main__":
    app.debug = True
    app.run("0.0.0.0")