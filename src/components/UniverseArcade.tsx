"use client";
import { useEffect, useRef, useState } from "react";
import { Chess, type Square, type PieceSymbol } from "chess.js";
import s from "./Universe.module.css";

const pieces: Record<string, string> = {
  wk: "♔",
  wq: "♕",
  wr: "♖",
  wb: "♗",
  wn: "♘",
  wp: "♙",
  bk: "♚",
  bq: "♛",
  br: "♜",
  bb: "♝",
  bn: "♞",
  bp: "♟",
};
const names: Record<string, string> = {
  k: "king",
  q: "queen",
  r: "rook",
  b: "bishop",
  n: "knight",
  p: "pawn",
};
function ChessRoom() {
  const [game, setGame] = useState(() => new Chess());
  const [selected, setSelected] = useState<Square | null>(null);
  const [promotion, setPromotion] = useState<{
    from: Square;
    to: Square;
  } | null>(null);
  const [flipped, setFlipped] = useState(false);
  const legal = selected ? game.moves({ square: selected, verbose: true }) : [];
  const board = game.board().flat();
  if (flipped) board.reverse();
  const history = game.history();
  function move(from: Square, to: Square, promote: PieceSymbol = "q") {
    const next = new Chess(game.fen());
    try {
      next.move({ from, to, promotion: promote });
      const replay = new Chess();
      game.history().forEach((m) => replay.move(m));
      replay.move({ from, to, promotion: promote });
      setGame(replay);
      setSelected(null);
      setPromotion(null);
    } catch {
      setSelected(null);
    }
  }
  function choose(square: Square) {
    if (promotion || game.isGameOver()) return;
    const target = legal.find((m) => m.to === square);
    if (selected && target) {
      if (target.isPromotion()) setPromotion({ from: selected, to: square });
      else move(selected, square);
    } else setSelected(game.get(square)?.color === game.turn() ? square : null);
  }
  const status = game.isCheckmate()
    ? `${game.turn() === "w" ? "Black" : "White"} wins by checkmate`
    : game.isDraw()
      ? "Draw — start another round"
      : `${game.turn() === "w" ? "White" : "Black"} to move${game.isCheck() ? " · Check!" : ""}`;
  return (
    <div className={s.chessLayout}>
      <div className={s.board}>
        {board.map((piece, i) => {
          const actual = flipped ? 63 - i : i;
          const square =
            `${"abcdefgh"[actual % 8]}${8 - Math.floor(actual / 8)}` as Square;
          const possible = legal.some((m) => m.to === square);
          return (
            <button
              key={square}
              onClick={() => choose(square)}
              className={`${s.square} ${(Math.floor(actual / 8) + actual) % 2 === 0 ? s.lightSquare : s.darkSquare} ${selected === square ? s.selectedSquare : ""}`}
              aria-label={`${square}${piece ? ` ${piece.color === "w" ? "white" : "black"} ${names[piece.type]}` : " empty"}${possible ? ", legal move" : ""}`}
              aria-pressed={selected === square}
            >
              <span
                className={piece?.color === "w" ? s.whitePiece : s.blackPiece}
              >
                {piece ? pieces[piece.color + piece.type] : ""}
              </span>
              {possible && <i className={s.legalDot} />}
              <small>{square}</small>
            </button>
          );
        })}
      </div>
      <div className={s.gameSidebar}>
        <span className={s.eyebrow}>THE BOARD ROOM</span>
        <h3>Your move.</h3>
        <p>
          Local two-player chess. Select a piece, then a highlighted square.
          Castling, en passant, promotion, and checkmate are supported.
        </p>
        <strong className={s.gameStatus} aria-live="polite">
          {status}
        </strong>
        {promotion && (
          <div role="group" aria-label="Choose promotion piece">
            {(["q", "r", "b", "n"] as const).map((p) => (
              <button
                className={s.gameButton}
                key={p}
                onClick={() => move(promotion.from, promotion.to, p)}
              >
                {names[p]}
              </button>
            ))}
          </div>
        )}
        <div className={s.gameControls}>
          <button
            className={s.gameButton}
            disabled={!history.length}
            onClick={() => {
              const next = new Chess();
              history.slice(0, -1).forEach((m) => next.move(m));
              setGame(next);
              setSelected(null);
              setPromotion(null);
            }}
          >
            Undo
          </button>
          <button className={s.gameButton} onClick={() => setFlipped(!flipped)}>
            Flip board
          </button>
          <button
            className={s.gameButton}
            onClick={() => {
              setGame(new Chess());
              setSelected(null);
              setPromotion(null);
            }}
          >
            New game
          </button>
        </div>
        <div className={s.moveHistory} aria-label="Move history">
          {history.length
            ? history.map((m, i) => (
                <span key={i}>
                  {i % 2 === 0 ? `${Math.floor(i / 2) + 1}. ` : ""}
                  {m}
                </span>
              ))
            : "The board is yours. White moves first."}
        </div>
      </div>
    </div>
  );
}
const icons = ["✳", "◈", "☀", "✦", "♞", "◎"];
const initialCards = [0, 3, 1, 5, 2, 4, 3, 0, 4, 2, 5, 1];
function MemoryRoom() {
  const [cards, setCards] = useState(initialCards);
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  useEffect(() => {
    if (open.length !== 2) return;
    const timer = setTimeout(() => {
      if (cards[open[0]] === cards[open[1]])
        setMatched((old) => [...old, ...open]);
      setOpen([]);
    }, 650);
    return () => clearTimeout(timer);
  }, [open, cards]);
  function reset() {
    const deck = [...initialCards];
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setMatched([]);
    setOpen([]);
    setMoves(0);
  }
  return (
    <div className={s.chessLayout}>
      <div className={s.memoryGrid}>
        {cards.map((v, i) => (
          <button
            key={i}
            className={s.memoryCard}
            data-revealed={open.includes(i) || matched.includes(i)}
            disabled={
              matched.includes(i) || open.includes(i) || open.length === 2
            }
            aria-label={
              open.includes(i) || matched.includes(i)
                ? `Card ${i + 1}: ${icons[v]}`
                : `Reveal card ${i + 1}`
            }
            onClick={() => {
              setOpen([...open, i]);
              if (open.length === 1) setMoves(moves + 1);
            }}
          >
            {open.includes(i) || matched.includes(i) ? icons[v] : "?"}
          </button>
        ))}
      </div>
      <div className={s.gameSidebar}>
        <span className={s.eyebrow}>MEMORY PROTOCOL</span>
        <h3>Find your match.</h3>
        <p>
          Six pairs. Twelve cards. Turn over two at a time and see how much you
          can keep in your head.
        </p>
        <strong className={s.gameStatus} aria-live="polite">
          {matched.length === 12
            ? `All matched in ${moves} moves!`
            : `${matched.length / 2} / 6 pairs · ${moves} moves`}
        </strong>
        <button className={s.gameButton} onClick={reset}>
          Shuffle &amp; restart ↻
        </button>
      </div>
    </div>
  );
}
const passage =
  "Great things are built by people who stay curious. Make something small, make it work, and make it matter. Then begin again.";
