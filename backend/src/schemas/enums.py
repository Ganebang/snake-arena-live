from enum import Enum


class GameMode(str, Enum):
    walls = "walls"
    pass_through = "pass-through"

class Direction(str, Enum):
    UP = "UP"
    DOWN = "DOWN"
    LEFT = "LEFT"
    RIGHT = "RIGHT"
