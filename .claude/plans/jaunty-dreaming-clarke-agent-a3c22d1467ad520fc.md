# Plan to Fix Issues

## 1. Randomization of Subjects
- In `js/game.js` `initializeGame()`, modify `player1` and `player2` creation to use `getRandomSubject()`.
- Add an `excludeKey` when getting P2's subject so they don't have the same subject.
- Update UI `p1-name`, `p1-avatar-text`, `p2-name`, and `p2-avatar-text` to reflect the chosen subjects.
- In `js/ui.js`, add `updateNameplates()` to set the `.innerText` of these elements, and call it from `initializeGameUI()`.

## 2. Quiz Timer Fix
- The UI timer is supposed to update visually. Right now, `qTimer` is set to `Q_MAX_TIME` in `triggerQuestionMode()`.
- But `qTimer` is never decremented in `gameLoop`!
- Need to add `qTimer` decrement logic in `gameLoop` (or a dedicated `updateQuestionTimer` called from `gameLoop`).
- When `qTimer` decreases, update the `width` of `#q-timer-fill`.
- If `qTimer` reaches 0, trigger a timeout failure in `handleAnswer` (e.g., call `handleAnswer(-1)`).
- We can add this logic in `js/ui_extend.js` or `js/game.js`.

## 3. Skill Effect Info UI
- Modify `js/ui.js` `showQuestionModal` to accept the subject object or description.
- Add `<div class="skill-effect-desc">效果：${subject.description}</div>` to the modal HTML.

## Implementation Steps
1. Edit `js/game.js`: Use random subjects and decrement `qTimer` during `gameState === "QUESTION"`.
2. Edit `js/ui.js`: Add logic to update the nameplates based on `player.subject`, update `showQuestionModal` to include the description, and add logic to update `#q-timer-fill` width based on `qTimer`.
3. Edit `js/ui_extend.js`: Ensure timeout logic correctly triggers the penalty.