function TypingRoom() {
  const [text, setText] = useState("");
  const [seconds, setSeconds] = useState(0);
  const start = useRef<number | null>(null);
  const done = text === passage;
  useEffect(() => {
    if (!text || done) return;
    const timer = setInterval(
      () =>
        setSeconds(
          Math.max(
            1,
            Math.floor((Date.now() - (start.current ?? Date.now())) / 1000),
          ),
        ),
      250,
    );
    return () => clearInterval(timer);
  }, [text, done]);
  const correct = [...text].filter((c, i) => c === passage[i]).length;
  return (
    <div className={s.typing}>
      <div className={s.typeStats}>
        <span>
          {seconds}s <small>ELAPSED</small>
        </span>
        <span>
          {seconds ? Math.round(correct / 5 / (seconds / 60)) : 0}{" "}
          <small>WPM</small>
        </span>
        <span>
          {text.length ? Math.round((correct / text.length) * 100) : 100}%{" "}
          <small>ACCURACY</small>
        </span>
      </div>
      <p className={s.passage}>
        {[...passage].map((c, i) => (
          <span
            key={i}
            data-state={
              i < text.length
                ? c === text[i]
                  ? "correct"
                  : "wrong"
                : "pending"
            }
          >
            {c}
          </span>
        ))}
      </p>
      <label className={s.eyebrow} htmlFor="type-rush">
        {done ? "FINISHED — NICE WORK!" : "TYPE THE PASSAGE BELOW"}
      </label>
      <textarea
        id="type-rush"
        value={text}
        disabled={done}
        onPaste={(e) => e.preventDefault()}
        spellCheck={false}
        autoComplete="off"
        maxLength={passage.length}
        onChange={(e) => {
          if (!start.current) start.current = Date.now();
          setText(e.target.value);
        }}
        placeholder="Your first keystroke starts the clock…"
      />
      <button
        className={s.gameButton}
        onClick={() => {
          setText("");
          setSeconds(0);
          start.current = null;
        }}
      >
        Start again ↻
      </button>
    </div>
  );
}
export function Arcade() {
  const [room, setRoom] = useState("chess");
  return (
    <div className={s.arcade}>
      <div className={s.gameTabs} role="tablist" aria-label="Choose a game">
        {[
          ["chess", "♞", "Chess club"],
          ["memory", "◈", "Memory protocol"],
          ["typing", "⌨", "Type / rush"],
        ].map(([id, icon, label]) => (
          <button
            key={id}
            id={`tab-${id}`}
            role="tab"
            aria-selected={room === id}
            aria-controls={`room-${id}`}
            onClick={() => setRoom(id)}
          >
            <span>{icon}</span>
            {label}
            <small>PLAY NOW ↗</small>
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`room-${room}`}
        aria-labelledby={`tab-${room}`}
        className={s.gameRoom}
      >
        {room === "chess" ? (
          <ChessRoom />
        ) : room === "memory" ? (
          <MemoryRoom />
        ) : (
          <TypingRoom />
        )}
      </div>
      <div className={s.arcadeFoot}>
        <span>BUILT FOR A LITTLE FRIENDLY COMPETITION.</span>
        <span>LOCAL PLAY / NO ACCOUNT NEEDED</span>
      </div>
    </div>
  );
}
