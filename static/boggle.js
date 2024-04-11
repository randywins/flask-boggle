//boggle game js file

class BoggleGame {
    
    constructor(boardID, seconds = 60) {
        this.seconds = seconds; //length of game
        this.showTimer();

        this.score = 0;
        this.words = new Set();
        this.board = $("#" + boardId);

        //every tick, 1000 milliseconds
        this.timer = setInterval(this.tick.bind(this), 1000);

        $(".add-word", this.board).on("submit", this.handleSubmit.bind(this));
    }

    //this function will show word in the list of words
    showWord(word) {
        $(".words", this.board).append($("<li>", {text: word}));
    }

    //this function will show the score in html
    ShowScore() {
        $(".score", this.board).text(this.score);
    }

    //This function shows a status message
    showMessage(msg, group) {
        $(".msg", this.board)
        .text(msg)
        .removeClass()
        .addClass(`msg ${group}`);
    }

    //this async function handles submission of word
    async handleSubmit(evt) {
        evt.preventDefault();
        const $word = $(".word", this.board);

        let word = $word.val();
        if (!word) 
            return;
        
        if (this.words.has(word)) {
            this.showMessage(`Already found ${word}`, "error");
            return;
        }

        //validate
        const resp = await axios.get("/check-word", { params: {word: word }});
        if (resp.data.result === "not-word") {
            this.showMessage(`${word} is not valid word`, "error");
        } else if (resp.data.result === "not-on-board") {
            this.showMessage(`${word} is not a valid word on this board`, "error");
        } else {
            this.showWord(word);
            this.score += word.length;
            this.ShowScore();
            this.words.add(word);
            this.showMessage(`Added the word ${word}`, "ok");
        }

        $word.val("").focus();
    }

    //show and update timer
    showTimer() {
        $(".timer", this.board).text(this.seconds);
    }

    //handles every second that passes in the game
    async tick() {
        this.seconds -= 1;
        this.showTimer();

        //when time runs out
        if (this.seconds === 0){
            clearInterval(this.timer);
            await this.scoreGame();
        }
    }

    //end game, this function will score and give update
    async scoreGame() {
        $(".add-word", this.board).hide();
        const resp = await axios.post("/post-score", { score: this.score });
        if(resp.data.brokeRecord) {
            this.showMessage(`New record! You scored: ${this.score}`, "ok");
        } else {
            this.showMessage(`Final score: ${this.score}`, "ok");
        }
    }
}