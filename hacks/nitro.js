var win,
    accuracy = 100,
    t = Object.values(
        document.querySelector("div.dash-copyContainer")
    )[1].children._owner.stateNode;

win = function (r) {
    t.handleKeyPress(
        "character",
        new KeyboardEvent("keypress", {
            key: r ? t.props.lessonContent[t.typedIndex] : "$"
        })
    );
};

let m = t.input.keyHandler;

t.input.keyHandler = function (e, n) {
    if (n.key === "\n") {
        t.props.useNitro();
        return;
    }
    if (e === "character") {
        win(Math.random() < (accuracy / 100));
    }
};
