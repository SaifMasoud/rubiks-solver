from rubik import perm_apply, perm_inverse
import rubik
from collections import deque

GODS_NUMBER = 14


def bidirectional_bfs_search(
        start,
        end=rubik.I,
        next_fun=lambda x: [(rubik.perm_apply(t, x), t)
                            for t in rubik.quarter_twists],
        rev_edge=lambda e: rubik.perm_inverse(e),
):
    """ next_fun should return a list of tuples [(neighbour, edge)].
        rev_edge should return the reverse of an edge (so we can reverse when joining final path)
        """
    # Setup
    print(f"Start: {start}")
    if start == end:
        return []
    move_before = {start: None}  # Gets the last move before given state.
    move_before_reverse = {
        end: None
    }  # Same but for the opposite end of the search.
    # When we do the search, this lets us know which dictionary to use. (reverse or not.)
    forward, backward = (
        (start, move_before, move_before_reverse),
        (end, move_before_reverse, move_before),
    )

    # Search
    q = deque([forward, backward, None])  # None helps keep track of level
    for i in range(GODS_NUMBER // 2):
        while True:
            node = q.popleft()
            if node is None:
                q.append(None)
                break
            cur_state, cur_moves, other_moves = node[0], node[1], node[2]
            for next_state, edge in next_fun(cur_state):
                if next_state in cur_moves:
                    continue  # We already recorded this state.
                cur_moves[next_state] = edge
                q.append((next_state, cur_moves, other_moves))
                # next_state is the common 'middle' node, and we have to join 2 paths to find it.
                if next_state in other_moves:
                    first_path = _path(start, next_state, move_before,
                                       rev_edge)
                    second_path = _path(end, next_state, move_before_reverse,
                                        rev_edge)
                    second_path.reverse()
                    return first_path + [rev_edge(e) for e in second_path]
    raise ValueError("Invalid starting point")


def _path(start, end, moves, rev_edge_func):
    p = []
    cur = end
    while moves[cur]:
        move_before = moves[cur]
        p.append(move_before)
        # Apply the inverse of the move before to get to the previous state.
        cur = perm_apply(rev_edge_func(move_before), cur)
    return p[::-1]


def rubik_list_states(start):
    """ Gives all the states of the rubiks during solution rather than what twists to make."""
    path_twists = bidirectional_bfs_search(start)
    rubik_configs = [start]
    for twist in path_twists:
        rubik_configs.append(perm_apply(twist, rubik_configs[-1]))
    return rubik_configs


if __name__ == "__main__":
    nei_fun = lambda node: [(perm_apply(twist, node), twist)
                            for twist in rubik.quarter_twists]
    rev_fun = lambda edge: perm_inverse(edge)
    twists = rubik.quarter_twists
    f, fi, l, li, u, ui = rubik.quarter_twists

    end = rubik.I
    start = (
        7,
        8,
        6,
        20,
        18,
        19,
        3,
        4,
        5,
        16,
        17,
        15,
        0,
        1,
        2,
        14,
        12,
        13,
        10,
        11,
        9,
        21,
        22,
        23,
    )

    print([
        rubik.quarter_twists_names[t]
        for t in bidirectional_bfs_search(start, end, nei_fun, rev_fun)
    ])
